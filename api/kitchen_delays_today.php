<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

function json_response($success, $data = null, $error = null, int $code = 200): void {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if ($method !== 'GET') {
        json_response(false, null, 'Método no permitido', 405);
    }

    $date = $_GET['date'] ?? date('Y-m-d');
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        json_response(false, null, 'Formato de fecha inválido', 400);
    }

    $stmt = $pdo->prepare("
        SELECT
            o.order_id,
            o.order_number,
            o.user_id,
            o.kitchen_status,
            o.chef_user_id,
            o.assigned_at,
            o.created_at,
            TIMESTAMPDIFF(MINUTE, o.assigned_at, NOW()) AS elapsed_minutes
        FROM orders_clientes o
        WHERE DATE(o.created_at) = :date
          AND o.payment_status = 'pagada'
          AND o.kitchen_status IN ('pendiente', 'en_cocina')
          AND o.assigned_at IS NOT NULL
          AND TIMESTAMPDIFF(MINUTE, o.assigned_at, NOW()) > 20
        ORDER BY elapsed_minutes DESC, o.order_id ASC
    ");

    $stmt->execute([':date' => $date]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response(true, $rows);

} catch (Throwable $e) {
    json_response(false, null, $e->getMessage(), 500);
}
?>