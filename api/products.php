<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

header('Content-Type: application/json; charset=utf-8');

// Función global para respuestas JSON
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

// Función para procesar imagen: redimensiona y guarda en WebP
function processImage(
    array $file,
    string $uploadDir = '/uploads/products/',
    int $maxWidth = 800,
    int $maxHeight = 800,
    int $quality = 80
): array {
    $allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    $maxSize = 5 * 1024 * 1024;

    if (
        !isset($file['tmp_name'], $file['type'], $file['size']) ||
        !is_uploaded_file($file['tmp_name'])
    ) {
        return ['success' => false, 'error' => 'Archivo no válido'];
    }

    if (!in_array($file['type'], $allowedTypes, true)) {
        return ['success' => false, 'error' => 'Tipo de archivo no permitido'];
    }

    if ((int)$file['size'] > $maxSize) {
        return ['success' => false, 'error' => 'Archivo muy grande (máx. 5MB)'];
    }

    $imageInfo = getimagesize($file['tmp_name']);

    if ($imageInfo === false) {
        return ['success' => false, 'error' => 'No se pudo leer la imagen'];
    }

    $origWidth = (int)$imageInfo[0];
    $origHeight = (int)$imageInfo[1];

    if ($origWidth <= 0 || $origHeight <= 0) {
        return ['success' => false, 'error' => 'Dimensiones de imagen inválidas'];
    }

    // Nunca agranda imágenes pequeñas
    $ratio = min(
        $maxWidth / $origWidth,
        $maxHeight / $origHeight,
        1
    );

    $newWidth = max(1, (int)round($origWidth * $ratio));
    $newHeight = max(1, (int)round($origHeight * $ratio));

    $sourceImage = null;

    switch ($file['type']) {
        case 'image/jpeg':
        case 'image/jpg':
            $sourceImage = imagecreatefromjpeg($file['tmp_name']);
            break;

        case 'image/png':
            $sourceImage = imagecreatefrompng($file['tmp_name']);
            break;

        case 'image/gif':
            $sourceImage = imagecreatefromgif($file['tmp_name']);
            break;

        case 'image/webp':
            $sourceImage = imagecreatefromwebp($file['tmp_name']);
            break;
    }

    if (!$sourceImage) {
        return ['success' => false, 'error' => 'Error al procesar la imagen'];
    }

    $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

    if (!$resizedImage) {
        unset($sourceImage);

        return ['success' => false, 'error' => 'Error al crear la imagen'];
    }

    // Fondo transparente para no perder transparencia en PNG, GIF y WebP
    imagealphablending($resizedImage, false);
    imagesavealpha($resizedImage, true);

    $transparent = imagecolorallocatealpha($resizedImage, 0, 0, 0, 127);
    imagefill($resizedImage, 0, 0, $transparent);

    $copied = imagecopyresampled(
        $resizedImage,
        $sourceImage,
        0,
        0,
        0,
        0,
        $newWidth,
        $newHeight,
        $origWidth,
        $origHeight
    );

    if (!$copied) {
        unset($sourceImage, $resizedImage);

        return ['success' => false, 'error' => 'Error al redimensionar la imagen'];
    }

    $baseDir = __DIR__ . '/../' . ltrim($uploadDir, '/');

    if (!is_dir($baseDir) && !mkdir($baseDir, 0777, true) && !is_dir($baseDir)) {
        unset($sourceImage, $resizedImage);

        return ['success' => false, 'error' => 'No se pudo crear el directorio de imágenes'];
    }

    $fileName = uniqid('product_', true) . '.webp';
    $fileName = str_replace('.', '_', $fileName);

    $targetPath = $baseDir . $fileName;

    $saved = imagewebp($resizedImage, $targetPath, $quality);

    // PHP 8+: los objetos GD se liberan al eliminar sus referencias.
    unset($sourceImage, $resizedImage);

    if (!$saved) {
        return ['success' => false, 'error' => 'Error al guardar la imagen'];
    }

    return [
        'success' => true,
        'path' => $uploadDir . $fileName
    ];
}

// Función para eliminar imagen
function deleteImage(?string $imagePath): bool
{
    if (empty($imagePath)) {
        return true;
    }

    $fullPath = __DIR__ . '/../' . ltrim($imagePath, '/');

    if (file_exists($fullPath) && is_file($fullPath)) {
        return unlink($fullPath);
    }

    return true;
}

try {
    switch ($method) {
        case 'GET':
            // Obtener ingredientes de un producto
            if ($action === 'get_ingredients' && isset($_GET['product_id'])) {
                $productId = (int)$_GET['product_id'];

                $stmt = $pdo->prepare("
                    SELECT pi.*, i.nombre, i.unit
                    FROM product_ingredients pi
                    INNER JOIN inventory_items i ON pi.item_id = i.item_id
                    WHERE pi.product_id = :product_id
                    AND pi.active = 1
                ");

                $stmt->execute([':product_id' => $productId]);

                json_response(true, $stmt->fetchAll(PDO::FETCH_ASSOC));
            }

            // Obtener todos los productos
            if ($action === 'get_all') {
                $stmt = $pdo->prepare("
                    SELECT
                        p.*,
                        c.nombre_categoria
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.category_id
                    ORDER BY p.product_id DESC
                ");

                $stmt->execute();

                json_response(true, $stmt->fetchAll(PDO::FETCH_ASSOC));
            }

            // Obtener categorías
            if ($action === 'get_categories') {
                $stmt = $pdo->prepare("
                    SELECT *
                    FROM categories
                    ORDER BY category_id ASC
                ");

                $stmt->execute();

                json_response(true, $stmt->fetchAll(PDO::FETCH_ASSOC));
            }

            // Obtener inventario
            if ($action === 'get_inventory') {
                $stmt = $pdo->prepare("
                    SELECT item_id, nombre, tipo, unit, stock_on_hand, stock_reserved
                    FROM inventory_items
                    WHERE active = 1
                    ORDER BY nombre ASC
                ");

                $stmt->execute();

                json_response(true, $stmt->fetchAll(PDO::FETCH_ASSOC));
            }

            // Productos por defecto
            $stmt = $pdo->prepare("
                SELECT
                    p.*,
                    c.nombre_categoria
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                ORDER BY p.product_id DESC
            ");

            $stmt->execute();

            json_response(true, $stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        case 'POST':
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

            // Recibe JSON para categorías/eliminación y FormData para imágenes.
            if (str_contains($contentType, 'application/json')) {
                $data = json_decode(file_get_contents('php://input'), true);

                if (!is_array($data)) {
                    json_response(false, null, 'JSON inválido', 400);
                }
            } else {
                $data = $_POST;

                if (isset($_FILES['image'])) {
                    $data['image'] = $_FILES['image'];
                }
            }

            $action = $data['action'] ?? '';

            // Crear producto
            if ($action === 'create') {
                if (!isset($data['nombre'], $data['category_id'], $data['precio'])) {
                    json_response(false, null, 'Faltan campos requeridos', 400);
                }

                $pdo->beginTransaction();
                $imagePath = null;

                if (
                    isset($data['image']) &&
                    is_array($data['image']) &&
                    isset($data['image']['tmp_name']) &&
                    $data['image']['error'] === UPLOAD_ERR_OK
                ) {
                    $uploadResult = processImage($data['image']);

                    if (!$uploadResult['success']) {
                        $pdo->rollBack();
                        json_response(false, null, $uploadResult['error'], 400);
                    }

                    $imagePath = $uploadResult['path'];
                }

                $stmt = $pdo->prepare("
                    INSERT INTO products (
                        nombre,
                        category_id,
                        descripcion,
                        precio,
                        descuento,
                        is_trending,
                        image_url
                    )
                    VALUES (
                        :nombre,
                        :category_id,
                        :descripcion,
                        :precio,
                        :descuento,
                        :is_trending,
                        :image_url
                    )
                ");

                $stmt->execute([
                    ':nombre' => $data['nombre'],
                    ':category_id' => (int)$data['category_id'],
                    ':descripcion' => $data['descripcion'] ?? '',
                    ':precio' => (float)$data['precio'],
                    ':descuento' => (float)($data['descuento'] ?? 0),
                    ':is_trending' => (int)($data['is_trending'] ?? 0),
                    ':image_url' => $imagePath
                ]);

                $productId = (int)$pdo->lastInsertId();

                $ingredients = [];

                if (isset($data['ingredients'])) {
                    $ingredients = is_string($data['ingredients'])
                        ? json_decode($data['ingredients'], true)
                        : $data['ingredients'];
                }

                if (is_array($ingredients)) {
                    $stmtIng = $pdo->prepare("
                        INSERT INTO product_ingredients (
                            product_id,
                            item_id,
                            quantity_required,
                            unit,
                            active
                        )
                        VALUES (
                            :product_id,
                            :item_id,
                            :quantity_required,
                            :unit,
                            1
                        )
                    ");

                    foreach ($ingredients as $ing) {
                        $stmtIng->execute([
                            ':product_id' => $productId,
                            ':item_id' => (int)$ing['item_id'],
                            ':quantity_required' => (float)$ing['quantity_required'],
                            ':unit' => $ing['unit'] ?? 'kg'
                        ]);
                    }
                }

                $pdo->commit();

                json_response(
                    true,
                    [
                        'product_id' => $productId,
                        'image_url' => $imagePath
                    ],
                    'Producto creado'
                );
            }

            // Actualizar producto
            if ($action === 'update') {
                if (!isset($data['product_id'], $data['nombre'], $data['category_id'], $data['precio'])) {
                    json_response(false, null, 'Faltan campos requeridos', 400);
                }

                $productId = (int)$data['product_id'];

                $pdo->beginTransaction();

                $stmt = $pdo->prepare("
                    SELECT image_url
                    FROM products
                    WHERE product_id = :product_id
                ");

                $stmt->execute([':product_id' => $productId]);

                $currentProduct = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$currentProduct) {
                    $pdo->rollBack();
                    json_response(false, null, 'Producto no encontrado', 404);
                }

                $currentImage = $currentProduct['image_url'] ?? null;
                $hasNewImage = false;
                $removeImage = isset($data['remove_image']) && $data['remove_image'] === 'true';
                $imagePath = $currentImage;

                if ($removeImage) {
                    $imagePath = null;
                } elseif (
                    isset($data['image']) &&
                    is_array($data['image']) &&
                    isset($data['image']['tmp_name']) &&
                    $data['image']['error'] === UPLOAD_ERR_OK
                ) {
                    $uploadResult = processImage($data['image']);

                    if (!$uploadResult['success']) {
                        $pdo->rollBack();
                        json_response(false, null, $uploadResult['error'], 400);
                    }

                    $imagePath = $uploadResult['path'];
                    $hasNewImage = true;
                }

                $stmt = $pdo->prepare("
                    UPDATE products
                    SET nombre = :nombre,
                        category_id = :category_id,
                        descripcion = :descripcion,
                        precio = :precio,
                        descuento = :descuento,
                        is_trending = :is_trending,
                        image_url = :image_url
                    WHERE product_id = :product_id
                ");

                $stmt->execute([
                    ':product_id' => $productId,
                    ':nombre' => $data['nombre'],
                    ':category_id' => (int)$data['category_id'],
                    ':descripcion' => $data['descripcion'] ?? '',
                    ':precio' => (float)$data['precio'],
                    ':descuento' => (float)($data['descuento'] ?? 0),
                    ':is_trending' => (int)($data['is_trending'] ?? 0),
                    ':image_url' => $imagePath
                ]);

                // Solo eliminar la anterior después de guardar correctamente la nueva referencia en BD.
                if (($removeImage || $hasNewImage) && !empty($currentImage)) {
                    deleteImage($currentImage);
                }

                $stmt = $pdo->prepare("
                    UPDATE product_ingredients
                    SET active = 0
                    WHERE product_id = :product_id
                ");

                $stmt->execute([':product_id' => $productId]);

                $ingredients = [];

                if (isset($data['ingredients'])) {
                    $ingredients = is_string($data['ingredients'])
                        ? json_decode($data['ingredients'], true)
                        : $data['ingredients'];
                }

                if (is_array($ingredients)) {
                    $stmtIng = $pdo->prepare("
                        INSERT INTO product_ingredients (
                            product_id,
                            item_id,
                            quantity_required,
                            unit,
                            active
                        )
                        VALUES (
                            :product_id,
                            :item_id,
                            :quantity_required,
                            :unit,
                            1
                        )
                    ");

                    foreach ($ingredients as $ing) {
                        $stmtIng->execute([
                            ':product_id' => $productId,
                            ':item_id' => (int)$ing['item_id'],
                            ':quantity_required' => (float)$ing['quantity_required'],
                            ':unit' => $ing['unit'] ?? 'kg'
                        ]);
                    }
                }

                $pdo->commit();

                json_response(
                    true,
                    [
                        'product_id' => $productId,
                        'image_url' => $imagePath
                    ],
                    'Producto actualizado'
                );
            }

            // Eliminar producto
            if ($action === 'delete') {
                if (!isset($data['product_id'])) {
                    json_response(false, null, 'product_id requerido', 400);
                }

                $productId = (int)$data['product_id'];

                $pdo->beginTransaction();

                $stmt = $pdo->prepare("
                    SELECT image_url
                    FROM products
                    WHERE product_id = :product_id
                ");

                $stmt->execute([':product_id' => $productId]);

                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                $stmt = $pdo->prepare("
                    UPDATE product_ingredients
                    SET active = 0
                    WHERE product_id = :product_id
                ");

                $stmt->execute([':product_id' => $productId]);

                $stmt = $pdo->prepare("
                    DELETE FROM products
                    WHERE product_id = :product_id
                ");

                $stmt->execute([':product_id' => $productId]);

                $pdo->commit();

                if ($product && !empty($product['image_url'])) {
                    deleteImage($product['image_url']);
                }

                json_response(true, null, 'Producto eliminado');
            }



            json_response(false, null, 'Acción no válida', 400);
            break;

        default:
            json_response(false, null, 'Método no soportado', 405);
    }
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    json_response(false, null, $e->getMessage(), 500);
}
