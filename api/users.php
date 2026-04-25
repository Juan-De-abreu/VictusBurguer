<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include 'config/database.php'; // ← Tu conexión DB

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getUsuarios($pdo);
        break;
    case 'POST':
        createUsuario($pdo);
        break;
    case 'PUT':
        updateUsuario($pdo);
        break;
    case 'DELETE':
        deleteUsuario($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}

function getUsuarios($pdo) {
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
    $input = json_decode(file_get_contents('php://input'), true);
    
    $nombre = trim($input['nombre'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = password_hash($input['password'] ?? '', PASSWORD_DEFAULT);
    $telefono = trim($input['telefono'] ?? '');
    $rol = (int)($input['rol'] ?? 0);

    if (empty($nombre) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nombre, email y password requeridos']);
        return;
    }

    try {
        // Verificar email único
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
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = (int)($input['user_id'] ?? 0);
    
    $nombre = trim($input['nombre'] ?? '');
    $email = trim($input['email'] ?? '');
    $telefono = trim($input['telefono'] ?? '');
    $rol = (int)($input['rol'] ?? 1);
    
    // 🔒 VALIDACIONES
    if (!$user_id || empty($nombre) || empty($email)) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos incompletos']);
        return;
    }
    if (!in_array($rol, [1,2,3,4])) {
        http_response_code(400);
        echo json_encode(['error' => 'Rol inválido']);
        return;
    }

    try {
        // 🔍 1. VERIFICAR SI USUARIO EXISTE
        $check = $pdo->prepare("SELECT rol FROM users WHERE user_id = ?");
        $check->execute([$user_id]);
        $current = $check->fetch(PDO::FETCH_ASSOC);
        
        if (!$current) {
            http_response_code(404);
            echo json_encode(['error' => 'Usuario #' . $user_id . ' no existe']);
            return;
        }
        
        // 🔍 2. VERIFICAR EMAIL ÚNICO
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
        $stmt->execute([$email, $user_id]);
        if ($stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Email duplicado']);
            return;
        }

        // 🔍 3. UPDATE
        $stmt = $pdo->prepare("UPDATE users SET nombre = ?, email = ?, telefono = ?, rol = ? WHERE user_id = ?");
        $stmt->bindValue(1, $nombre, PDO::PARAM_STR);
        $stmt->bindValue(2, $email, PDO::PARAM_STR);
        $stmt->bindValue(3, $telefono, PDO::PARAM_STR);
        $stmt->bindValue(4, $rol, PDO::PARAM_INT);
        $stmt->bindValue(5, $user_id, PDO::PARAM_INT);
        
        $success = $stmt->execute();
        $rows = $stmt->rowCount();
        
        // 🔍 RESPONSE COMPLETO
        echo json_encode([
            'success' => $success,
            'user_id' => $user_id,
            'rows_affected' => $rows,
            'current_rol' => $current['rol'],
            'new_rol' => $rol,
            'updated' => $rows > 0,
            'debug' => [
                'input' => $input,
                'valores' => [$nombre, $email, $telefono, $rol, $user_id]
            ]
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
function deleteUsuario($pdo) {
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