<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$db = new Database();
$pdo = $db->connect();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

function json_response($success, $data = null, $error = null, $code = 200): void
{
    http_response_code($code);

    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

try {
    if ($method === 'GET') {
        if ($action === 'get_all' || $action === '') {
            $stmt = $pdo->prepare("
                SELECT category_id, nombre_categoria
                FROM categories
                ORDER BY category_id ASC
            ");

            $stmt->execute();

            json_response(true, $stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        json_response(false, null, 'Acción no válida', 400);
    }

    if ($method === 'POST') {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (!str_contains($contentType, 'application/json')) {
            json_response(false, null, 'El contenido debe ser JSON', 415);
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            json_response(false, null, 'JSON inválido', 400);
        }

        $action = $data['action'] ?? '';

        // Crear categoría
        if ($action === 'create') {
            $nombreCategoria = trim($data['nombre_categoria'] ?? '');

            if ($nombreCategoria === '') {
                json_response(false, null, 'El nombre de la categoría es obligatorio', 400);
            }

            $stmtCheck = $pdo->prepare("
                SELECT category_id
                FROM categories
                WHERE LOWER(TRIM(nombre_categoria)) = LOWER(TRIM(:nombre_categoria))
                LIMIT 1
            ");

            $stmtCheck->execute([
                ':nombre_categoria' => $nombreCategoria
            ]);

            if ($stmtCheck->fetch()) {
                json_response(false, null, 'Esta categoría ya existe', 409);
            }

            $stmt = $pdo->prepare("
                INSERT INTO categories (nombre_categoria)
                VALUES (:nombre_categoria)
            ");

            $stmt->execute([
                ':nombre_categoria' => $nombreCategoria
            ]);

            $categoryId = (int)$pdo->lastInsertId();

            json_response(
                true,
                [
                    'category_id' => $categoryId,
                    'nombre_categoria' => $nombreCategoria
                ],
                'Categoría creada'
            );
        }

        // Actualizar nombre de categoría
        if ($action === 'update') {
            $categoryId = (int)($data['category_id'] ?? 0);
            $nombreCategoria = trim($data['nombre_categoria'] ?? '');

            if ($categoryId <= 0 || $nombreCategoria === '') {
                json_response(false, null, 'ID y nombre de categoría son obligatorios', 400);
            }

            $stmtCheck = $pdo->prepare("
                SELECT category_id
                FROM categories
                WHERE LOWER(TRIM(nombre_categoria)) = LOWER(TRIM(:nombre_categoria))
                AND category_id != :category_id
                LIMIT 1
            ");

            $stmtCheck->execute([
                ':nombre_categoria' => $nombreCategoria,
                ':category_id' => $categoryId
            ]);

            if ($stmtCheck->fetch()) {
                json_response(false, null, 'Ya existe otra categoría con ese nombre', 409);
            }

            $stmt = $pdo->prepare("
                UPDATE categories
                SET nombre_categoria = :nombre_categoria
                WHERE category_id = :category_id
            ");

            $stmt->execute([
                ':category_id' => $categoryId,
                ':nombre_categoria' => $nombreCategoria
            ]);

            if ($stmt->rowCount() === 0) {
                $stmtExists = $pdo->prepare("
                    SELECT category_id
                    FROM categories
                    WHERE category_id = :category_id
                ");

                $stmtExists->execute([
                    ':category_id' => $categoryId
                ]);

                if (!$stmtExists->fetch()) {
                    json_response(false, null, 'Categoría no encontrada', 404);
                }
            }

            json_response(
                true,
                [
                    'category_id' => $categoryId,
                    'nombre_categoria' => $nombreCategoria
                ],
                'Categoría actualizada'
            );
        }

        // Eliminar categoría
        if ($action === 'delete') {
            $categoryId = (int)($data['category_id'] ?? 0);

            if ($categoryId <= 0) {
                json_response(false, null, 'category_id requerido', 400);
            }

            $stmtProducts = $pdo->prepare("
                SELECT COUNT(*) 
                FROM products
                WHERE category_id = :category_id
            ");

            $stmtProducts->execute([
                ':category_id' => $categoryId
            ]);

            $productsCount = (int)$stmtProducts->fetchColumn();

            if ($productsCount > 0) {
                json_response(
                    false,
                    null,
                    'No puedes eliminar esta categoría porque tiene productos asignados',
                    409
                );
            }

            $stmt = $pdo->prepare("
                DELETE FROM categories
                WHERE category_id = :category_id
            ");

            $stmt->execute([
                ':category_id' => $categoryId
            ]);

            if ($stmt->rowCount() === 0) {
                json_response(false, null, 'Categoría no encontrada', 404);
            }

            json_response(true, null, 'Categoría eliminada');
        }

        json_response(false, null, 'Acción no válida', 400);
    }

    json_response(false, null, 'Método no soportado', 405);
} catch (Throwable $e) {
    json_response(false, null, $e->getMessage(), 500);
}