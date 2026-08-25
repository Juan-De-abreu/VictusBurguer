<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();

header('Content-Type: application/json; charset=utf-8');

try {
    $date = $_GET['date'] ?? date('Y-m-d');
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Formato de fecha inválido'
        ]);
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
            COALESCE(SUM(oci.quantity), 0) AS sales_today
        FROM products p
        LEFT JOIN order_items_clientes oci
            ON oci.product_id = p.product_id
           AND DATE(oci.created_at) = :date
        GROUP BY
            p.product_id,
            p.nombre,
            p.descripcion,
            p.precio,
            p.descuento,
            p.is_trending,
            p.image_url
        HAVING sales_today <= 1
        ORDER BY sales_today ASC, p.product_id ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':date' => $date]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener productos con ventas bajas hoy'
    ]);
}