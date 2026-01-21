<?php
// api/products.php - FIX RUTAS ABSOLUTAS
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $query = "
            SELECT p.*, c.nombre_categoria 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            ORDER BY p.is_trending DESC, p.nombre
        ";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        header('Content-Type: application/json');
        echo json_encode($stmt->fetchAll());
        break;
}
?>
