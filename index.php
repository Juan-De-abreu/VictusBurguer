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
        switch ($method) {
            case 'GET': getUsuarios($pdo); break;
            case 'POST': createUsuario($pdo); break;
            case 'PUT': updateUsuario($pdo); break;
            case 'DELETE': deleteUsuario($pdo); break;
            default: errorMethod();
        }
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

// ✅ USUARIOS - TU CÓDIGO EXACTO CON global $pdo
function getUsuarios($pdo) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("SELECT user_id, nombre, email, telefono, rol, created_at FROM users ORDER BY created_at DESC");
        $stmt->execute();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $usuarios]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error BD: ' . $e->getMessage()]);
    }
}

function createUsuario($pdo) {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);
    
    $nombre = trim($input['nombre'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = password_hash($input['password'] ?? '', PASSWORD_DEFAULT);
    $telefono = trim($input['telefono'] ?? '');
    $rol = (int)($input['rol'] ?? 1);

    if (empty($nombre) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nombre, email y password requeridos']);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Email ya registrado']);
            return;
        }

        $stmt = $pdo->prepare("INSERT INTO users (nombre, email, password, telefono, rol) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$nombre, $email, $password, $telefono, $rol]);
        
        $user_id = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'user_id' => $user_id]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error crear usuario: ' . $e->getMessage()]);
    }
}

function updateUsuario($pdo) {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = (int)($input['user_id'] ?? 0);
    
    $nombre = trim($input['nombre'] ?? '');
    $email = trim($input['email'] ?? '');
    $telefono = trim($input['telefono'] ?? '');

    if (!$user_id || empty($nombre) || empty($email)) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id, nombre y email requeridos']);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
        $stmt->execute([$email, $user_id]);
        if ($stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Email ya registrado']);
            return;
        }

        $stmt = $pdo->prepare("UPDATE users SET nombre = ?, email = ?, telefono = ? WHERE user_id = ?");
        $stmt->execute([$nombre, $email, $telefono, $user_id]);
        
        echo json_encode(['success' => true, 'user_id' => $user_id, 'message' => 'Usuario actualizado']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error actualizar: ' . $e->getMessage()]);
    }
}

function deleteUsuario($pdo) {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = (int)($input['user_id'] ?? null);

    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id requerido']);
        return;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Usuario no encontrado']);
            return;
        }
        
        echo json_encode(['success' => true, 'message' => 'Usuario eliminado']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error eliminar: ' . $e->getMessage()]);
    }
}
?>