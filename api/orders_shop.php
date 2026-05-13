<?php
require_once __DIR__ . '/../config/database.php';

session_start();

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $shopOrderId = isset($_GET['shop_order_id']) ? (int)$_GET['shop_order_id'] : null;
        $status = trim($_GET['payment_status'] ?? '');
        $currency = trim($_GET['currency'] ?? '');

        if ($shopOrderId) {
            $query = "
                SELECT
                    os.*,
                    u.nombre AS user_nombre,
                    u.email AS user_email,
                    u.telefono AS user_telefono,
                    u.rol AS user_rol,
                    u.user_id AS user_id_usuario
                FROM orders_shop os
                INNER JOIN users u ON u.user_id = os.user_id
                WHERE os.shop_order_id = :shop_order_id
                LIMIT 1
            ";
            $stmt = $pdo->prepare($query);
            $stmt->bindValue(':shop_order_id', $shopOrderId, PDO::PARAM_INT);
            $stmt->execute();
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: []);
            break;
        }

        $query = "
            SELECT
                os.*,
                u.nombre AS user_nombre,
                u.email AS user_email,
                u.telefono AS user_telefono,
                u.rol AS user_rol,
                u.user_id AS user_id_usuario
            FROM orders_shop os
            INNER JOIN users u ON u.user_id = os.user_id
            WHERE 1=1
        ";
        $params = [];

        if ($status !== '') {
            $query .= " AND os.payment_status = :payment_status";
            $params[':payment_status'] = $status;
        }

        if ($currency !== '') {
            $query .= " AND os.currency = :currency";
            $params[':currency'] = $currency;
        }

        $query .= " ORDER BY os.created_at DESC";

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
            INSERT INTO orders_shop
            (order_number, order_type, expense_category, payment_status, currency, payment_method, subtotal, tax_total, discount_total, total, note)
            VALUES
            (:order_number, 'expense', :expense_category, :payment_status, :currency, :payment_method, :subtotal, :tax_total, :discount_total, :total, :note)
        ";

        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':order_number', $data['order_number'] ?? '');
        $stmt->bindValue(':expense_category', $data['expense_category'] ?? 'otros');
        $stmt->bindValue(':payment_status', $data['payment_status'] ?? 'pendiente');
        $stmt->bindValue(':currency', $data['currency'] ?? 'USD');
        $stmt->bindValue(':payment_method', $data['payment_method'] ?? null);
        $stmt->bindValue(':subtotal', $data['subtotal'] ?? 0);
        $stmt->bindValue(':tax_total', $data['tax_total'] ?? 0);
        $stmt->bindValue(':discount_total', $data['discount_total'] ?? 0);
        $stmt->bindValue(':total', $data['total'] ?? 0);
        $stmt->bindValue(':note', $data['note'] ?? null);

        $stmt->execute();
        echo json_encode(['success' => true, 'shop_order_id' => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        parse_str(file_get_contents("php://input"), $data);
        $shopOrderId = isset($data['shop_order_id']) ? (int)$data['shop_order_id'] : 0;

        if (!$shopOrderId) {
            echo json_encode(['error' => 'shop_order_id requerido']);
            break;
        }

        $fields = [];
        $params = [':shop_order_id' => $shopOrderId];

        foreach (['expense_category', 'payment_status', 'currency', 'payment_method', 'subtotal', 'tax_total', 'discount_total', 'total', 'note'] as $field) {
            if (isset($data[$field]) && $data[$field] !== '') {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) {
            echo json_encode(['error' => 'No hay campos para actualizar']);
            break;
        }

        $query = "UPDATE orders_shop SET " . implode(', ', $fields) . " WHERE shop_order_id = :shop_order_id";
        $stmt = $pdo->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Orden actualizada']);
        break;

    case 'DELETE':
        parse_str(file_get_contents("php://input"), $data);
        $shopOrderId = isset($data['shop_order_id']) ? (int)$data['shop_order_id'] : 0;

        if (!$shopOrderId) {
            echo json_encode(['error' => 'shop_order_id requerido']);
            break;
        }

        $stmt = $pdo->prepare("DELETE FROM orders_shop WHERE shop_order_id = :shop_order_id");
        $stmt->bindValue(':shop_order_id', $shopOrderId, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Orden eliminada']);
        break;
}
?>