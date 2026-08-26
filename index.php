<?php
declare(strict_types=1);

// index.php - API GATEWAY v3.2
// Victu's Burgers Backend

$allowedOrigins = [
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
} else {
    header('Access-Control-Allow-Origin: *');
}

$headers = [
    'Content-Type: application/json; charset=utf-8',
    'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Max-Age: 86400',
    'X-Frame-Options: DENY',
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: strict-origin-when-cross-origin'
];

foreach ($headers as $header) {
    header($header);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$basePath = '/victus-backend';
$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$uri = trim(str_replace($basePath, '', $requestPath), '/');
$segments = $uri === '' ? [] : explode('/', $uri);

if (!file_exists(__DIR__ . '/config/database.php')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database config missing'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/config/database.php';

if (empty($segments) || $segments[0] === '') {
    header('Content-Type: text/html; charset=utf-8');
    $docs = file_exists(__DIR__ . '/view/index.html')
        ? file_get_contents(__DIR__ . '/view/index.html')
        : '<h1>🍔 Victu\'s Burgers API</h1><p>✅ /api/auth, /api/users, /api/products, /api/orders_clientes, /api/inventory...</p>';
    echo $docs;
    exit;
}

if ($segments[0] !== 'api') {
    header('Location: /victus-backend/api/', true, 301);
    exit;
}

$resource = $segments[1] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

$routes = [
    // Autenticación y Usuarios
    'auth' => __DIR__ . '/api/auth.php',
    'users' => __DIR__ . '/api/users.php',
    'favorites' => __DIR__ . '/api/favorites.php',
    'addresses' => __DIR__ . '/api/addresses.php',
    
    // Productos y Menú
    'products' => __DIR__ . '/api/products.php',
    'categories' => __DIR__ . '/api/categories.php',
    'top_products' => __DIR__ . '/api/top_products.php',
    'least_sold_products' => __DIR__ . '/api/least_sold_products.php',
    'menu_low_sales_today' => __DIR__ . '/api/menu_low_sales_today.php',
    'menu_low_sales_week' => __DIR__ . '/api/menu_low_sales_week.php',
    'toggle-availability' => __DIR__ . '/api/toggle_availability.php',
    'menu_ajustes' => __DIR__ . '/api/menu_ajustes.php',
    
    // Inventario
    'inventory' => __DIR__ . '/api/inventory.php',
    'inventory_critical' => __DIR__ . '/api/inventory_critical.php',
    'inventory_movements' => __DIR__ . '/api/inventory_movements.php',
    'inventory_alerts' => __DIR__ . '/api/inventory_alerts.php',
    'inventory_counts' => __DIR__ . '/api/inventory_counts.php',
    'inventory_batches' => __DIR__ . '/api/inventory_batches.php',
    'inventory_locations' => __DIR__ . '/api/inventory_locations.php',
    'inventory_reservations' => __DIR__ . '/api/inventory_reservations.php',
    'inventory_settings' => __DIR__ . '/api/inventory_settings.php',
    'inventory_audit_log' => __DIR__ . '/api/inventory_audit_log.php',
    'product_ingredients_check' => __DIR__ . '/api/product_ingredients_check.php',
    
    // Órdenes y Pedidos
    'orders' => __DIR__ . '/api/orders.php',
    'order_items' => __DIR__ . '/api/order_items.php',
    'orders_clientes' => __DIR__ . '/api/orders_clientes.php',
    'orders_shop' => __DIR__ . '/api/orders_shop.php',
    'order_items_clientes' => __DIR__ . '/api/order_items_clientes.php',
    'shop_order_items' => __DIR__ . '/api/shop_order_items.php',
    'chef_orders' => __DIR__ . '/api/chef_orders.php',
    'kitchen_delays_today' => __DIR__ . '/api/kitchen_delays_today.php',
    'kitchen_delays_week' => __DIR__ . '/api/kitchen_delays_week.php',
    
    // Pagos y Facturas
    'payments' => __DIR__ . '/api/payments.php',
    'payments_personal' => __DIR__ . '/api/payments_personal.php',
    'invoices' => __DIR__ . '/api/invoices.php',
    'invoice_download' => __DIR__ . '/api/invoice_download.php',
    
    // Dashboard y Reportes
    'fixed_costs' => __DIR__ . '/api/fixed_costs.php',
    'dashboard_records' => __DIR__ . '/api/dashboard_records.php',
    'kitchen' => __DIR__ . '/api/kitchen.php',
    'complaints_week' => __DIR__ . '/api/complaints_week.php',
    
    // Drivers
    'drivers' => __DIR__ . '/api/drivers.php'
];

if (isset($routes[$resource]) && file_exists($routes[$resource])) {
    require_once $routes[$resource];
    exit;
}

// Handlers para endpoints sin archivo dedicado
switch ($resource) {
    case 'tasks':
        handleTasks();
        break;
    default:
        errorNotFound(array_keys($routes));
}

function errorMethod(): void
{
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
}

function errorNotFound(array $resources): void
{
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Endpoint no encontrado',
        'docs' => '/api/',
        'disponibles' => $resources
    ], JSON_UNESCAPED_UNICODE);
}

function handleTasks(): void
{
    http_response_code(501);
    echo json_encode(['success' => false, 'error' => 'handler pendiente'], JSON_UNESCAPED_UNICODE);
}
?>