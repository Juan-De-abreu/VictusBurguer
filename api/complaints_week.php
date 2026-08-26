<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();

header('Content-Type: application/json; charset=utf-8');

try {
    $start_date = $_GET['start_date'] ?? null;
    $end_date = $_GET['end_date'] ?? null;

    if (!$start_date || !$end_date) {
        $end_date = date('Y-m-d');
        $start_date = date('Y-m-d', strtotime('-6 days', strtotime($end_date)));
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $start_date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $end_date)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Formato de fecha inválido']);
        exit;
    }

    $sql = "
        SELECT
            c.complaint_id,
            c.order_id,
            c.user_id,
            c.tipo AS complaint_type,
            c.descripcion,
            c.severidad,
            c.estado,
            c.created_at,
            o.order_number,
            u.nombre AS user_name,
            u.email AS user_email
        FROM complaints c
        LEFT JOIN orders_clientes o ON o.order_id = c.order_id
        LEFT JOIN users u ON u.user_id = c.user_id
        WHERE DATE(c.created_at) BETWEEN :start_date AND :end_date
        ORDER BY c.created_at DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':start_date' => $start_date, ':end_date' => $end_date]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al obtener quejas semanales']);
}