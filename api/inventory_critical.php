<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();

header('Content-Type: application/json; charset=utf-8');

try {
    $sql = "
        SELECT
            i.item_id,
            i.nombre AS product_name,
            i.descripcion,
            i.tipo AS category,
            i.unit,
            i.stock_on_hand,
            i.stock_reserved,
            (i.stock_on_hand - i.stock_reserved) AS stock_actual,
            i.stock_min AS stock_minimo,
            CASE
                WHEN (i.stock_on_hand - i.stock_reserved) <= 0 THEN 'inexistente'
                WHEN (i.stock_on_hand - i.stock_reserved) <= i.stock_min THEN 'critico'
                ELSE 'ok'
            END AS estado
        FROM inventory_items i
        WHERE i.active = 1
          AND (
              (i.stock_on_hand - i.stock_reserved) <= i.stock_min
              OR (i.stock_on_hand - i.stock_reserved) <= 0
          )
        ORDER BY
            CASE
                WHEN (i.stock_on_hand - i.stock_reserved) <= 0 THEN 1
                ELSE 2
            END ASC,
            i.nombre ASC
    ";

    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener inventario crítico'
    ]);
}