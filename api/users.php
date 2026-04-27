<?php
// api/users.php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['user_id']) && $_GET['user_id'] !== '') {
            getUsuario($pdo);
        } else {
            getUsuarios($pdo);
        }
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
        echo json_encode(['success' => false, 'error' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
        break;
}

function getUsuarios($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT user_id, nombre, email, telefono, rol, created_at FROM users ORDER BY created_at DESC");
        $stmt->execute();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $usuarios
        ], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error BD'
        ], JSON_UNESCAPED_UNICODE);
    }
}

function getUsuario($pdo) {
    $user_id = (int)($_GET['user_id'] ?? 0);

    if (!$user_id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'user_id requerido'
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT user_id, nombre, email, telefono, rol, created_at
            FROM users
            WHERE user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$user_id]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Usuario no encontrado'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => $usuario
        ], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error BD'
        ], JSON_UNESCAPED_UNICODE);
    }
}

function createUsuario($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Datos inválidos'], JSON_UNESCAPED_UNICODE);
        return;
    }

    $nombre = trim($input['nombre'] ?? '');
    $email = trim($input['email'] ?? '');
    $plainPassword = $input['password'] ?? '';
    $telefono = trim($input['telefono'] ?? '');
    $rol = (int)($input['rol'] ?? 0);

    if ($nombre === '' || $email === '' || $plainPassword === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nombre, email y password requeridos'], JSON_UNESCAPED_UNICODE);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$email]);

        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Email ya registrado'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $password = password_hash($plainPassword, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("
            INSERT INTO users (nombre, email, password, telefono, rol)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$nombre, $email, $password, $telefono ?: null, $rol]);

        echo json_encode([
            'success' => true,
            'user_id' => $pdo->lastInsertId(),
            'message' => 'Usuario creado'
        ], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error crear usuario'
        ], JSON_UNESCAPED_UNICODE);
    }
}

function updateUsuario($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Datos inválidos'], JSON_UNESCAPED_UNICODE);
        return;
    }

    $user_id = (int)($input['user_id'] ?? 0);
    $nombre = trim($input['nombre'] ?? '');
    $email = trim($input['email'] ?? '');
    $telefono = trim($input['telefono'] ?? '');
    $contraseña = trim($input['contraseña'] ?? '');
    $rolInput = $input['rol'] ?? null;

    if (!$user_id || $nombre === '' || $email === '') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'user_id, nombre y email son requeridos'
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT rol FROM users WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $userActual = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$userActual) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Usuario no encontrado'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $rol = ($rolInput === null || $rolInput === '' || $rolInput === false)
            ? (int)$userActual['rol']
            : (int)$rolInput;

        if (!in_array($rol, [0,1, 2, 3, 4], true)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Rol debe ser 0, 1, 2, 3 o 4'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
        $stmt->execute([$email, $user_id]);

        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error' => 'Email duplicado'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ($contraseña !== '') {
            $passwordHash = password_hash($contraseña, PASSWORD_DEFAULT);

            $stmt = $pdo->prepare("
                UPDATE users
                SET nombre = ?, email = ?, telefono = ?, rol = ?, password = ?
                WHERE user_id = ?
            ");
            $stmt->execute([$nombre, $email, $telefono ?: null, $rol, $passwordHash, $user_id]);
        } else {
            $stmt = $pdo->prepare("
                UPDATE users
                SET nombre = ?, email = ?, telefono = ?, rol = ?
                WHERE user_id = ?
            ");
            $stmt->execute([$nombre, $email, $telefono ?: null, $rol, $user_id]);
        }

        echo json_encode([
            'success' => true,
            'user_id' => $user_id,
            'message' => 'Usuario actualizado',
            'rol' => $rol
        ], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error actualizar usuario'
        ], JSON_UNESCAPED_UNICODE);
    }
}
function deleteUsuario($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Datos inválidos'], JSON_UNESCAPED_UNICODE);
        return;
    }

    $user_id = (int)($input['user_id'] ?? 0);

    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'user_id requerido'], JSON_UNESCAPED_UNICODE);
        return;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->execute([$user_id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Usuario no encontrado'], JSON_UNESCAPED_UNICODE);
            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Usuario eliminado'
        ], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error eliminar usuario'
        ], JSON_UNESCAPED_UNICODE);
    }
}
?>