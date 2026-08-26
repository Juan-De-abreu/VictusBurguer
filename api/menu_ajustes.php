<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$uploadDir = __DIR__ . '/../uploads/products/';
$baseUrl = 'http://localhost:8081/victus-backend/uploads/products/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

switch ($method) {
    case 'GET':
        if ($action === 'get_all') {
            getAllProducts($pdo);
        } elseif ($action === 'get_one' && isset($_GET['product_id'])) {
            getProduct($pdo, (int)$_GET['product_id']);
        } elseif ($action === 'get_inventory') {
            getInventory($pdo);
        } else {
            errorResponse(400, 'Acción inválida');
        }
        break;
    
    case 'POST':
        if ($action === 'create') {
            createProduct($pdo, $uploadDir, $baseUrl);
        } elseif ($action === 'update') {
            updateProduct($pdo, $uploadDir, $baseUrl);
        } elseif ($action === 'delete') {
            deleteProduct($pdo, $uploadDir);
        } else {
            errorResponse(400, 'Acción inválida');
        }
        break;
    
    default:
        errorResponse(405, 'Método no permitido');
}

function getAllProducts($pdo): void {
    $stmt = $pdo->query("
        SELECT p.*, c.nombre_categoria
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.product_id ASC
    ");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
}

function getProduct($pdo, int $product_id): void {
    $stmt = $pdo->prepare("SELECT * FROM products WHERE product_id = :id");
    $stmt->execute([':id' => $product_id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$product) {
        errorResponse(404, 'Producto no encontrado');
        return;
    }
    
    $stmt = $pdo->prepare("
        SELECT pi.*, i.nombre AS ingredient_name, i.tipo AS ingredient_type, i.unit AS ingredient_unit
        FROM product_ingredients pi
        INNER JOIN inventory_items i ON i.item_id = pi.item_id
        WHERE pi.product_id = :product_id AND pi.active = 1
    ");
    $stmt->execute([':product_id' => $product_id]);
    $ingredients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'product' => $product,
            'ingredients' => $ingredients
        ]
    ], JSON_UNESCAPED_UNICODE);
}

function getInventory($pdo): void {
    $stmt = $pdo->query("
        SELECT item_id, nombre, tipo, unit, stock_on_hand
        FROM inventory_items
        WHERE active = 1
        ORDER BY nombre ASC
    ");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
}

function createProduct($pdo, string $uploadDir, string $baseUrl): void {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['nombre'], $input['category_id'], $input['precio'])) {
        errorResponse(400, 'Faltan campos requeridos');
        return;
    }
    
    $image_url = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $image_url = uploadImage($_FILES['image'], $uploadDir, $baseUrl);
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO products (category_id, nombre, descripcion, precio, descuento, is_trending, image_url)
        VALUES (:category_id, :nombre, :descripcion, :precio, :descuento, :is_trending, :image_url)
    ");
    
    $stmt->execute([
        ':category_id' => (int)$input['category_id'],
        ':nombre' => $input['nombre'],
        ':descripcion' => $input['descripcion'] ?? '',
        ':precio' => (float)$input['precio'],
        ':descuento' => (float)($input['descuento'] ?? 0),
        ':is_trending' => (int)($input['is_trending'] ?? 0),
        ':image_url' => $image_url ?: null
    ]);
    
    $product_id = (int)$pdo->lastInsertId();
    
    if (isset($input['ingredients']) && is_array($input['ingredients'])) {
        saveIngredients($pdo, $product_id, $input['ingredients']);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Producto creado',
        'product_id' => $product_id
    ]);
}

function updateProduct($pdo, string $uploadDir, string $baseUrl): void {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['product_id'], $input['nombre'], $input['category_id'], $input['precio'])) {
        errorResponse(400, 'Faltan campos requeridos');
        return;
    }
    
    $product_id = (int)$input['product_id'];
    
    $stmt = $pdo->prepare("SELECT image_url FROM products WHERE product_id = :id");
    $stmt->execute([':id' => $product_id]);
    $current = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $image_url = $current['image_url'] ?? '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $image_url = uploadImage($_FILES['image'], $uploadDir, $baseUrl);
        if ($current['image_url'] && strpos($current['image_url'], 'localhost') !== false) {
            $oldPath = $uploadDir . basename($current['image_url']);
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }
    } elseif (isset($input['remove_image']) && $input['remove_image'] === true) {
        $image_url = null;
        if ($current['image_url'] && strpos($current['image_url'], 'localhost') !== false) {
            $oldPath = $uploadDir . basename($current['image_url']);
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }
    }
    
    $stmt = $pdo->prepare("
        UPDATE products
        SET category_id = :category_id,
            nombre = :nombre,
            descripcion = :descripcion,
            precio = :precio,
            descuento = :descuento,
            is_trending = :is_trending,
            image_url = :image_url
        WHERE product_id = :product_id
    ");
    
    $stmt->execute([
        ':product_id' => $product_id,
        ':category_id' => (int)$input['category_id'],
        ':nombre' => $input['nombre'],
        ':descripcion' => $input['descripcion'] ?? '',
        ':precio' => (float)$input['precio'],
        ':descuento' => (float)($input['descuento'] ?? 0),
        ':is_trending' => (int)($input['is_trending'] ?? 0),
        ':image_url' => $image_url
    ]);
    
    if (isset($input['ingredients']) && is_array($input['ingredients'])) {
        $pdo->prepare("DELETE FROM product_ingredients WHERE product_id = :product_id")->execute([':product_id' => $product_id]);
        saveIngredients($pdo, $product_id, $input['ingredients']);
    }
    
    echo json_encode(['success' => true, 'message' => 'Producto actualizado']);
}

function deleteProduct($pdo, string $uploadDir): void {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['product_id'])) {
        errorResponse(400, 'Falta product_id');
        return;
    }
    
    $product_id = (int)$input['product_id'];
    
    $stmt = $pdo->prepare("SELECT image_url FROM products WHERE product_id = :id");
    $stmt->execute([':id' => $product_id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($product && $product['image_url'] && strpos($product['image_url'], 'localhost') !== false) {
        $imagePath = $uploadDir . basename($product['image_url']);
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }
    
    $pdo->prepare("DELETE FROM product_ingredients WHERE product_id = :product_id")->execute([':product_id' => $product_id]);
    $pdo->prepare("DELETE FROM products WHERE product_id = :product_id")->execute([':product_id' => $product_id]);
    
    echo json_encode(['success' => true, 'message' => 'Producto eliminado']);
}

function saveIngredients($pdo, int $product_id, array $ingredients): void {
    $stmt = $pdo->prepare("
        INSERT INTO product_ingredients (product_id, item_id, quantity_required, unit, active)
        VALUES (:product_id, :item_id, :quantity_required, :unit, 1)
    ");
    
    foreach ($ingredients as $ing) {
        if (!isset($ing['item_id'], $ing['quantity_required'], $ing['unit'])) {
            continue;
        }
        
        $stmt->execute([
            ':product_id' => $product_id,
            ':item_id' => (int)$ing['item_id'],
            ':quantity_required' => (float)$ing['quantity_required'],
            ':unit' => $ing['unit']
        ]);
    }
}

function uploadImage(array $file, string $uploadDir, string $baseUrl): string {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    $maxSize = 5 * 1024 * 1024;
    
    if (!in_array($file['type'], $allowedTypes)) {
        errorResponse(400, 'Tipo de archivo no permitido');
    }
    
    if ($file['size'] > $maxSize) {
        errorResponse(400, 'Archivo muy grande (máx 5MB)');
    }
    
    $filename = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file['name']);
    $targetPath = $uploadDir . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        errorResponse(500, 'Error al guardar imagen');
    }
    
    return $baseUrl . $filename;
}

function errorResponse(int $code, string $message): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}
?>