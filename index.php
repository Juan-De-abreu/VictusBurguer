<?php
// index.php - API GATEWAY v2.4 USUARIOS ✅ INTEGRADO
// Victu's Burgers Backend - Abril 2026

// 🔒 SEGURIDAD HEADERS (OPTIMIZADO)
$headers = [
    'Content-Type: application/json; charset=utf-8',
    'Access-Control-Allow-Origin: *',
    'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age: 86400',
    'X-Frame-Options: DENY',
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: strict-origin-when-cross-origin'
];

foreach ($headers as $header) header($header);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 🔍 URL PARSER (MEJORADO)
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/victus-backend';
$uri = trim(str_replace($base_path, '', parse_url($request_uri, PHP_URL_PATH)), '/');
$segments = explode('/', $uri);

// 📄 DOCS: /api/
if ($segments[0] === 'api' && empty($segments[1])) {
    header('Content-Type: text/html; charset=utf-8');
    $docs = file_exists('view/index.html') ? file_get_contents('view/index.html') : 
            '<h1>🍔 Victu\'s Burgers API</h1><p>✅ /api/users (CRUD), /api/auth, /api/products...</p>';
    echo $docs;
    exit();
}

// 🗄️ DATABASE (CON CHECK)
if (!file_exists('config/database.php')) {
    http_response_code(500);
    echo json_encode(['error' => '❌ Database config missing'], JSON_UNESCAPED_UNICODE);
    exit();
}
require_once 'config/database.php';

// ✅ FIJAR $pdo GLOBAL
global $pdo;

// 🎛️ ROUTER CENTRALIZADO
if ($segments[0] === 'api') {
    $resource = $segments[1] ?? '';
    $method = $_SERVER['REQUEST_METHOD'];
    
    // 🔑 AUTH PRIMERO
    if ($resource === 'auth') {
        require_once 'api/auth.php';
        exit();
    }
    
    // 📦 RESOURCES AUTOMÁTICOS
    $resources = ['products', 'orders', 'categories', 'addresses', 'drivers', 'payments'];
    
    if (in_array($resource, $resources)) {
        $api_file = "api/{$resource}.php";
        if (file_exists($api_file)) {
            require_once $api_file;
        } else {
            http_response_code(404);
            echo json_encode(['error' => "🚧 API {$resource} pendiente"], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }
    
    // ✅ USUARIOS ROUTER
    if ($resource === 'users') {
        require_once 'api/users.php';
        exit();
    }
    
    // 🛠️ ENDPOINTS ESPECIALES (EXISTENTES)
    switch ($resource) {
        case 'inventory': handleInventory($pdo, $method); break;
        case 'tasks': handleTasks($pdo, $method); break;
        case 'toggle-availability':
            if ($method === 'POST') handleToggleAvailability($pdo);
            else errorMethod();
            break;
        default: errorNotFound($resources);
    }
} else {
    header('Location: /victus-backend/api/', true, 301);
    exit();
}

// 🆙 FUNCIONES UTILITARIAS (EXISTENTES)
function errorMethod() {
    http_response_code(405);
    echo json_encode(['error' => '❌ Método no permitido'], JSON_UNESCAPED_UNICODE);
}

function errorNotFound($resources) {
    http_response_code(404);
    echo json_encode([
        'error' => '🔍 Endpoint no encontrado',
        'docs' => '/api/',
        'disponibles' => $resources
    ], JSON_UNESCAPED_UNICODE);
}

// 📦 FUNCIONES ESPECIALES EXISTENTES (sin cambios)
function handleInventory($pdo, $method) { /* tu código inventory */ }
function handleTasks($pdo, $method) { /* tu código tasks */ }
function handleToggleAvailability($pdo) { /* tu código toggle */ }

?>