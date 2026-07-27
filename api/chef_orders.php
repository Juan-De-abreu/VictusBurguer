<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

function jsonInput(): array {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function getUserId(array $data): ?int {
    return isset($data['chef_user_id']) ? (int)$data['chef_user_id'] : null;
}

function respond($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getOrderItems(PDO $pdo, int $orderId): array {
    $stmt = $pdo->prepare("
        SELECT order_item_id, order_id, product_id, product_name, quantity, unit_price, line_total
        FROM order_items_clientes
        WHERE order_id = :order_id
        ORDER BY order_item_id ASC
    ");
    $stmt->execute([':order_id' => $orderId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
}

function ensureNotificationTable(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS order_notifications (
            notification_id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            user_id INT NOT NULL,
            message VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL DEFAULT 'info',
            is_read TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
}

function insertNotification(PDO $pdo, int $orderId, int $userId, string $message, string $type = 'info'): void {
    $stmt = $pdo->prepare("
        INSERT INTO order_notifications (order_id, user_id, message, type, is_read)
        VALUES (:order_id, :user_id, :message, :type, 0)
    ");
    $stmt->execute([
        ':order_id' => $orderId,
        ':user_id' => $userId,
        ':message' => $message,
        ':type' => $type,
    ]);
}

function getAssignedMinutes(?string $assignedAt): int {
    if (!$assignedAt) return 0;
    $ts = strtotime($assignedAt);
    if ($ts === false) return 0;
    return (int)floor((time() - $ts) / 60);
}

try {
    ensureNotificationTable($pdo);

    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'pending';
        $chefUserId = isset($_GET['chef_user_id']) ? (int)$_GET['chef_user_id'] : 0;

        if ($action === 'pending') {
            $stmt = $pdo->prepare("
                SELECT
                    o.order_id,
                    o.order_number,
                    o.user_id,
                    o.total,
                    o.payment_status,
                    o.kitchen_status,
                    o.chef_user_id,
                    o.assigned_at,
                    o.created_at,
                    COALESCE(SUM(oi.quantity), 0) AS total_items,
                    COUNT(oi.order_item_id) AS items_count
                FROM orders_clientes o
                LEFT JOIN order_items_clientes oi ON oi.order_id = o.order_id
                WHERE o.payment_status = 'pagada'
                  AND o.kitchen_status = 'pendiente'
                GROUP BY o.order_id
                ORDER BY o.created_at ASC, o.order_id ASC
            ");
            $stmt->execute();
            respond(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'mine') {
            if ($chefUserId <= 0) respond(['success' => false, 'error' => 'chef_user_id requerido'], 422);

            $stmt = $pdo->prepare("
                SELECT
                    o.order_id,
                    o.order_number,
                    o.user_id,
                    o.total,
                    o.payment_status,
                    o.kitchen_status,
                    o.chef_user_id,
                    o.assigned_at,
                    o.cooked_at,
                    o.served_at,
                    o.created_at,
                    COALESCE(SUM(oi.quantity), 0) AS total_items,
                    COUNT(oi.order_item_id) AS items_count
                FROM orders_clientes o
                LEFT JOIN order_items_clientes oi ON oi.order_id = o.order_id
                WHERE o.payment_status = 'pagada'
                  AND o.chef_user_id = :chef_user_id
                  AND o.kitchen_status = 'en_cocina'
                GROUP BY o.order_id
                ORDER BY o.assigned_at ASC, o.order_id ASC
            ");
            $stmt->execute([':chef_user_id' => $chefUserId]);
            respond(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'completed') {
            if ($chefUserId <= 0) respond(['success' => false, 'error' => 'chef_user_id requerido'], 422);

            $stmt = $pdo->prepare("
                SELECT
                    o.order_id,
                    o.order_number,
                    o.user_id,
                    o.total,
                    o.payment_status,
                    o.kitchen_status,
                    o.chef_user_id,
                    o.assigned_at,
                    o.cooked_at,
                    o.served_at,
                    o.created_at,
                    COALESCE(SUM(oi.quantity), 0) AS total_items,
                    COUNT(oi.order_item_id) AS items_count
                FROM orders_clientes o
                LEFT JOIN order_items_clientes oi ON oi.order_id = o.order_id
                WHERE o.chef_user_id = :chef_user_id
                  AND o.kitchen_status IN ('cocinado','entregado')
                GROUP BY o.order_id
                ORDER BY COALESCE(o.cooked_at, o.assigned_at, o.created_at) DESC
            ");
            $stmt->execute([':chef_user_id' => $chefUserId]);
            respond(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'detail') {
            $orderId = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;
            if ($orderId <= 0) respond(['success' => false, 'error' => 'order_id requerido'], 422);

            $stmt = $pdo->prepare("
                SELECT
                    order_id, user_id, invoice_id, order_number, order_type,
                    payment_status, currency, payment_method, subtotal, tax_total,
                    discount_total, total, created_at, updated_at,
                    kitchen_status, cooked_at, served_at, assigned_at, chef_user_id, kitchen_notes
                FROM orders_clientes
                WHERE order_id = :order_id
                LIMIT 1
            ");
            $stmt->execute([':order_id' => $orderId]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) respond(['success' => false, 'error' => 'Orden no encontrada'], 404);

            $items = getOrderItems($pdo, $orderId);

            respond([
                'success' => true,
                'data' => [
                    'order' => $order,
                    'items' => $items
                ]
            ]);
        }

        respond(['success' => false, 'error' => 'Acción inválida'], 400);
    }

    if ($method === 'PUT') {
        $data = jsonInput();
        $orderId = isset($data['order_id']) ? (int)$data['order_id'] : 0;
        $action = trim((string)($data['action'] ?? ''));
        $chefUserId = getUserId($data);
        $notes = trim((string)($data['kitchen_notes'] ?? ''));

        if ($orderId <= 0) respond(['success' => false, 'error' => 'order_id requerido'], 422);
        if ($action === '') respond(['success' => false, 'error' => 'action requerido'], 422);

        $pdo->beginTransaction();

        $stmt = $pdo->prepare("
            SELECT order_id, user_id, payment_status, kitchen_status, chef_user_id, assigned_at
            FROM orders_clientes
            WHERE order_id = :order_id
            FOR UPDATE
        ");
        $stmt->execute([':order_id' => $orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            $pdo->rollBack();
            respond(['success' => false, 'error' => 'Orden no encontrada'], 404);
        }

        if ($action === 'assign') {
            if ($chefUserId === null || $chefUserId <= 0) {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'chef_user_id requerido'], 422);
            }

            if ($order['payment_status'] !== 'pagada') {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'Solo órdenes pagadas pueden entrar a cocina'], 422);
            }

            if ($order['kitchen_status'] !== 'pendiente') {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'La orden ya fue tomada o procesada'], 422);
            }

            $upd = $pdo->prepare("
                UPDATE orders_clientes
                SET kitchen_status = 'en_cocina',
                    chef_user_id = :chef_user_id,
                    assigned_at = NOW(),
                    kitchen_notes = CASE
                        WHEN :kitchen_notes = '' THEN kitchen_notes
                        ELSE :kitchen_notes
                    END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_id = :order_id
            ");
            $upd->execute([
                ':chef_user_id' => $chefUserId,
                ':kitchen_notes' => $notes,
                ':order_id' => $orderId
            ]);

            $pdo->commit();
            respond(['success' => true, 'message' => 'Orden asignada al chef']);
        }

        if ($action === 'abandon') {
            if ($chefUserId === null || $chefUserId <= 0) {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'chef_user_id requerido'], 422);
            }

            if ((int)$order['chef_user_id'] !== $chefUserId) {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'Esta orden no te pertenece'], 403);
            }

            if ($order['kitchen_status'] !== 'en_cocina') {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'Solo puedes abandonar una orden en cocina'], 422);
            }

            $upd = $pdo->prepare("
                UPDATE orders_clientes
                SET kitchen_status = 'pendiente',
                    chef_user_id = NULL,
                    assigned_at = NULL,
                    kitchen_notes = CASE
                        WHEN :kitchen_notes = '' THEN kitchen_notes
                        ELSE :kitchen_notes
                    END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_id = :order_id
            ");
            $upd->execute([
                ':kitchen_notes' => $notes,
                ':order_id' => $orderId
            ]);

            $pdo->commit();
            respond(['success' => true, 'message' => 'Orden liberada y devuelta a pendientes']);
        }

        if ($action === 'start') {
            if ($chefUserId === null || $chefUserId <= 0) {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'chef_user_id requerido'], 422);
            }

            if ((int)$order['chef_user_id'] !== $chefUserId) {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'Esta orden no te pertenece'], 403);
            }

            if (!in_array($order['kitchen_status'], ['pendiente', 'en_cocina'], true)) {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'No se puede iniciar esta orden'], 422);
            }

            $upd = $pdo->prepare("
                UPDATE orders_clientes
                SET kitchen_status = 'en_cocina',
                    chef_user_id = COALESCE(chef_user_id, :chef_user_id),
                    assigned_at = COALESCE(assigned_at, NOW()),
                    kitchen_notes = CASE
                        WHEN :kitchen_notes = '' THEN kitchen_notes
                        ELSE :kitchen_notes
                    END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_id = :order_id
            ");
            $upd->execute([
                ':chef_user_id' => $chefUserId,
                ':kitchen_notes' => $notes,
                ':order_id' => $orderId
            ]);

            $pdo->commit();
            respond(['success' => true, 'message' => 'Orden en preparación']);
        }

        if ($action === 'complete') {
            if ($chefUserId === null || $chefUserId <= 0) {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'chef_user_id requerido'], 422);
            }

            if ((int)$order['chef_user_id'] !== $chefUserId) {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'Esta orden no te pertenece'], 403);
            }

            if ($order['kitchen_status'] !== 'en_cocina') {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'Solo puedes culminar una orden en cocina'], 422);
            }

            $elapsedMinutes = getAssignedMinutes($order['assigned_at']);
            $isDelayed = $elapsedMinutes > 20;

            $upd = $pdo->prepare("
                UPDATE orders_clientes
                SET kitchen_status = 'cocinado',
                    cooked_at = NOW(),
                    kitchen_notes = CASE
                        WHEN :kitchen_notes = '' THEN kitchen_notes
                        ELSE :kitchen_notes
                    END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_id = :order_id
            ");
            $upd->execute([
                ':kitchen_notes' => $notes,
                ':order_id' => $orderId
            ]);

            if ($isDelayed) {
                insertNotification(
                    $pdo,
                    $orderId,
                    (int)$order['user_id'],
                    'Disculpe la tardanza hemos tenido ligeras complicaciones en su preparación',
                    'delay'
                );
            }

            insertNotification(
                $pdo,
                $orderId,
                (int)$order['user_id'],
                'su orden esta lista',
                'ready'
            );

            $pdo->commit();
            respond([
                'success' => true,
                'message' => 'Orden culminada',
                'elapsed_minutes' => $elapsedMinutes,
                'delayed' => $isDelayed
            ]);
        }

        if ($action === 'deliver') {
            if ($chefUserId === null || $chefUserId <= 0) {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'chef_user_id requerido'], 422);
            }

            if ((int)$order['chef_user_id'] !== $chefUserId) {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'Esta orden no te pertenece'], 403);
            }

            if ($order['kitchen_status'] !== 'cocinado') {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'Solo puedes entregar una orden cocinada'], 422);
            }

            $upd = $pdo->prepare("
                UPDATE orders_clientes
                SET kitchen_status = 'entregado',
                    served_at = NOW(),
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_id = :order_id
            ");
            $upd->execute([':order_id' => $orderId]);

            $pdo->commit();
            respond(['success' => true, 'message' => 'Orden entregada']);
        }

        if ($action === 'cancel_kitchen') {
            $upd = $pdo->prepare("
                UPDATE orders_clientes
                SET kitchen_status = 'cancelado',
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_id = :order_id
            ");
            $upd->execute([':order_id' => $orderId]);

            $pdo->commit();
            respond(['success' => true, 'message' => 'Orden cancelada en cocina']);
        }

        $pdo->rollBack();
        respond(['success' => false, 'error' => 'Acción no válida'], 400);
    }

    respond(['success' => false, 'error' => 'Método no permitido'], 405);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    respond(['success' => false, 'error' => $e->getMessage()], 500);
}
?>