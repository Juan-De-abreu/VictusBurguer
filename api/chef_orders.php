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

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'pending';
        $chefUserId = isset($_GET['chef_user_id']) ? (int)$_GET['chef_user_id'] : 0;

        if ($action === 'pending') {
            $stmt = $pdo->prepare("
                SELECT order_id, customer_name, total, payment_status, kitchen_status, created_at
                FROM orders_clientes
                WHERE payment_status = 'pagada'
                  AND kitchen_status = 'pendiente'
                ORDER BY created_at ASC, order_id ASC
            ");
            $stmt->execute();
            respond(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'mine') {
            if ($chefUserId <= 0) respond(['success' => false, 'error' => 'chef_user_id requerido'], 422);

            $stmt = $pdo->prepare("
                SELECT order_id, customer_name, total, payment_status, kitchen_status, chef_user_id, cooked_at, served_at, created_at
                FROM orders_clientes
                WHERE payment_status = 'pagada'
                  AND chef_user_id = :chef_user_id
                  AND kitchen_status IN ('en_cocina')
                ORDER BY created_at ASC, order_id ASC
            ");
            $stmt->execute([':chef_user_id' => $chefUserId]);
            respond(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'completed') {
            if ($chefUserId <= 0) respond(['success' => false, 'error' => 'chef_user_id requerido'], 422);

            $stmt = $pdo->prepare("
                SELECT order_id, customer_name, total, payment_status, kitchen_status, chef_user_id, cooked_at, served_at, created_at
                FROM orders_clientes
                WHERE chef_user_id = :chef_user_id
                  AND kitchen_status IN ('cocinado','entregado')
                ORDER BY COALESCE(cooked_at, created_at) DESC
            ");
            $stmt->execute([':chef_user_id' => $chefUserId]);
            respond(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'detail') {
            $orderId = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;
            if ($orderId <= 0) respond(['success' => false, 'error' => 'order_id requerido'], 422);

            $stmt = $pdo->prepare("
                SELECT *
                FROM orders_clientes
                WHERE order_id = :order_id
                LIMIT 1
            ");
            $stmt->execute([':order_id' => $orderId]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) respond(['success' => false, 'error' => 'Orden no encontrada'], 404);

            $items = $pdo->prepare("
                SELECT *
                FROM order_items_clientes
                WHERE order_id = :order_id
                ORDER BY id ASC
            ");
            $items->execute([':order_id' => $orderId]);

            respond([
                'success' => true,
                'data' => [
                    'order' => $order,
                    'items' => $items->fetchAll(PDO::FETCH_ASSOC)
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

        $stmt = $pdo->prepare("
            SELECT order_id, payment_status, kitchen_status, chef_user_id
            FROM orders_clientes
            WHERE order_id = :order_id
            FOR UPDATE
        ");
        $pdo->beginTransaction();
        $stmt->execute([':order_id' => $orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            $pdo->rollBack();
            respond(['success' => false, 'error' => 'Orden no encontrada'], 404);
        }

        if ($order['payment_status'] !== 'pagada') {
            $pdo->rollBack();
            respond(['success' => false, 'error' => 'Solo órdenes pagadas pueden entrar a cocina'], 422);
        }

        if ($action === 'assign') {
            if ($chefUserId === null || $chefUserId <= 0) {
                $pdo->rollBack();
                respond(['success' => false, 'error' => 'chef_user_id requerido'], 422);
            }

            $upd = $pdo->prepare("
                UPDATE orders_clientes
                SET kitchen_status = 'en_cocina',
                    chef_user_id = :chef_user_id,
                    kitchen_notes = CASE
                        WHEN :kitchen_notes = '' THEN kitchen_notes
                        ELSE :kitchen_notes
                    END
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

        if ($action === 'start') {
            $upd = $pdo->prepare("
                UPDATE orders_clientes
                SET kitchen_status = 'en_cocina',
                    chef_user_id = COALESCE(chef_user_id, :chef_user_id),
                    kitchen_notes = CASE
                        WHEN :kitchen_notes = '' THEN kitchen_notes
                        ELSE :kitchen_notes
                    END
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
            $upd = $pdo->prepare("
                UPDATE orders_clientes
                SET kitchen_status = 'cocinado',
                    cooked_at = NOW(),
                    kitchen_notes = CASE
                        WHEN :kitchen_notes = '' THEN kitchen_notes
                        ELSE :kitchen_notes
                    END
                WHERE order_id = :order_id
            ");
            $upd->execute([
                ':kitchen_notes' => $notes,
                ':order_id' => $orderId
            ]);

            $pdo->commit();
            respond(['success' => true, 'message' => 'Orden culminada']);
        }

        if ($action === 'deliver') {
            $upd = $pdo->prepare("
                UPDATE orders_clientes
                SET kitchen_status = 'entregado',
                    served_at = NOW()
                WHERE order_id = :order_id
            ");
            $upd->execute([':order_id' => $orderId]);

            $pdo->commit();
            respond(['success' => true, 'message' => 'Orden entregada']);
        }

        if ($action === 'cancel_kitchen') {
            $upd = $pdo->prepare("
                UPDATE orders_clientes
                SET kitchen_status = 'cancelado'
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