<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

header('Content-Type: application/json; charset=utf-8');

// Función global para respuestas JSON
function json_response($success, $data = null, $error = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ]);
    exit;
}

// Función para procesar imagen (redimensionar y comprimir)
function processImage($file, $uploadDir = '/uploads/products/', $maxWidth = 800, $maxHeight = 800, $quality = 80) {
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        return ['success' => false, 'error' => 'Archivo no válido'];
    }

    if (!in_array($file['type'], $allowedTypes)) {
        return ['success' => false, 'error' => 'Tipo de archivo no permitido'];
    }

    if ($file['size'] > $maxSize) {
        return ['success' => false, 'error' => 'Archivo muy grande (máx 5MB)'];
    }

    // Obtener dimensiones originales
    list($origWidth, $origHeight) = getimagesize($file['tmp_name']);

    // Calcular nuevas dimensiones manteniendo aspect ratio
    $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);
    $newWidth = (int)($origWidth * $ratio);
    $newHeight = (int)($origHeight * $ratio);

    // Crear imagen desde el archivo temporal
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

    // Crear imagen redimensionada
    $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
    
    // Preservar transparencia para PNG y GIF
    if ($file['type'] === 'image/png' || $file['type'] === 'image/gif') {
        imagealphablending($resizedImage, false);
        imagesavealpha($resizedImage, true);
        $transparent = imagecolorallocatealpha($resizedImage, 0, 0, 0, 127);
        imagefill($resizedImage, 0, 0, $newWidth, $newHeight, $transparent);
    }

    imagecopyresampled($resizedImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

    // Generar nombre de archivo
    $baseDir = __DIR__ . '/../' . ltrim($uploadDir, '/');
    
    if (!file_exists($baseDir)) {
        mkdir($baseDir, 0777, true);
    }

    $fileName = uniqid() . '.webp'; // Siempre guardar como WebP para mejor compresión
    $targetPath = $baseDir . $fileName;

    // Guardar como WebP (mejor compresión)
    if (imagewebp($resizedImage, $targetPath, $quality)) {
        imagedestroy($sourceImage);
        imagedestroy($resizedImage);
        return ['success' => true, 'path' => $uploadDir . $fileName];
    }

    imagedestroy($sourceImage);
    imagedestroy($resizedImage);
    
    return ['success' => false, 'error' => 'Error al guardar la imagen'];
}

// Función para eliminar imagen
function deleteImage($imagePath) {
    if (empty($imagePath)) {
        return true;
    }

    $fullPath = __DIR__ . '/../' . ltrim($imagePath, '/');
    
    if (file_exists($fullPath)) {
        return unlink($fullPath);
    }
    
    return true; // Si no existe, consideramos éxito
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
                    WHERE pi.product_id = :product_id AND pi.active = 1
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
                    SELECT * FROM categories
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

            // Default
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
            
            // Parsear JSON o FormData
            if (strpos($contentType, 'application/json') !== false) {
                $data = json_decode(file_get_contents('php://input'), true);
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

                // Manejar imagen
                $imagePath = null;
                if (isset($data['image']) && is_array($data['image']) && isset($data['image']['tmp_name'])) {
                    $uploadResult = processImage($data['image']);
                    
                    if (!$uploadResult['success']) {
                        $pdo->rollBack();
                        json_response(false, null, $uploadResult['error'], 400);
                    }
                    
                    $imagePath = $uploadResult['path'];
                }

                $stmt = $pdo->prepare("
                    INSERT INTO products (nombre, category_id, descripcion, precio, descuento, is_trending, image_url)
                    VALUES (:nombre, :category_id, :descripcion, :precio, :descuento, :is_trending, :image_url)
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

                // Guardar ingredientes
                if (isset($data['ingredients']) && is_array($data['ingredients'])) {
                    $ingredients = is_string($data['ingredients']) 
                        ? json_decode($data['ingredients'], true) 
                        : $data['ingredients'];

                    if (is_array($ingredients)) {
                        $stmtIng = $pdo->prepare("
                            INSERT INTO product_ingredients (product_id, item_id, quantity_required, unit, active)
                            VALUES (:product_id, :item_id, :quantity_required, :unit, 1)
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
                }

                $pdo->commit();
                json_response(true, ['product_id' => $productId, 'image_url' => $imagePath], 'Producto creado');
            }

            // Actualizar producto
            if ($action === 'update') {
                if (!isset($data['product_id'], $data['nombre'], $data['category_id'], $data['precio'])) {
                    json_response(false, null, 'Faltan campos requeridos', 400);
                }

                $productId = (int)$data['product_id'];

                $pdo->beginTransaction();

                // Obtener imagen actual
                $stmt = $pdo->prepare("SELECT image_url FROM products WHERE product_id = :product_id");
                $stmt->execute([':product_id' => $productId]);
                $currentProduct = $stmt->fetch(PDO::FETCH_ASSOC);
                $currentImage = $currentProduct['image_url'] ?? null;

                // Manejar nueva imagen
                $imagePath = null;
                $removeImage = isset($data['remove_image']) && $data['remove_image'] === 'true';

                if ($removeImage) {
                    // Eliminar imagen actual
                    deleteImage($currentImage);
                    $imagePath = null;
                } elseif (isset($data['image']) && is_array($data['image']) && isset($data['image']['tmp_name'])) {
                    // Procesar nueva imagen y eliminar la vieja
                    $uploadResult = processImage($data['image']);
                    
                    if (!$uploadResult['success']) {
                        $pdo->rollBack();
                        json_response(false, null, $uploadResult['error'], 400);
                    }
                    
                    // Eliminar imagen anterior
                    deleteImage($currentImage);
                    
                    $imagePath = $uploadResult['path'];
                }

                // Actualizar producto
                if ($imagePath !== null) {
                    // Se actualiza la imagen (nueva o null)
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
                } else {
                    // Mantener imagen actual
                    $stmt = $pdo->prepare("
                        UPDATE products 
                        SET nombre = :nombre, 
                            category_id = :category_id, 
                            descripcion = :descripcion, 
                            precio = :precio, 
                            descuento = :descuento, 
                            is_trending = :is_trending
                        WHERE product_id = :product_id
                    ");
                    $stmt->execute([
                        ':product_id' => $productId,
                        ':nombre' => $data['nombre'],
                        ':category_id' => (int)$data['category_id'],
                        ':descripcion' => $data['descripcion'] ?? '',
                        ':precio' => (float)$data['precio'],
                        ':descuento' => (float)($data['descuento'] ?? 0),
                        ':is_trending' => (int)($data['is_trending'] ?? 0)
                    ]);
                }

                // Eliminar ingredientes existentes
                $stmt = $pdo->prepare("UPDATE product_ingredients SET active = 0 WHERE product_id = :product_id");
                $stmt->execute([':product_id' => $productId]);

                // Guardar nuevos ingredientes
                if (isset($data['ingredients']) && is_array($data['ingredients'])) {
                    $ingredients = is_string($data['ingredients']) 
                        ? json_decode($data['ingredients'], true) 
                        : $data['ingredients'];

                    if (is_array($ingredients)) {
                        $stmtIng = $pdo->prepare("
                            INSERT INTO product_ingredients (product_id, item_id, quantity_required, unit, active)
                            VALUES (:product_id, :item_id, :quantity_required, :unit, 1)
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
                }

                $pdo->commit();
                json_response(true, null, 'Producto actualizado');
            }

            // Eliminar producto
            if ($action === 'delete') {
                if (!isset($data['product_id'])) {
                    json_response(false, null, 'product_id requerido', 400);
                }

                $productId = (int)$data['product_id'];

                $pdo->beginTransaction();

                // Obtener imagen para eliminarla
                $stmt = $pdo->prepare("SELECT image_url FROM products WHERE product_id = :product_id");
                $stmt->execute([':product_id' => $productId]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($product && $product['image_url']) {
                    deleteImage($product['image_url']);
                }

                // Desactivar ingredientes
                $stmt = $pdo->prepare("UPDATE product_ingredients SET active = 0 WHERE product_id = :product_id");
                $stmt->execute([':product_id' => $productId]);

                // Eliminar producto
                $stmt = $pdo->prepare("DELETE FROM products WHERE product_id = :product_id");
                $stmt->execute([':product_id' => $productId]);

                $pdo->commit();
                json_response(true, null, 'Producto eliminado');
            }

            // Crear categoría
            if ($action === 'create_category') {
                if (!isset($data['nombre_categoria'])) {
                    json_response(false, null, 'nombre_categoria requerido', 400);
                }

                $stmt = $pdo->prepare("INSERT INTO categories (nombre_categoria) VALUES (:nombre_categoria)");
                $stmt->execute([':nombre_categoria' => $data['nombre_categoria']]);

                json_response(true, ['category_id' => (int)$pdo->lastInsertId()], 'Categoría creada');
            }

            // Actualizar categoría
            if ($action === 'update_category') {
                if (!isset($data['category_id'], $data['nombre_categoria'])) {
                    json_response(false, null, 'Faltan campos requeridos', 400);
                }

                $stmt = $pdo->prepare("UPDATE categories SET nombre_categoria = :nombre_categoria WHERE category_id = :category_id");
                $stmt->execute([
                    ':category_id' => (int)$data['category_id'],
                    ':nombre_categoria' => $data['nombre_categoria']
                ]);

                json_response(true, null, 'Categoría actualizada');
            }

            // Eliminar categoría
            if ($action === 'delete_category') {
                if (!isset($data['category_id'])) {
                    json_response(false, null, 'category_id requerido', 400);
                }

                $stmt = $pdo->prepare("DELETE FROM categories WHERE category_id = :category_id");
                $stmt->execute([':category_id' => (int)$data['category_id']]);

                json_response(true, null, 'Categoría eliminada');
            }

            json_response(false, null, 'Acción no válida', 400);
            break;


        default:
            json_response(false, null, 'Método no soportado', 405);
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(false, null, $e->getMessage(), 500);
}
?>