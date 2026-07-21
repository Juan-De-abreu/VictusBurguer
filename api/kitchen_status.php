<?php
require_once __DIR__ . '/../config/database.php';
session_start();

header('Content-Type: application/json; charset=utf-8');

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

function isValidOrderStatus($status) {
    return in_array($status, ['pendiente', 'pagada', 'rechazada', 'anulada'], true);
}

function isValidKitchenStatus($status) {
    return in_array($status, ['pendiente', 'en_cocina', 'cocinado', 'entregado', 'cancelado'], true);
}

function createInvoiceForClientOrder(PDO $pdo, array $order): int
{
    $orderId = (int)$order['order_id'];

    $check = $pdo->prepare("SELECT invoice_id FROM invoices WHERE order_id = :order_id LIMIT 1");
    $check->execute([':order_id' => $orderId]);
    $exists = $check->fetch(PDO::FETCH_ASSOC);
    if ($exists) return (int)$exists['invoice_id'];

    $invoiceNumber = 'FAC-' . date('Y') . '-' . str_pad((string)$orderId, 5, '0', STR_PAD_LEFT);
    $controlNumber = 'CNT-' . str_pad((string)$orderId, 5, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO invoices
        (invoice_number, control_number, order_id, customer_name, customer_cedula, customer_email, customer_phone,
         currency, exchange_rate, subtotal, tax_total, total, issue_date, status, pdf_url, image_url)
        VALUES
        (:invoice_number, :control_number, :order_id, :customer_name, :customer_cedula, :customer_email, :customer_phone,
         :currency, :exchange_rate, :subtotal, :tax_total, :total, NOW(), 'pagada', NULL, NULL)
    ");

    $stmt->execute([
        ':invoice_number' => $invoiceNumber,
        ':control_number' => $controlNumber,
        ':order_id' => $orderId,
        ':customer_name' => $order['customer_name'] ?? '',
        ':customer_cedula' => $order['customer_cedula'] ?? '',
        ':customer_email' => $order['customer_email'] ?? null,
        ':customer_phone' => $order['customer_phone'] ?? null,
        ':currency' => $order['currency'] ?? 'USD',
        ':exchange_rate' => $order['exchange_rate'] ?? null,
        ':subtotal' => $order['subtotal'] ?? 0,
        ':tax_total' => $order['tax_total'] ?? 0,
        ':total' => $order['total'] ?? 0,
    ]);

    return (int)$pdo->lastInsertId();
}

function calcularRequeridosBOM(PDO $pdo, int $orderId): array
{
    $stmtItems = $pdo->prepare("
        SELECT product_id, quantity
        FROM order_items_clientes
        WHERE order_id = :order_id
    ");
    $stmtItems->execute([':order_id' => $orderId]);
    $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

    if (!$items) {
        throw new Exception('La orden no tiene productos');
    }

    $required = [];

    foreach ($items as $item) {
        $productId = (int)$item['product_id'];
        $orderQty = (int)$item['quantity'];

        $stmtBom = $pdo->prepare("
            SELECT item_id, quantity_required
            FROM product_bom
            WHERE product_id = :product_id AND active = 1
        ");
        $stmtBom->execute([':product_id' => $productId]);
        $bom = $stmtBom->fetchAll(PDO::FETCH_ASSOC);

        if (!$bom) {
            throw new Exception("El producto {$productId} no tiene BOM configurado");
        }

        foreach ($bom as $line) {
            $itemId = (int)$line['item_id'];
            $qtyNeeded = (float)$line['quantity_required'] * $orderQty;
            $required[$itemId] = ($required[$itemId] ?? 0) + $qtyNeeded;
        }
    }

    return $required;
}

function consumirInsumosPorOrdenCliente(PDO $pdo, int $orderId, ?int $userId = null): void
{
    $required = calcularRequeridosBOM($pdo, $orderId);

    foreach ($required as $itemId => $qtyNeeded) {
        $stmtInv = $pdo->prepare("
            SELECT item_id, nombre, stock_on_hand, stock_reserved, stock_min
            FROM inventory_items
            WHERE item_id = :item_id
            FOR UPDATE
        ");
        $stmtInv->execute([':item_id' => $itemId]);
        $inv = $stmtInv->fetch(PDO::FETCH_ASSOC);

        if (!$inv) {
            throw new Exception("Ítem de inventario no encontrado: {$itemId}");
        }

        $available = (float)$inv['stock_on_hand'] - (float)$inv['stock_reserved'];

        if ($available < $qtyNeeded) {
            throw new Exception("Stock insuficiente para {$inv['nombre']}");
        }
    }

    foreach ($required as $itemId => $qtyNeeded) {
        $upd = $pdo->prepare("
            UPDATE inventory_items
            SET stock_on_hand = stock_on_hand - :qty
            WHERE item_id = :item_id
        ");
        $upd->execute([
            ':qty' => $qtyNeeded,
            ':item_id' => $itemId
        ]);

        $stmtInv = $pdo->prepare("
            SELECT nombre, stock_on_hand, stock_reserved, stock_min
            FROM inventory_items
            WHERE item_id = :item_id
        ");
        $stmtInv->execute([':item_id' => $itemId]);
        $inv = $stmtInv->fetch(PDO::FETCH_ASSOC);

        $mov = $pdo->prepare("
            INSERT INTO inventory_movements
            (item_id, movement_type, quantity, reference_type, reference_id, notes, created_by)
            VALUES (:item_id, 'out', :quantity, 'order_cliente', :reference_id, :notes, :created_by)
        ");
        $mov->execute([
            ':item_id' => $itemId,
            ':quantity' => $qtyNeeded,
            ':reference_id' => $orderId,
            ':notes' => 'Descuento automático por orden pagada',
            ':created_by' => $userId
        ]);

        $availableAfter = (float)$inv['stock_on_hand'] - (float)$inv['stock_reserved'] - $qtyNeeded;

        if ($availableAfter <= 0) {
            $alertType = 'out_of_stock';
            $severity = 'critical';
            $message = "Agotado: {$inv['nombre']}";
        } elseif ($availableAfter <= 1000) {
            $alertType = 'low_stock';
            $severity = 'high';
            $message = "Stock urgente: {$inv['nombre']} quedó en {$availableAfter}";
        } else {
            $alertType = null;
        }

        if ($alertType) {
            $check = $pdo->prepare("
                SELECT alert_id
                FROM inventory_alerts
                WHERE item_id = :item_id AND status = 'open' AND alert_type = :alert_type
                LIMIT 1
            ");
            $check->execute([
                ':item_id' => $itemId,
                ':alert_type' => $alertType
            ]);

            if (!$check->fetch()) {
                $ins = $pdo->prepare("
                    INSERT INTO inventory_alerts
                    (item_id, alert_type, message, status, severity)
                    VALUES (:item_id, :alert_type, :message, 'open', :severity)
                ");
                $ins->execute([
                    ':item_id' => $itemId,
                    ':alert_type' => $alertType,
                    ':message' => $message,
                    ':severity' => $severity
                ]);
            }
        }
    }

    $audit = $pdo->prepare("
        INSERT INTO inventory_audit_log
        (entity_type, entity_id, action, before_data, after_data, user_id)
        VALUES ('orders_clientes', :entity_id, 'consume_bom', NULL, :after_data, :user_id)
    ");
    $audit->execute([
        ':entity_id' => $orderId,
        ':after_data' => json_encode($required, JSON_UNESCAPED_UNICODE),
        ':user_id' => $userId
    ]);
}

function devolverInsumosPorOrdenCliente(PDO $pdo, int $orderId, ?int $userId = null): void
{
    $stmtOrder = $pdo->prepare("
        SELECT order_id, kitchen_status
        FROM orders_clientes
        WHERE order_id = :order_id
        FOR UPDATE
    ");
    $stmtOrder->execute([':order_id' => $orderId]);
    $order = $stmtOrder->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        throw new Exception('Orden no encontrada');
    }

    $kitchenStatus = $order['kitchen_status'] ?? 'pendiente';
    if (in_array($kitchenStatus, ['cocinado', 'entregado'], true)) {
        throw new Exception('La orden ya fue cocinada, no se puede devolver stock');
    }

    $required = calcularRequeridosBOM($pdo, $orderId);

    foreach ($required as $itemId => $qtyToReturn) {
        $stmtInv = $pdo->prepare("
            SELECT item_id, nombre
            FROM inventory_items
            WHERE item_id = :item_id
            FOR UPDATE
        ");
        $stmtInv->execute([':item_id' => $itemId]);
        $inv = $stmtInv->fetch(PDO::FETCH_ASSOC);

        if (!$inv) {
            throw new Exception("Ítem de inventario no encontrado: {$itemId}");
        }

        $upd = $pdo->prepare("
            UPDATE inventory_items
            SET stock_on_hand = stock_on_hand + :qty
            WHERE item_id = :item_id
        ");
        $upd->execute([
            ':qty' => $qtyToReturn,
            ':item_id' => $itemId
        ]);

        $mov = $pdo->prepare("
            INSERT INTO inventory_movements
            (item_id, movement_type, quantity, reference_type, reference_id, notes, created_by)
            VALUES (:item_id, 'in', :quantity, 'order_cancelled', :reference_id, :notes, :created_by)
        ");
        $mov->execute([
            ':item_id' => $itemId,
            ':quantity' => $qtyToReturn,
            ':reference_id' => $orderId,
            ':notes' => 'Devolución automática por anulación de orden antes de cocción',
            ':created_by' => $userId
        ]);
    }

    $audit = $pdo->prepare("
        INSERT INTO inventory_audit_log
        (entity_type, entity_id, action, before_data, after_data, user_id)
        VALUES ('orders_clientes', :entity_id, 'return_bom', NULL, :after_data, :user_id)
    ");
    $audit->execute([
        ':entity_id' => $orderId,
        ':after_data' => json_encode($required, JSON_UNESCAPED_UNICODE),
        ':user_id' => $userId
    ]);
}

try {
    switch ($method) {
        case 'GET':
            $orderId = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;

            if ($orderId > 0) {
                $stmt = $pdo->prepare("
                    SELECT oc.*, u.*
                    FROM orders_clientes oc
                    LEFT JOIN users u ON u.user_id = oc.user_id
                    WHERE oc.order_id = :order_id
                    LIMIT 1
                ");
                $stmt->execute([':order_id' => $orderId]);
                echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: [], JSON_UNESCAPED_UNICODE);
                break;
            }

            $stmt = $pdo->query("SELECT * FROM orders_clientes ORDER BY created_at DESC, order_id DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
            break;

        case 'POST':
            http_response_code(405);
            echo json_encode(['error' => 'Usa el flujo de creación de pedidos'], JSON_UNESCAPED_UNICODE);
            break;

        case 'PUT':
            parse_str(file_get_contents("php://input"), $data);

            $orderId = isset($data['order_id']) ? (int)$data['order_id'] : 0;
            $newStatus = trim($data['payment_status'] ?? '');
            $newKitchenStatus = trim($data['kitchen_status'] ?? '');
            $userId = isset($data['user_id']) ? (int)$data['user_id'] : null;

            if (!$orderId) {
                http_response_code(422);
                echo json_encode(['error' => 'order_id requerido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            if ($newStatus === '' && $newKitchenStatus === '') {
                http_response_code(422);
                echo json_encode(['error' => 'payment_status o kitchen_status requerido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            if ($newStatus !== '' && !isValidOrderStatus($newStatus)) {
                http_response_code(422);
                echo json_encode(['error' => 'Estado de pago inválido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            if ($newKitchenStatus !== '' && !isValidKitchenStatus($newKitchenStatus)) {
                http_response_code(422);
                echo json_encode(['error' => 'Estado de cocina inválido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $pdo->beginTransaction();

            $stmtOrder = $pdo->prepare("
                SELECT *
                FROM orders_clientes
                WHERE order_id = :order_id
                FOR UPDATE
            ");
            $stmtOrder->execute([':order_id' => $orderId]);
            $order = $stmtOrder->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                throw new Exception('Orden no encontrada');
            }

            $currentStatus = $order['payment_status'];

            if ($newStatus !== '') {
                $upd = $pdo->prepare("
                    UPDATE orders_clientes
                    SET payment_status = :payment_status
                    WHERE order_id = :order_id
                ");
                $upd->execute([
                    ':payment_status' => $newStatus,
                    ':order_id' => $orderId
                ]);
            }

            if ($newKitchenStatus !== '') {
                if ($order['payment_status'] !== 'pagada' && $newKitchenStatus !== 'pendiente') {
                    throw new Exception('Solo las órdenes pagadas pueden pasar a cocina');
                }

                $updKitchen = $pdo->prepare("
                    UPDATE orders_clientes
                    SET kitchen_status = :kitchen_status
                    WHERE order_id = :order_id
                ");
                $updKitchen->execute([
                    ':kitchen_status' => $newKitchenStatus,
                    ':order_id' => $orderId
                ]);
            }

            if ($newStatus === 'pagada' && $currentStatus !== 'pagada') {
                $invoiceId = createInvoiceForClientOrder($pdo, $order);
                $updInv = $pdo->prepare("
                    UPDATE orders_clientes
                    SET invoice_id = :invoice_id
                    WHERE order_id = :order_id
                ");
                $updInv->execute([
                    ':invoice_id' => $invoiceId,
                    ':order_id' => $orderId
                ]);

                consumirInsumosPorOrdenCliente($pdo, $orderId, $userId);

                $updKitchen = $pdo->prepare("
                    UPDATE orders_clientes
                    SET kitchen_status = 'pendiente'
                    WHERE order_id = :order_id
                ");
                $updKitchen->execute([':order_id' => $orderId]);
            }

            if ($newStatus === 'anulada') {
                if ($order['payment_status'] === 'pagada') {
                    devolverInsumosPorOrdenCliente($pdo, $orderId, $userId);
                }

                $updKitchen = $pdo->prepare("
                    UPDATE orders_clientes
                    SET kitchen_status = 'cancelado'
                    WHERE order_id = :order_id
                ");
                $updKitchen->execute([':order_id' => $orderId]);
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Orden actualizada'], JSON_UNESCAPED_UNICODE);
            break;

        case 'DELETE':
            http_response_code(405);
            echo json_encode(['error' => 'No permitido'], JSON_UNESCAPED_UNICODE);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
    }
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>