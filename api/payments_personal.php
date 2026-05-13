<?php
require_once __DIR__ . '/../config/database.php';
session_start();

header('Content-Type: application/json; charset=utf-8');

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

function isValidPaymentStatus($status) {
    return in_array($status, ['pendiente', 'pagada', 'anulada'], true);
}

function isValidCurrency($currency) {
    return in_array($currency, ['USD', 'VES'], true);
}

function createInvoiceForPersonalPayment(PDO $pdo, array $payment): int
{
    $paymentId = (int)$payment['payment_id'];

    $check = $pdo->prepare("SELECT invoice_id FROM invoices WHERE customer_name = :customer_name AND invoice_number LIKE :invoice_like LIMIT 1");
    $check->execute([
        ':customer_name' => $payment['employee_name'],
        ':invoice_like' => 'FAC-' . date('Y') . '-P-' . str_pad((string)$paymentId, 4, '0', STR_PAD_LEFT) . '%'
    ]);

    $exists = $check->fetch(PDO::FETCH_ASSOC);
    if ($exists) {
        return (int)$exists['invoice_id'];
    }

    $invoiceNumber = 'FAC-' . date('Y') . '-P-' . str_pad((string)$paymentId, 4, '0', STR_PAD_LEFT);
    $controlNumber = 'CNT-P-' . str_pad((string)$paymentId, 4, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO invoices
        (invoice_number, control_number, order_id, customer_name, customer_cedula, customer_email, customer_phone,
         currency, exchange_rate, subtotal, tax_total, total, issue_date, status, pdf_url, image_url)
        VALUES
        (:invoice_number, :control_number, 0, :customer_name, :customer_cedula, NULL, NULL,
         :currency, NULL, :subtotal, 0, :total, NOW(), 'pagada', NULL, NULL)
    ");

    $stmt->execute([
        ':invoice_number' => $invoiceNumber,
        ':control_number' => $controlNumber,
        ':customer_name' => $payment['employee_name'],
        ':customer_cedula' => $payment['employee_cedula'] ?? '',
        ':currency' => $payment['currency'],
        ':subtotal' => $payment['amount'],
        ':total' => $payment['amount'],
    ]);

    return (int)$pdo->lastInsertId();
}

try {
    switch ($method) {
        case 'GET':
            $paymentId = isset($_GET['payment_id']) ? (int)$_GET['payment_id'] : 0;

            if ($paymentId > 0) {
                $stmt = $pdo->prepare("SELECT * FROM payments_personal WHERE payment_id = :payment_id");
                $stmt->bindValue(':payment_id', $paymentId, PDO::PARAM_INT);
                $stmt->execute();
                echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: [], JSON_UNESCAPED_UNICODE);
                break;
            }

            $status = trim($_GET['payment_status'] ?? '');
            $type = trim($_GET['payment_type'] ?? '');
            $employee = trim($_GET['employee_name'] ?? '');

            $query = "SELECT * FROM payments_personal WHERE 1=1";
            $params = [];

            if ($status !== '') {
                $query .= " AND payment_status = :payment_status";
                $params[':payment_status'] = $status;
            }

            if ($type !== '') {
                $query .= " AND payment_type = :payment_type";
                $params[':payment_type'] = $type;
            }

            if ($employee !== '') {
                $query .= " AND employee_name LIKE :employee_name";
                $params[':employee_name'] = "%{$employee}%";
            }

            $query .= " ORDER BY created_at DESC";
            $stmt = $pdo->prepare($query);
            foreach ($params as $k => $v) {
                $stmt->bindValue($k, $v);
            }
            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'JSON inválido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $employeeName = trim($data['employee_name'] ?? '');
            $employeeCedula = trim($data['employee_cedula'] ?? '');
            $roleName = trim($data['role_name'] ?? '');
            $paymentType = trim($data['payment_type'] ?? 'sueldo');
            $paymentStatus = trim($data['payment_status'] ?? 'pendiente');
            $currency = trim($data['currency'] ?? 'USD');
            $paymentMethod = trim($data['payment_method'] ?? '');
            $amount = (float)($data['amount'] ?? 0);
            $description = trim($data['description'] ?? '');
            $paidAt = !empty($data['paid_at']) ? $data['paid_at'] : null;

            if ($employeeName === '' || $amount <= 0 || !isValidCurrency($currency) || !isValidPaymentStatus($paymentStatus)) {
                http_response_code(422);
                echo json_encode(['error' => 'Datos inválidos o incompletos'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("
                INSERT INTO payments_personal
                (employee_name, employee_cedula, role_name, payment_type, payment_status, currency, payment_method, amount, description, paid_at)
                VALUES
                (:employee_name, :employee_cedula, :role_name, :payment_type, :payment_status, :currency, :payment_method, :amount, :description, :paid_at)
            ");
            $stmt->execute([
                ':employee_name' => $employeeName,
                ':employee_cedula' => $employeeCedula !== '' ? $employeeCedula : null,
                ':role_name' => $roleName !== '' ? $roleName : null,
                ':payment_type' => $paymentType,
                ':payment_status' => $paymentStatus,
                ':currency' => $currency,
                ':payment_method' => $paymentMethod !== '' ? $paymentMethod : null,
                ':amount' => $amount,
                ':description' => $description !== '' ? $description : null,
                ':paid_at' => $paidAt,
            ]);

            $paymentId = (int)$pdo->lastInsertId();
            $invoiceId = null;

            if ($paymentStatus === 'pagada') {
                $payment = [
                    'payment_id' => $paymentId,
                    'employee_name' => $employeeName,
                    'employee_cedula' => $employeeCedula,
                    'currency' => $currency,
                    'amount' => $amount
                ];
                $invoiceId = createInvoiceForPersonalPayment($pdo, $payment);
            }

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Pago creado',
                'payment_id' => $paymentId,
                'invoice_id' => $invoiceId
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'PUT':
            parse_str(file_get_contents("php://input"), $data);
            $paymentId = isset($data['payment_id']) ? (int)$data['payment_id'] : 0;
            $newStatus = trim($data['payment_status'] ?? '');
            if (!$paymentId) {
                http_response_code(422);
                echo json_encode(['error' => 'payment_id requerido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $fields = [];
            $params = [':payment_id' => $paymentId];

            foreach (['employee_name', 'employee_cedula', 'role_name', 'payment_type', 'currency', 'payment_method', 'amount', 'description', 'paid_at'] as $field) {
                if (isset($data[$field]) && $data[$field] !== '') {
                    $fields[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            if ($newStatus !== '') {
                if (!isValidPaymentStatus($newStatus)) {
                    http_response_code(422);
                    echo json_encode(['error' => 'payment_status inválido'], JSON_UNESCAPED_UNICODE);
                    break;
                }
                $fields[] = "payment_status = :payment_status";
                $params[':payment_status'] = $newStatus;
            }

            if (empty($fields)) {
                http_response_code(422);
                echo json_encode(['error' => 'No hay campos para actualizar'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("UPDATE payments_personal SET " . implode(', ', $fields) . " WHERE payment_id = :payment_id");
            $stmt->execute($params);

            if ($newStatus === 'pagada') {
                $stmtCheck = $pdo->prepare("SELECT * FROM payments_personal WHERE payment_id = :payment_id");
                $stmtCheck->execute([':payment_id' => $paymentId]);
                $payment = $stmtCheck->fetch(PDO::FETCH_ASSOC);

                if ($payment) {
                    $stmtInv = $pdo->prepare("SELECT invoice_id FROM invoices WHERE invoice_number = :invoice_number LIMIT 1");
                    $stmtInv->execute([
                        ':invoice_number' => 'FAC-' . date('Y') . '-P-' . str_pad((string)$paymentId, 4, '0', STR_PAD_LEFT)
                    ]);
                    $existing = $stmtInv->fetch(PDO::FETCH_ASSOC);

                    if (!$existing) {
                        createInvoiceForPersonalPayment($pdo, $payment);
                    }
                }
            }

            $pdo->commit();

            echo json_encode(['success' => true, 'message' => 'Pago actualizado'], JSON_UNESCAPED_UNICODE);
            break;

        case 'DELETE':
            parse_str(file_get_contents("php://input"), $data);
            $paymentId = isset($data['payment_id']) ? (int)$data['payment_id'] : 0;

            if (!$paymentId) {
                http_response_code(422);
                echo json_encode(['error' => 'payment_id requerido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("DELETE FROM payments_personal WHERE payment_id = :payment_id");
            $stmt->execute([':payment_id' => $paymentId]);

            $pdo->commit();

            echo json_encode(['success' => true, 'message' => 'Pago eliminado'], JSON_UNESCAPED_UNICODE);
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