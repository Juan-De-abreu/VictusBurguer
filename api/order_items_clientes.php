<?php
require_once __DIR__ . '/../config/database.php';

session_start();

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

$user = $_SESSION['user'] ?? null;

function isPrivilegedRole($rol) {
    return in_array($rol, ['admin', 'contador'], true) || in_array((int)$rol, [4, 5], true);
}

switch ($method) {
    case 'GET':
        $itemId = isset($_GET['order_item_id']) ? (int)$_GET['order_item_id'] : null;
        $orderId = isset($_GET['order_id']) ? (int)$_GET['order_id'] : null;

        $query = "
            SELECT oi.*, o.user_id
            FROM order_items_clientes oi
            INNER JOIN orders_clientes o ON o.order_id = oi.order_id
            WHERE 1=1
        ";
        $params = [];

        if ($user && !isPrivilegedRole($user['rol'])) {
            $query .= " AND o.user_id = :user_id";
            $params[':user_id'] = (int)$user['user_id'];
        }

        if ($itemId) {
            $query .= " AND oi.order_item_id = :order_item_id";
            $params[':order_item_id'] = $itemId;
        }

        if ($orderId) {
            $query .= " AND oi.order_id = :order_id";
            $params[':order_id'] = $orderId;
        }

        $query .= " ORDER BY oi.order_item_id ASC";

        $stmt = $pdo->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            echo json_encode(['error' => 'JSON inválido']);
            break;
        }

        $query = "
            INSERT INTO order_items_clientes
            (order_id, product_id, product_name, quantity, unit_price, line_total)
            VALUES
            (:order_id, :product_id, :product_name, :quantity, :unit_price, :line_total)
        ";

        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':order_id', (int)($data['order_id'] ?? 0), PDO::PARAM_INT);
        $stmt->bindValue(':product_id', (int)($data['product_id'] ?? 0), PDO::PARAM_INT);
        $stmt->bindValue(':product_name', $data['product_name'] ?? '');
        $stmt->bindValue(':quantity', (int)($data['quantity'] ?? 1), PDO::PARAM_INT);
        $stmt->bindValue(':unit_price', $data['unit_price'] ?? 0);
        $stmt->bindValue(':line_total', $data['line_total'] ?? 0);

        $stmt->execute();
        echo json_encode(['success' => true, 'order_item_id' => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        parse_str(file_get_contents("php://input"), $data);
        $itemId = isset($data['order_item_id']) ? (int)$data['order_item_id'] : 0;

        if (!$itemId) {
            echo json_encode(['error' => 'order_item_id requerido']);
            break;
        }

        $fields = [];
        $params = [':order_item_id' => $itemId];

        foreach (['product_name', 'quantity', 'unit_price', 'line_total'] as $field) {
            if (isset($data[$field]) && $data[$field] !== '') {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) {
            echo json_encode(['error' => 'No hay campos para actualizar']);
            break;
        }

        $query = "UPDATE order_items_clientes SET " . implode(', ', $fields) . " WHERE order_item_id = :order_item_id";
        $stmt = $pdo->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Item actualizado']);
        break;

    case 'DELETE':
        parse_str(file_get_contents("php://input"), $data);
        $itemId = isset($data['order_item_id']) ? (int)$data['order_item_id'] : 0;

        if (!$itemId) {
            echo json_encode(['error' => 'order_item_id requerido']);
            break;
        }

        $stmt = $pdo->prepare("DELETE FROM order_items_clientes WHERE order_item_id = :order_item_id");
        $stmt->bindValue(':order_item_id', $itemId, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Item eliminado']);
        break;
}
?>