<?php
// index.php - API GATEWAY v2.6 INDIVIDUAL ROUTES ✅
// Victu's Burgers Backend - Mayo 2026

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

$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/victus-backend';
$uri = trim(str_replace($base_path, '', parse_url($request_uri, PHP_URL_PATH)), '/');
$segments = explode('/', $uri);

if ($segments[0] === 'api' && empty($segments[1])) {
    header('Content-Type: text/html; charset=utf-8');
    $docs = file_exists('view/index.html') ? file_get_contents('view/index.html') :
        '<h1>🍔 Victu\'s Burgers API</h1><p>✅ /api/users, /api/auth, /api/products, /api/invoices...</p>';
    echo $docs;
    exit();
}

if (!file_exists('config/database.php')) {
    http_response_code(500);
    echo json_encode(['error' => '❌ Database config missing'], JSON_UNESCAPED_UNICODE);
    exit();
}

require_once 'config/database.php';
global $pdo;

if ($segments[0] !== 'api') {
    header('Location: /victus-backend/api/', true, 301);
    exit();
}

$resource = $segments[1] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($resource === 'auth') {
    require_once 'api/auth.php';
    exit();
}

if ($resource === 'users') {
    require_once 'api/users.php';
    exit();
}

if ($resource === 'favorites') {
    require_once 'api/favorites.php';
    exit();
}

if ($resource === 'products') {
    require_once 'api/products.php';
    exit();
}

if ($resource === 'categories') {
    require_once 'api/categories.php';
    exit();
}

if ($resource === 'addresses') {
    require_once 'api/addresses.php';
    exit();
}

if ($resource === 'drivers') {
    require_once 'api/drivers.php';
    exit();
}

if ($resource === 'payments') {
    require_once 'api/payments.php';
    exit();
}

if ($resource === 'orders') {
    require_once 'api/orders.php';
    exit();
}

if ($resource === 'order_items') {
    require_once 'api/order_items.php';
    exit();
}

if ($resource === 'invoices') {
    require_once 'api/invoices.php';
    exit();
}

if ($resource === 'invoice_download') {
    require_once 'api/invoice_download.php';
    exit();
}

if ($resource === 'orders_clientes') {
    require_once 'api/orders_clientes.php';
    exit();
}

if ($resource === 'orders_shop') {
    require_once 'api/orders_shop.php';
    exit();
}

if ($resource === 'order_items_clientes') {
    require_once 'api/order_items_clientes.php';
    exit();
}

if ($resource === 'shop_order_items') {
    require_once 'api/shop_order_items.php';
    exit();
}

if ($resource === 'payments_personal') {
    require_once 'api/payments_personal.php';
    exit();
}

if ($resource === 'fixed_costs') {
    require_once 'api/fixed_costs.php';
    exit();
}

if ($resource === 'dashboard_records') {
    require_once 'api/dashboard_records.php';
    exit();
}

switch ($resource) {
    case 'inventory':
        handleInventory($pdo, $method);
        break;
    case 'tasks':
        handleTasks($pdo, $method);
        break;
    case 'toggle-availability':
        if ($method === 'POST') handleToggleAvailability($pdo);
        else errorMethod();
        break;
    default:
        errorNotFound([
            'auth',
            'users',
            'favorites',
            'products',
            'categories',
            'addresses',
            'drivers',
            'payments',
            'orders',
            'order_items',
            'invoices',
            'invoice_download',
            'orders_clientes',
            'orders_shop',
            'order_items_clientes',
            'shop_order_items',
            'payments_personal',
            'fixed_costs',
            'dashboard_records',
            'inventory',
            'tasks',
            'toggle-availability'
        ]);
}

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

function handleInventory($pdo, $method) { /* tu código inventory */ }
function handleTasks($pdo, $method) { /* tu código tasks */ }
function handleToggleAvailability($pdo) { /* tu código toggle */ }
?>