<?php
// index.php - API GATEWAY COMPLETO v2.1
// Victu's Burgers Backend - Marzo 2026

// 🔒 SEGURIDAD Y HEADERS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 🔍 URL PARSING
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/victus-backend';
$uri = str_replace($base_path, '', parse_url($request_uri, PHP_URL_PATH));
$uri = trim($uri, '/');
$segments = explode('/', $uri);

// 📄 DOCS: /api/
if ($segments[0] === 'api' && empty($segments[1])) {
    header('Content-Type: text/html; charset=utf-8');
    echo file_get_contents('view/index.html');
    exit();
}

// 🗄️ DATABASE CHECK
if (!file_exists('config/database.php')) {
    http_response_code(500);
    echo json_encode(['error' => 'Database config missing'], JSON_UNESCAPED_UNICODE);
    exit();
}
require_once 'config/database.php';

// 🎛️ ROUTING CENTRALIZADO MEJORADO
if ($segments[0] === 'api') {
    $resource = $segments[1] ?? '';
    $method = $_SERVER['REQUEST_METHOD'];
    
    // 🔑 AUTH (PRIORIDAD)
    if ($resource === 'auth') {
        require_once 'api/auth.php';
        exit();
    }
    
    // 📦 TODOS LOS RESOURCES
    $resources = [
        'products', 'orders', 'users', 'categories', 
        'addresses', 'drivers', 'payments', 'inventory', 'tasks'
    ];
    
    if (in_array($resource, $resources)) {
        $api_file = "api/{$resource}.php";
        if (file_exists($api_file)) {
            require_once $api_file;
        } else {
            http_response_code(404);
            echo json_encode([
                'error' => "API {$resource} no implementada",
                'create' => $api_file
            ], JSON_UNESCAPED_UNICODE);
        }
    } 
    // 🆕 ENDPOINT ESPECIAL: toggle-availability
    elseif ($resource === 'toggle-availability' && $method === 'POST') {
        handleToggleAvailability($pdo);
    }
    else {
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint no encontrado',
            'docs' => '/api/',
            'disponibles' => $resources,
            'special' => ['toggle-availability (POST)']
        ], JSON_UNESCAPED_UNICODE);
    }
} else {
    header('Location: /victus-backend/api/', true, 301);
    exit();
}

// 🆕 FUNCIÓN toggle-availability INTEGRADA
function handleToggleAvailability($pdo) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data || !isset($data['id']) || !isset($data['disponible'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan id y disponible']);
            return;
        }
        
        $stmt = $pdo->prepare("UPDATE products SET disponible = :disp WHERE product_id = :id");
        $result = $stmt->execute([
            'disp' => $data['disponible'], 
            'id' => $data['id']
        ]);
        
        if ($result) {
            echo json_encode(['status' => 'availability updated', 'id' => $data['id']]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Producto no encontrado']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error interno: ' . $e->getMessage()]);
    }
}
?>
