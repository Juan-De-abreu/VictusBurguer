<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();

header('Content-Type: application/json; charset=utf-8');

try {
    $sql = "
        SELECT
            p.product_id,
            p.nombre,
            p.descripcion,
            p.precio,
            p.descuento,
            p.is_trending,
            p.image_url,
            SUM(oci.quantity) AS total_sold,
            SUM(oci.line_total) AS total_revenue,
            SUM(oci.quantity * oci.unit_price) AS calculated_revenue
        FROM products p
        INNER JOIN order_items_clientes oci ON oci.product_id = p.product_id
        GROUP BY
            p.product_id,
            p.nombre,
            p.descripcion,
            p.precio,
            p.descuento,
            p.is_trending,
            p.image_url
        ORDER BY total_sold DESC
        LIMIT 20
    ";

    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener productos más vendidos'
    ]);
}