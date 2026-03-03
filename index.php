<?php
// index.php - API GATEWAY COMPLETO v2.2 CORREGIDO
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
    if (file_exists('view/index.html')) {
        echo file_get_contents('view/index.html');
    } else {
        echo '<h1>Victu\'s Burgers API</h1><p>Endpoints disponibles: auth, products, orders...</p>';
    }
    exit();
}

// 🗄️ DATABASE CHECK
if (!file_exists('config/database.php')) {
    http_response_code(500);
    echo json_encode(['error' => 'Database config missing'], JSON_UNESCAPED_UNICODE);
    exit();
}
require_once 'config/database.php';

// 🎛️ ROUTING CENTRALIZADO CORREGIDO
if ($segments[0] === 'api') {
    $resource = $segments[1] ?? '';
    $method = $_SERVER['REQUEST_METHOD'];
    
    // 🔑 AUTH (PRIORIDAD)
    if ($resource === 'auth') {
        if (file_exists('api/auth.php')) {
            require_once 'api/auth.php';
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Auth API no implementada'], JSON_UNESCAPED_UNICODE);
        }
        exit();
    }
    
    // 📦 RESOURCES CON ARCHIVOS
    $file_resources = ['products', 'orders', 'users', 'categories', 'addresses', 'drivers', 'payments'];
    
    if (in_array($resource, $file_resources)) {
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
        exit();
    }
    
    // 🆕 ENDPOINTS ESPECIALES DIRECTOS
    switch ($resource) {
        case 'inventory':
            handleInventory($pdo, $method);
            break;
            
        case 'tasks':
            handleTasks($pdo, $method);
            break;
            
        case 'toggle-availability':
            if ($method === 'POST') {
                handleToggleAvailability($pdo);
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Solo POST permitido']);
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode([
                'error' => 'Endpoint no encontrado',
                'docs' => '/api/',
                'disponibles' => array_merge($file_resources, ['inventory', 'tasks', 'toggle-availability']),
                'auth' => '/api/auth (POST)'
            ], JSON_UNESCAPED_UNICODE);
    }
} else {
    header('Location: /victus-backend/api/', true, 301);
    exit();
}

// 🆕 FUNCIONES ESPECIALES
function handleInventory($pdo, $method) {
    switch($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM inventario ORDER BY stock_actual ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            if (!$data || !isset($data['id']) || !isset($data['stock'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Faltan id/stock']);
                return;
            }
            $stmt = $pdo->prepare("UPDATE inventario SET stock_actual = :stock WHERE id_ingrediente = :id");
            $stmt->execute(['stock' => $data['stock'], 'id' => $data['id']]);
            echo json_encode(['status' => 'stock updated', 'id' => $data['id']]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

function handleTasks($pdo, $method) {
    switch($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM tareas ORDER BY fecha_creacion DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $pdo->prepare("INSERT INTO tareas (descripcion, prioridad) VALUES (:desc, :prior)");
            $stmt->execute(['desc' => $data['descripcion'], 'prior' => $data['prioridad']]);
            echo json_encode(['id' => $pdo->lastInsertId(), 'status' => 'created']);
            break;
            
        case 'PATCH':
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $pdo->prepare("UPDATE tareas SET estado = :estado WHERE id_tarea = :id");
            $stmt->execute(['estado' => $data['estado'], 'id' => $data['id']]);
            echo json_encode(['status' => 'status updated']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

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
        
        if ($result && $stmt->rowCount() > 0) {
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
