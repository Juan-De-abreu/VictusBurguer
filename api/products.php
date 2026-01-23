<?php
// api/products.php - MANTENIENDO TU ESTILO ORIGINAL
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // 1. Capturamos parámetros de la URL
        $categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
        $trendingOnly = isset($_GET['trending']) && $_GET['trending'] == 1;

        // 2. Base de la consulta
        $query = "
            SELECT p.*, c.nombre_categoria 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            WHERE 1=1
        ";
        $params = [];

        // 3. ⭐ FILTRO TRENDING (nuevo)
        if ($trendingOnly) {
            $query .= " AND p.is_trending = 1";
        }

        // 4. Filtro por categoría (tu código original)
        if ($categoryId) {
            $query .= " AND p.category_id = :category_id";
        }

        // 5. Ordenar (trending primero)
        $query .= " ORDER BY p.is_trending DESC, p.nombre";

        // 6. Preparar y ejecutar
        $stmt = $pdo->prepare($query);

        // 7. Bind solo si existe category_id
        if ($categoryId) {
            $stmt->bindParam(':category_id', $categoryId, PDO::PARAM_INT);
        }

        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($results);
        break;

    case 'POST':
        // Tu código POST existente (si lo tienes)
        $data = json_decode(file_get_contents('php://input'), true);
        // ... lógica POST
        break;
}
?>
