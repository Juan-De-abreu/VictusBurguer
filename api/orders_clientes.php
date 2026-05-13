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

try {
    switch ($method) {
        case 'GET':
            $orderId = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;

            if ($orderId > 0) {
                $stmt = $pdo->prepare("SELECT * FROM orders_clientes inner JOIN users WHERE users.user_id = orders_clientes.user_id");
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

            if (!$orderId || $newStatus === '') {
                http_response_code(422);
                echo json_encode(['error' => 'order_id y payment_status requeridos'], JSON_UNESCAPED_UNICODE);
                break;
            }

            if (!isValidOrderStatus($newStatus)) {
                http_response_code(422);
                echo json_encode(['error' => 'Estado inválido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("UPDATE orders_clientes SET payment_status = :payment_status WHERE order_id = :order_id");
            $stmt->execute([
                ':payment_status' => $newStatus,
                ':order_id' => $orderId
            ]);

            if ($newStatus === 'pagada') {
                $stmtOrder = $pdo->prepare("SELECT * FROM orders_clientes WHERE order_id = :order_id");
                $stmtOrder->execute([':order_id' => $orderId]);
                $order = $stmtOrder->fetch(PDO::FETCH_ASSOC);

                if ($order) {
                    createInvoiceForClientOrder($pdo, $order);
                }
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