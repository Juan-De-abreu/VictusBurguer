<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['id']) || !isset($input['disponible'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Faltan parámetros']);
        exit;
    }
    
    $product_id = (int)$input['id'];
    $disponible = (int)$input['disponible'];
    
    if (!in_array($disponible, [0, 1])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'disponible debe ser 0 o 1']);
        exit;
    }
    
    $stmt = $pdo->prepare("UPDATE products SET disponible = :disponible WHERE product_id = :id");
    $stmt->execute([
        ':disponible' => $disponible,
        ':id' => $product_id
    ]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Disponibilidad actualizada',
            'data' => [
                'product_id' => $product_id,
                'disponible' => $disponible
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Producto no encontrado']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error en el servidor']);
}
?>