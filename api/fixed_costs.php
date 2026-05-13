<?php
require_once __DIR__ . '/../config/database.php';
session_start();

header('Content-Type: application/json; charset=utf-8');

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

function isValidFixedCostStatus($status) {
    return in_array($status, ['pendiente', 'pagada', 'anulada'], true);
}

function addOneMonthPreserveDay(string $date): string {
    $dt = new DateTime($date);
    $day = (int)$dt->format('d');
    $dt->modify('first day of next month');
    $lastDay = (int)$dt->format('t');
    $dt->setDate((int)$dt->format('Y'), (int)$dt->format('m'), min($day, $lastDay));
    return $dt->format('Y-m-d');
}

try {
    switch ($method) {
        case 'GET':
            $costId = isset($_GET['cost_id']) ? (int)$_GET['cost_id'] : 0;

            if ($costId > 0) {
                $stmt = $pdo->prepare("SELECT * FROM fixed_costs WHERE cost_id = :cost_id");
                $stmt->execute([':cost_id' => $costId]);
                echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: [], JSON_UNESCAPED_UNICODE);
                break;
            }

            $stmt = $pdo->query("SELECT * FROM fixed_costs ORDER BY created_at DESC, cost_id DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'JSON inválido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $costName = trim($data['cost_name'] ?? '');
            $costCategory = trim($data['cost_category'] ?? 'otros');
            $supplierName = trim($data['supplier_name'] ?? '');
            $invoiceNumber = trim($data['invoice_number'] ?? '');
            $paymentStatus = trim($data['payment_status'] ?? 'pendiente');
            $currency = trim($data['currency'] ?? 'USD');
            $amount = (float)($data['amount'] ?? 0);
            $dueDate = trim($data['due_date'] ?? '');
            $paidDate = !empty($data['paid_date']) ? $data['paid_date'] : null;
            $description = trim($data['description'] ?? '');

            if ($costName === '' || $amount <= 0 || $dueDate === '' || !isValidFixedCostStatus($paymentStatus)) {
                http_response_code(422);
                echo json_encode(['error' => 'Datos inválidos o incompletos'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $stmt = $pdo->prepare("
                INSERT INTO fixed_costs
                (cost_name, cost_category, supplier_name, invoice_number, payment_status, currency, amount, due_date, paid_date, description)
                VALUES
                (:cost_name, :cost_category, :supplier_name, :invoice_number, :payment_status, :currency, :amount, :due_date, :paid_date, :description)
            ");
            $stmt->execute([
                ':cost_name' => $costName,
                ':cost_category' => $costCategory,
                ':supplier_name' => $supplierName !== '' ? $supplierName : null,
                ':invoice_number' => $invoiceNumber !== '' ? $invoiceNumber : null,
                ':payment_status' => $paymentStatus,
                ':currency' => $currency,
                ':amount' => $amount,
                ':due_date' => $dueDate,
                ':paid_date' => $paidDate,
                ':description' => $description !== '' ? $description : null,
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Costo fijo creado',
                'cost_id' => (int)$pdo->lastInsertId()
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'PUT':
            parse_str(file_get_contents("php://input"), $data);
            $costId = isset($data['cost_id']) ? (int)$data['cost_id'] : 0;

            if (!$costId) {
                http_response_code(422);
                echo json_encode(['error' => 'cost_id requerido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $stmtCurrent = $pdo->prepare("SELECT * FROM fixed_costs WHERE cost_id = :cost_id");
            $stmtCurrent->execute([':cost_id' => $costId]);
            $current = $stmtCurrent->fetch(PDO::FETCH_ASSOC);

            if (!$current) {
                http_response_code(404);
                echo json_encode(['error' => 'Costo fijo no encontrado'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $newStatus = isset($data['payment_status']) ? trim($data['payment_status']) : $current['payment_status'];
            if ($newStatus !== '' && !isValidFixedCostStatus($newStatus)) {
                http_response_code(422);
                echo json_encode(['error' => 'payment_status inválido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $fields = [];
            $params = [':cost_id' => $costId];

            foreach (['cost_name', 'cost_category', 'supplier_name', 'invoice_number', 'currency', 'amount', 'description', 'due_date'] as $field) {
                if (isset($data[$field]) && $data[$field] !== '') {
                    $fields[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            if (isset($data['payment_status']) && $data['payment_status'] !== '') {
                $fields[] = "payment_status = :payment_status";
                $params[':payment_status'] = $newStatus;
            }

            if ($newStatus === 'pagada') {
                $fields[] = "paid_date = :paid_date";
                $params[':paid_date'] = date('Y-m-d');

                $nextDue = addOneMonthPreserveDay($current['due_date']);
                $fields[] = "due_date = :next_due";
                $params[':next_due'] = $nextDue;
            } elseif ($newStatus === 'pendiente') {
                if (isset($data['paid_date']) && $data['paid_date'] === '') {
                    $fields[] = "paid_date = NULL";
                }
            }

            if (empty($fields)) {
                http_response_code(422);
                echo json_encode(['error' => 'No hay campos para actualizar'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $stmt = $pdo->prepare("UPDATE fixed_costs SET " . implode(', ', $fields) . " WHERE cost_id = :cost_id");
            $stmt->execute($params);

            echo json_encode([
                'success' => true,
                'message' => 'Costo fijo actualizado',
                'next_due_date' => $newStatus === 'pagada' ? $params[':next_due'] : null
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'DELETE':
            parse_str(file_get_contents("php://input"), $data);
            $costId = isset($data['cost_id']) ? (int)$data['cost_id'] : 0;

            if (!$costId) {
                http_response_code(422);
                echo json_encode(['error' => 'cost_id requerido'], JSON_UNESCAPED_UNICODE);
                break;
            }

            $stmt = $pdo->prepare("DELETE FROM fixed_costs WHERE cost_id = :cost_id");
            $stmt->execute([':cost_id' => $costId]);

            echo json_encode(['success' => true, 'message' => 'Costo fijo eliminado'], JSON_UNESCAPED_UNICODE);
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