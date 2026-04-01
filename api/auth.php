<?php
// api/auth.php - CORREGIDO
header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$dbname = 'dbburguer';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error DB: ' . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
            exit();
        }
        
        if (isset($input['email']) && isset($input['password'])) {
            if (isset($input['nombre'])) {
                register($pdo, $input);
            } else {
                login($pdo, $input);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Faltan email/password']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Solo POST permitido']);
}

function login($pdo, $data) {
    try {
        // ✅ AGREGADO: rol en SELECT
        $stmt = $pdo->prepare("SELECT user_id, nombre, email, password, rol FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($data['password'], $user['password'])) {
            $token = base64_encode($user['user_id'] . '|' . $user['email'] . '|' . time());
            
            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['user_id'],
                    'nombre' => $user['nombre'],
                    'email' => $user['email'],
                    'rol' => $user['rol']  // ✅ AGREGADO: rol en respuesta
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function register($pdo, $data) {
    try {
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Email ya registrado']);
            return;
        }
        
        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (nombre, email, telefono, password, rol) VALUES (?, ?, ?, ?, 0)");  // ✅ rol=0 por defecto
        $result = $stmt->execute([
            $data['nombre'],
            $data['email'],
            $data['telefono'] ?? null,
            $password_hash
        ]);
        
        if ($result) {
            $newUserId = $pdo->lastInsertId();
            echo json_encode([
                'success' => true,
                'message' => '¡Usuario creado! Inicia sesión.',
                'user_id' => $newUserId
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al crear usuario']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>
