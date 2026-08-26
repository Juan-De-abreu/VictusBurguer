<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();

header('Content-Type: application/json; charset=utf-8');

try {
    // Parámetro opcional: si viene date, filtra por hoy; si no, histórico
    $date = $_GET['date'] ?? null;

    if ($date && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Formato de fecha inválido'
        ]);
        exit;
    }

    if ($date) {
        // Versión "hoy" para crítico
        $sql = "
            SELECT
                p.product_id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.descuento,
                p.is_trending,
                p.image_url,
                COALESCE(SUM(oci.quantity), 0) AS total_sold,
                COALESCE(SUM(oci.line_total), 0) AS total_revenue
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
            HAVING total_sold <= 1
            ORDER BY total_sold ASC, p.product_id ASC
            LIMIT 50
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':date' => $date]);
    } else {
        // Versión histórica original
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
                SUM(oci.line_total) AS total_revenue
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
            ORDER BY total_sold ASC
            LIMIT 20
        ";

        $stmt = $pdo->query($sql);
    }

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener productos menos vendidos'
    ]);
}