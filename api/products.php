<?php
// api/products.php - FIX RUTAS ABSOLUTAS
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // 1. Capturamos el id de la categoría si viene en la URL
        $categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;

        // 2. Base de la consulta
        $query = "
            SELECT p.*, c.nombre_categoria 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
        ";

        // 3. Añadimos el filtro solo si existe un category_id en la URL
        if ($categoryId) {
            $query .= " WHERE p.category_id = :category_id ";
        }

        // 4. Ordenamos (primero los trending, luego por nombre)
        $query .= " ORDER BY p.is_trending DESC, p.nombre ";
        
        $stmt = $pdo->prepare($query);

        // 5. Vinculamos el parámetro si es necesario
        if ($categoryId) {
            $stmt->bindParam(':category_id', $categoryId, PDO::PARAM_INT);
        }

        $stmt->execute();
        
        // Usamos FETCH_ASSOC para un JSON limpio
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ya tienes el header de JSON en el inicio de tu index.php, 
        // pero no está de más asegurar que se envíe la respuesta.
        echo json_encode($results);
        break;
}
?>
