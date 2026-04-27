<?php
// api/favorites.php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['user_id']) && $_GET['user_id'] !== '') {
            getFavoritesByUser($pdo);
        } elseif (isset($_GET['user_id']) && isset($_GET['product_id'])) {
            getFavoriteByUserAndProduct($pdo);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'user_id requerido'
            ], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'POST':
        createFavorite($pdo);
        break;

    case 'DELETE':
        deleteFavorite($pdo);
        break;

    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Método no permitido'
        ], JSON_UNESCAPED_UNICODE);
        break;
}

function getFavoritesByUser($pdo) {
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
            SELECT
                f.id,
                f.id_product,
                f.id_user,
                p.product_id,
                p.nombre,
                p.precio,
                p.image_url,
                p.descuento
            FROM favorites f
            INNER JOIN products p ON p.product_id = f.id_product
            WHERE f.id_user = ?
            ORDER BY f.id DESC
        ");
        $stmt->execute([$user_id]);
        $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $favorites
        ], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error BD'
        ], JSON_UNESCAPED_UNICODE);
    }
}

function getFavoriteByUserAndProduct($pdo) {
    $user_id = (int)($_GET['user_id'] ?? 0);
    $product_id = (int)($_GET['product_id'] ?? 0);

    if (!$user_id || !$product_id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'user_id y product_id requeridos'
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT id, id_product, id_user
            FROM favorites
            WHERE id_user = ? AND id_product = ?
            LIMIT 1
        ");
        $stmt->execute([$user_id, $product_id]);
        $favorite = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'exists' => $favorite ? true : false,
            'data' => $favorite ?: null
        ], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error BD'
        ], JSON_UNESCAPED_UNICODE);
    }
}

function createFavorite($pdo) {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Datos inválidos',
            'raw' => $raw
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    $id_user = (int)($input['id_user'] ?? 0);
    $id_product = (int)($input['id_product'] ?? 0);

    if (!$id_user || !$id_product) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'id_user e id_product requeridos',
            'received' => $input
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT id
            FROM favorites
            WHERE id_user = ? AND id_product = ?
            LIMIT 1
        ");
        $stmt->execute([$id_user, $id_product]);

        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error' => 'El producto ya está en favoritos'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        $stmt = $pdo->prepare("
            INSERT INTO favorites (id_product, id_user)
            VALUES (?, ?)
        ");
        $ok = $stmt->execute([$id_product, $id_user]);

        echo json_encode([
            'success' => true,
            'message' => 'Favorito agregado',
            'inserted' => $ok,
            'last_id' => $pdo->lastInsertId()
        ], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error crear favorito',
            'detail' => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
}
function deleteFavorite($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Datos inválidos'
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    $id_user = (int)($input['id_user'] ?? 0);
    $id_product = (int)($input['id_product'] ?? 0);

    if (!$id_user || !$id_product) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'id_user e id_product requeridos'
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    try {
        $stmt = $pdo->prepare("
            DELETE FROM favorites
            WHERE id_user = ? AND id_product = ?
        ");
        $stmt->execute([$id_user, $id_product]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Favorito no encontrado'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Favorito eliminado'
        ], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error eliminar favorito'
        ], JSON_UNESCAPED_UNICODE);
    }
}
?>