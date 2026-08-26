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
            p.product_id,
            p.nombre AS product_name,
            p.descripcion,
            p.precio,
            p.descuento,
            p.is_trending,
            p.image_url,
            DATE(oci.created_at) AS date,
            COALESCE(SUM(oci.quantity), 0) AS sales_count
        FROM products p
        LEFT JOIN order_items_clientes oci
            ON oci.product_id = p.product_id
           AND DATE(oci.created_at) BETWEEN :start_date AND :end_date
        GROUP BY p.product_id, DATE(oci.created_at)
        HAVING sales_count <= 1
        ORDER BY date ASC, p.product_id ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':start_date' => $start_date, ':end_date' => $end_date]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al obtener ventas bajas semanales']);
}