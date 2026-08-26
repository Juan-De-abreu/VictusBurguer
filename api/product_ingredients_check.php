<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();

header('Content-Type: application/json; charset=utf-8');

try {
    $sql = "
        SELECT
            pi.product_id,
            p.nombre AS product_name,
            pi.item_id,
            i.nombre AS ingredient_name,
            i.tipo AS ingredient_type,
            i.unit AS ingredient_unit,
            pi.quantity_required,
            i.stock_on_hand,
            i.stock_reserved,
            (i.stock_on_hand - i.stock_reserved) AS stock_actual,
            i.stock_min,
            CASE
                WHEN (i.stock_on_hand - i.stock_reserved) <= 0 THEN 'inexistente'
                WHEN (i.stock_on_hand - i.stock_reserved) < pi.quantity_required THEN 'insuficiente'
                WHEN (i.stock_on_hand - i.stock_reserved) <= i.stock_min THEN 'critico'
                ELSE 'ok'
            END AS estado
        FROM product_ingredients pi
        INNER JOIN products p ON p.product_id = pi.product_id
        LEFT JOIN inventory_items i ON i.item_id = pi.item_id
        WHERE pi.active = 1
          AND i.active = 1
          AND (
              (i.stock_on_hand - i.stock_reserved) <= 0
              OR (i.stock_on_hand - i.stock_reserved) < pi.quantity_required
              OR (i.stock_on_hand - i.stock_reserved) <= i.stock_min
          )
        ORDER BY
            CASE
                WHEN (i.stock_on_hand - i.stock_reserved) <= 0 THEN 1
                WHEN (i.stock_on_hand - i.stock_reserved) < pi.quantity_required THEN 2
                ELSE 3
            END ASC,
            p.nombre ASC
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
        'error' => 'Error al verificar ingredientes de productos'
    ]);
}