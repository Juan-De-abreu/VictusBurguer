<?php
// index.php - TU MÉTODO CENTRALIZADO (MEJOR)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/victus-backend';
$uri = str_replace($base_path, '', parse_url($request_uri, PHP_URL_PATH));
$uri = trim($uri, '/');
$segments = explode('/', $uri);

// 🔑 DOCS: /api/ → HTML
if ($segments[0] === 'api' && empty($segments[1])) {
    header('Content-Type: text/html; charset=utf-8');
    readfile('public/index.html');
    exit();
}

require_once 'config/database.php';

// 🎛️ TU ROUTING CENTRALIZADO (SIMPLE)
if ($segments[0] === 'api') {
    $resource = $segments[1] ?? '';
    
    switch($resource) {
        case 'products':
        case 'orders':
        case 'users':
        case 'addresses':
        case 'drivers':
        case 'categories':
            $file = "api/{$resource}.php";
            if (file_exists($file)) {
                include $file;
            } else {
                http_response_code(404);
                echo json_encode(['error' => "API {$resource} no implementada aún"]);
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode([
                'error' => 'Endpoint no encontrado',
                'docs' => '/api/',
                'disponibles' => ['products', 'orders', 'users']
            ]);
    }
} else {
    // Docs por defecto
    header('Location: /victus-backend/api/');
    exit();
}
?>
