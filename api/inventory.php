<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json; charset=utf-8');

switch ($method) {
    case 'GET':
        $itemId = isset($_GET['item_id']) ? (int)$_GET['item_id'] : null;
        $search = trim($_GET['search'] ?? '');
        $status = trim($_GET['status'] ?? 'all');
        $type = trim($_GET['type'] ?? 'all');

        if ($itemId) {
            $stmt = $pdo->prepare("
                SELECT *
                FROM inventory_items
                WHERE item_id = :item_id
            ");
            $stmt->execute([':item_id' => $itemId]);
            echo json_encode(['success' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC) ?: []]);
            break;
        }

        $query = "
            SELECT
                item_id,
                nombre,
                descripcion,
                tipo,
                unit,
                stock_on_hand,
                stock_reserved,
                (stock_on_hand - stock_reserved) AS stock_available,
                stock_min,
                stock_max,
                urgent_alert
            FROM inventory_items
            WHERE 1=1
        ";
        $params = [];

        if ($search !== '') {
            $query .= " AND (nombre LIKE :search OR descripcion LIKE :search)";
            $params[':search'] = "%$search%";
        }

        if ($type !== 'all') {
            $query .= " AND tipo = :tipo";
            $params[':tipo'] = $type;
        }

        if ($status === 'low') {
            $query .= " AND (stock_on_hand - stock_reserved) <= stock_min";
        } elseif ($status === 'out') {
            $query .= " AND (stock_on_hand - stock_reserved) <= 0";
        } elseif ($status === 'ok') {
            $query .= " AND (stock_on_hand - stock_reserved) > stock_min";
        }

        $query .= " ORDER BY nombre ASC";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        $itemId = (int)($data['item_id'] ?? 0);
        $movementType = $data['movement_type'] ?? '';
        $quantity = (float)($data['quantity'] ?? 0);
        $referenceType = $data['reference_type'] ?? 'manual';
        $referenceId = (int)($data['reference_id'] ?? 0);
        $notes = $data['notes'] ?? null;

        if ($itemId <= 0 || $quantity <= 0 || !in_array($movementType, ['in', 'out', 'reserve', 'release', 'adjust'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
            break;
        }

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("SELECT * FROM inventory_items WHERE item_id = :item_id FOR UPDATE");
            $stmt->execute([':item_id' => $itemId]);
            $item = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$item) throw new Exception('Ítem no encontrado');

            $available = (float)$item['stock_on_hand'] - (float)$item['stock_reserved'];

            if ($movementType === 'in') {
                $upd = $pdo->prepare("UPDATE inventory_items SET stock_on_hand = stock_on_hand + :qty WHERE item_id = :item_id");
                $upd->execute([':qty' => $quantity, ':item_id' => $itemId]);
            } elseif ($movementType === 'out') {
                if ($available < $quantity) throw new Exception('Stock insuficiente');
                $upd = $pdo->prepare("UPDATE inventory_items SET stock_on_hand = stock_on_hand - :qty WHERE item_id = :item_id");
                $upd->execute([':qty' => $quantity, ':item_id' => $itemId]);
            } elseif ($movementType === 'reserve') {
                if ($available < $quantity) throw new Exception('Stock insuficiente');
                $upd = $pdo->prepare("UPDATE inventory_items SET stock_reserved = stock_reserved + :qty WHERE item_id = :item_id");
                $upd->execute([':qty' => $quantity, ':item_id' => $itemId]);
            } elseif ($movementType === 'release') {
                $upd = $pdo->prepare("UPDATE inventory_items SET stock_reserved = GREATEST(stock_reserved - :qty, 0) WHERE item_id = :item_id");
                $upd->execute([':qty' => $quantity, ':item_id' => $itemId]);
            } else {
                $upd = $pdo->prepare("UPDATE inventory_items SET stock_on_hand = GREATEST(stock_on_hand + :qty, 0) WHERE item_id = :item_id");
                $upd->execute([':qty' => $quantity, ':item_id' => $itemId]);
            }

            $mov = $pdo->prepare("
                INSERT INTO inventory_movements
                (item_id, movement_type, quantity, reference_type, reference_id, notes)
                VALUES (:item_id, :movement_type, :quantity, :reference_type, :reference_id, :notes)
            ");
            $mov->execute([
                ':item_id' => $itemId,
                ':movement_type' => $movementType,
                ':quantity' => $quantity,
                ':reference_type' => $referenceType,
                ':reference_id' => $referenceId,
                ':notes' => $notes
            ]);

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Movimiento registrado']);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $itemId = (int)($data['item_id'] ?? 0);

        if ($itemId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'item_id requerido']);
            break;
        }

        try {
            $fields = [];
            $params = [':item_id' => $itemId];

            foreach (['nombre', 'descripcion', 'tipo', 'unit', 'stock_min', 'stock_max', 'urgent_alert'] as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            if (!$fields) {
                throw new Exception('No hay datos para actualizar');
            }

            $sql = "UPDATE inventory_items SET " . implode(', ', $fields) . " WHERE item_id = :item_id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['success' => true, 'message' => 'Ítem actualizado']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método no soportado']);
        break;
}
?>