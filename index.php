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

        case 'inventory':
            if ($method == 'GET') {
                $stmt = $pdo->query("SELECT * FROM inventario");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($method == 'PUT') {
                // Para actualizar el stock desde la web
                $data = json_decode(file_get_contents("php://input"), true);
                $stmt = $pdo->prepare("UPDATE inventario SET stock_actual = :stock WHERE id_ingrediente = :id");
                $stmt->execute(['stock' => $data['stock'], 'id' => $data['id']]);
                echo json_encode(["status" => "updated"]);
            }
            break;

        case 'tasks':
            if ($method == 'GET') {
                $stmt = $pdo->query("SELECT * FROM tareas ORDER BY fecha_creacion DESC");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($method == 'POST') {
                // Crear nueva tarea
                $data = json_decode(file_get_contents("php://input"), true);
                $stmt = $pdo->prepare("INSERT INTO tareas (descripcion, prioridad) VALUES (:desc, :prior)");
                $stmt->execute(['desc' => $data['descripcion'], 'prior' => $data['prioridad']]);
                echo json_encode(["id" => $pdo->lastInsertId()]);
            } elseif ($method == 'PATCH') {
                // Cambiar estado de la tarea (terminada/pendiente)
                $data = json_decode(file_get_contents("php://input"), true);
                $stmt = $pdo->prepare("UPDATE tareas SET estado = :estado WHERE id_tarea = :id");
                $stmt->execute(['estado' => $data['estado'], 'id' => $data['id']]);
                echo json_encode(["status" => "status updated"]);
            }
            break;

        case 'toggle-availability':
            // Endpoint rápido para poner un plato como "Agotado"
            if ($method == 'POST') {
                $data = json_decode(file_get_contents("php://input"), true);
                $stmt = $pdo->prepare("UPDATE products SET disponible = :disp WHERE product_id = :id");
                $stmt->execute(['disp' => $data['disponible'], 'id' => $data['id']]);
                echo json_encode(["status" => "availability updated"]);
            }
            break;
    }
} else {
    // Docs por defecto
    header('Location: /victus-backend/api/');
    exit();
}
?>
