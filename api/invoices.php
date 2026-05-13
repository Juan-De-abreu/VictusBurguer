<?php
require_once __DIR__ . '/../config/database.php';
session_start();

header('Content-Type: application/json; charset=utf-8');

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $invoiceId = isset($_GET['invoice_id']) ? (int)$_GET['invoice_id'] : 0;

            if ($invoiceId > 0) {
                $stmt = $pdo->prepare("SELECT * FROM invoices WHERE invoice_id = :invoice_id");
                $stmt->bindValue(':invoice_id', $invoiceId, PDO::PARAM_INT);
                $stmt->execute();
                echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: [], JSON_UNESCAPED_UNICODE);
                break;
            }

            $query = "SELECT * FROM invoices ORDER BY issue_date DESC, invoice_id DESC";
            $stmt = $pdo->query($query);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'JSON inválido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $required = [
                'invoice_number', 'control_number', 'customer_name',
                'customer_cedula', 'currency', 'subtotal', 'tax_total', 'total'
            ];

            foreach ($required as $field) {
                if (!isset($data[$field]) || $data[$field] === '') {
                    http_response_code(422);
                    echo json_encode(['error' => "Campo requerido: {$field}"], JSON_UNESCAPED_UNICODE);
                    break 2;
                }
            }

            $stmt = $pdo->prepare("
                INSERT INTO invoices
                (invoice_number, control_number, order_id, customer_name, customer_cedula, customer_email, customer_phone,
                 currency, exchange_rate, subtotal, tax_total, total, issue_date, status, pdf_url, image_url)
                VALUES
                (:invoice_number, :control_number, :order_id, :customer_name, :customer_cedula, :customer_email, :customer_phone,
                 :currency, :exchange_rate, :subtotal, :tax_total, :total, NOW(), :status, :pdf_url, :image_url)
            ");

            $stmt->execute([
                ':invoice_number' => trim($data['invoice_number']),
                ':control_number' => trim($data['control_number']),
                ':order_id' => isset($data['order_id']) ? (int)$data['order_id'] : 0,
                ':customer_name' => trim($data['customer_name']),
                ':customer_cedula' => trim($data['customer_cedula']),
                ':customer_email' => $data['customer_email'] ?? null,
                ':customer_phone' => $data['customer_phone'] ?? null,
                ':currency' => $data['currency'],
                ':exchange_rate' => isset($data['exchange_rate']) && $data['exchange_rate'] !== '' ? $data['exchange_rate'] : null,
                ':subtotal' => $data['subtotal'],
                ':tax_total' => $data['tax_total'],
                ':total' => $data['total'],
                ':status' => in_array(($data['status'] ?? 'emitida'), ['emitida', 'pagada', 'anulada'], true) ? $data['status'] : 'emitida',
                ':pdf_url' => $data['pdf_url'] ?? null,
                ':image_url' => $data['image_url'] ?? null,
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Factura creada',
                'invoice_id' => (int)$pdo->lastInsertId()
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'PUT':
            http_response_code(405);
            echo json_encode(['error' => 'No permitido. Las facturas no se editan manualmente.'], JSON_UNESCAPED_UNICODE);
            break;

        case 'DELETE':
            http_response_code(405);
            echo json_encode(['error' => 'No permitido.'], JSON_UNESCAPED_UNICODE);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>