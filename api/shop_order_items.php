<?php
require_once __DIR__ . '/../config/database.php';

session_start();

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $itemId = isset($_GET['item_id']) ? (int)$_GET['item_id'] : null;
        $shopOrderId = isset($_GET['shop_order_id']) ? (int)$_GET['shop_order_id'] : null;

        $query = "SELECT * FROM shop_order_items WHERE 1=1";
        $params = [];

        if ($itemId) {
            $query .= " AND item_id = :item_id";
            $params[':item_id'] = $itemId;
        }

        if ($shopOrderId) {
            $query .= " AND shop_order_id = :shop_order_id";
            $params[':shop_order_id'] = $shopOrderId;
        }

        $query .= " ORDER BY item_id ASC";

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
            INSERT INTO shop_order_items
            (shop_order_id, concept_name, quantity, unit_price, line_total)
            VALUES
            (:shop_order_id, :concept_name, :quantity, :unit_price, :line_total)
        ";

        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':shop_order_id', (int)($data['shop_order_id'] ?? 0), PDO::PARAM_INT);
        $stmt->bindValue(':concept_name', $data['concept_name'] ?? '');
        $stmt->bindValue(':quantity', (int)($data['quantity'] ?? 1), PDO::PARAM_INT);
        $stmt->bindValue(':unit_price', $data['unit_price'] ?? 0);
        $stmt->bindValue(':line_total', $data['line_total'] ?? 0);

        $stmt->execute();
        echo json_encode(['success' => true, 'item_id' => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        parse_str(file_get_contents("php://input"), $data);
        $itemId = isset($data['item_id']) ? (int)$data['item_id'] : 0;

        if (!$itemId) {
            echo json_encode(['error' => 'item_id requerido']);
            break;
        }

        $fields = [];
        $params = [':item_id' => $itemId];

        foreach (['concept_name', 'quantity', 'unit_price', 'line_total'] as $field) {
            if (isset($data[$field]) && $data[$field] !== '') {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) {
            echo json_encode(['error' => 'No hay campos para actualizar']);
            break;
        }

        $query = "UPDATE shop_order_items SET " . implode(', ', $fields) . " WHERE item_id = :item_id";
        $stmt = $pdo->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Item actualizado']);
        break;

    case 'DELETE':
        parse_str(file_get_contents("php://input"), $data);
        $itemId = isset($data['item_id']) ? (int)$data['item_id'] : 0;

        if (!$itemId) {
            echo json_encode(['error' => 'item_id requerido']);
            break;
        }

        $stmt = $pdo->prepare("DELETE FROM shop_order_items WHERE item_id = :item_id");
        $stmt->bindValue(':item_id', $itemId, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Item eliminado']);
        break;
}
?>