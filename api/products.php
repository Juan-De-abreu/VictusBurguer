<?php
// api/products.php - ✅ FIX DEFINITIVO product_id
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
        $trendingOnly = isset($_GET['trending']) && $_GET['trending'] == 1;
        $productId = isset($_GET['product_id']) ? (int)$_GET['product_id'] : null;

        // ⭐ CASO ESPECIAL: Solo product_id (SIN ORDER BY)
        if ($productId && !$categoryId && !$trendingOnly) {
            $query = "
                SELECT p.*, c.nombre_categoria 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.category_id 
                WHERE p.product_id = :product_id
            ";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($result ?: []);
            break;
        }

        // 2. Caso GENERAL (listas)
        $query = "
            SELECT p.*, c.nombre_categoria 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            WHERE 1=1
        ";
        $params = [];

        if ($trendingOnly) {
            $query .= " AND p.is_trending = 1";
        }
        
        if ($categoryId) {
            $query .= " AND p.category_id = :category_id";
            $params[':category_id'] = $categoryId;
        }

        // ⭐ SIN LIMIT aquí - solo ORDER BY
        $query .= " ORDER BY p.is_trending DESC, p.nombre";

        $stmt = $pdo->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindParam($key, $value, PDO::PARAM_INT);
        }

        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        break;
}
?>
