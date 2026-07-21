<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$pdo = $db->connect();
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json; charset=utf-8');

function json_response($success, $data = null, $error = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ]);
    exit;
}

function ensureInventoryItem($pdo, $itemId) {
    $stmt = $pdo->prepare("SELECT * FROM inventory_items WHERE item_id = :item_id FOR UPDATE");
    $stmt->execute([':item_id' => $itemId]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$item) {
        throw new Exception('Ítem no encontrado');
    }
    return $item;
}

function createAlertIfNeeded($pdo, $itemId, $available, $minStock, $nombre) {
    if ($available <= 0) {
        $type = 'out_of_stock';
        $severity = 'critical';
        $message = "Agotado: {$nombre}";
    } elseif ($available <= $minStock) {
        $type = 'low_stock';
        $severity = 'high';
        $message = "Stock urgente: {$nombre} disponible {$available}, mínimo {$minStock}";
    } else {
        return;
    }

    $check = $pdo->prepare("
        SELECT alert_id FROM inventory_alerts
        WHERE item_id = :item_id AND status = 'open' AND alert_type = :alert_type
        ORDER BY alert_id DESC LIMIT 1
    ");
    $check->execute([
        ':item_id' => $itemId,
        ':alert_type' => $type
    ]);

    if (!$check->fetch()) {
        $ins = $pdo->prepare("
            INSERT INTO inventory_alerts (item_id, alert_type, message, status, severity)
            VALUES (:item_id, :alert_type, :message, 'open', :severity)
        ");
        $ins->execute([
            ':item_id' => $itemId,
            ':alert_type' => $type,
            ':message' => $message,
            ':severity' => $severity
        ]);
    }
}

try {
    switch ($method) {
        case 'GET':
            $itemId = isset($_GET['item_id']) ? (int)$_GET['item_id'] : null;
            $movements = isset($_GET['movements']) ? (int)$_GET['movements'] : 0;
            $search = trim($_GET['search'] ?? '');
            $status = trim($_GET['status'] ?? 'all');
            $type = trim($_GET['type'] ?? 'all');

            if ($itemId && $movements === 1) {
                $stmt = $pdo->prepare("
                    SELECT *
                    FROM inventory_movements
                    WHERE item_id = :item_id
                    ORDER BY created_at DESC, movement_id DESC
                ");
                $stmt->execute([':item_id' => $itemId]);
                json_response(true, $stmt->fetchAll(PDO::FETCH_ASSOC));
            }

            if ($itemId) {
                $stmt = $pdo->prepare("
                    SELECT
                        i.*,
                        (i.stock_on_hand - i.stock_reserved) AS stock_available
                    FROM inventory_items i
                    WHERE i.item_id = :item_id
                ");
                $stmt->execute([':item_id' => $itemId]);
                json_response(true, $stmt->fetch(PDO::FETCH_ASSOC) ?: []);
            }

            $query = "
                SELECT
                    i.*,
                    (i.stock_on_hand - i.stock_reserved) AS stock_available,
                    COALESCE(a.alert_count, 0) AS alert_count
                FROM inventory_items i
                LEFT JOIN (
                    SELECT item_id, COUNT(*) AS alert_count
                    FROM inventory_alerts
                    WHERE status = 'open'
                    GROUP BY item_id
                ) a ON a.item_id = i.item_id
                WHERE i.active = 1
            ";
            $params = [];

            if ($search !== '') {
                $query .= " AND (i.nombre LIKE :search OR i.descripcion LIKE :search)";
                $params[':search'] = "%$search%";
            }

            if ($type !== 'all') {
                $query .= " AND i.tipo = :tipo";
                $params[':tipo'] = $type;
            }

            if ($status === 'ok') {
                $query .= " AND (i.stock_on_hand - i.stock_reserved) > i.stock_min";
            } elseif ($status === 'low') {
                $query .= " AND (i.stock_on_hand - i.stock_reserved) <= i.stock_min AND (i.stock_on_hand - i.stock_reserved) > 0";
            } elseif ($status === 'out') {
                $query .= " AND (i.stock_on_hand - i.stock_reserved) <= 0";
            } elseif ($status === 'urgent') {
                $query .= " AND (i.stock_on_hand - i.stock_reserved) <= 1000";
            }

            $query .= " ORDER BY i.nombre ASC";

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            json_response(true, $stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            $itemId = (int)($data['item_id'] ?? 0);
            $movementType = $data['movement_type'] ?? '';
            $quantity = (float)($data['quantity'] ?? 0);
            $referenceType = $data['reference_type'] ?? 'manual';
            $referenceId = (int)($data['reference_id'] ?? 0);
            $notes = $data['notes'] ?? null;
            $createdBy = isset($data['created_by']) ? (int)$data['created_by'] : null;

            if ($itemId <= 0 || $quantity <= 0 || !in_array($movementType, ['in', 'out', 'reserve', 'release', 'adjust'])) {
                json_response(false, null, 'Datos inválidos', 400);
            }

            $pdo->beginTransaction();

            $item = ensureInventoryItem($pdo, $itemId);
            $available = (float)$item['stock_on_hand'] - (float)$item['stock_reserved'];

            if ($movementType === 'in') {
                $upd = $pdo->prepare("UPDATE inventory_items SET stock_on_hand = stock_on_hand + :qty WHERE item_id = :item_id");
                $upd->execute([':qty' => $quantity, ':item_id' => $itemId]);
            } elseif ($movementType === 'out') {
                if ($available < $quantity) {
                    throw new Exception('Stock insuficiente');
                }
                $upd = $pdo->prepare("UPDATE inventory_items SET stock_on_hand = stock_on_hand - :qty WHERE item_id = :item_id");
                $upd->execute([':qty' => $quantity, ':item_id' => $itemId]);
            } elseif ($movementType === 'reserve') {
                if ($available < $quantity) {
                    throw new Exception('Stock insuficiente para reservar');
                }
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
                (item_id, movement_type, quantity, reference_type, reference_id, notes, created_by)
                VALUES (:item_id, :movement_type, :quantity, :reference_type, :reference_id, :notes, :created_by)
            ");
            $mov->execute([
                ':item_id' => $itemId,
                ':movement_type' => $movementType,
                ':quantity' => $quantity,
                ':reference_type' => $referenceType,
                ':reference_id' => $referenceId,
                ':notes' => $notes,
                ':created_by' => $createdBy
            ]);

            $stmt = $pdo->prepare("SELECT * FROM inventory_items WHERE item_id = :item_id");
            $stmt->execute([':item_id' => $itemId]);
            $updated = $stmt->fetch(PDO::FETCH_ASSOC);

            $availableAfter = (float)$updated['stock_on_hand'] - (float)$updated['stock_reserved'];
            createAlertIfNeeded($pdo, $itemId, $availableAfter, (float)$updated['stock_min'], $updated['nombre']);

            $pdo->commit();
            json_response(true, null, 'Movimiento registrado');
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $itemId = (int)($data['item_id'] ?? 0);

            if ($itemId <= 0) {
                json_response(false, null, 'item_id requerido', 400);
            }

            $pdo->beginTransaction();

            $item = ensureInventoryItem($pdo, $itemId);

            $fields = [];
            $params = [':item_id' => $itemId];

            foreach (['nombre', 'descripcion', 'tipo', 'unit', 'stock_min', 'stock_max', 'urgent_alert', 'active'] as $field) {
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

            $after = $data;
            $audit = $pdo->prepare("
                INSERT INTO inventory_audit_log
                (entity_type, entity_id, action, before_data, after_data, user_id)
                VALUES ('inventory_items', :entity_id, 'update', :before_data, :after_data, :user_id)
            ");
            $audit->execute([
                ':entity_id' => $itemId,
                ':before_data' => json_encode($item, JSON_UNESCAPED_UNICODE),
                ':after_data' => json_encode($after, JSON_UNESCAPED_UNICODE),
                ':user_id' => $data['user_id'] ?? null
            ]);

            $pdo->commit();
            json_response(true, null, 'Ítem actualizado');
            break;

        default:
            json_response(false, null, 'Método no soportado', 405);
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    json_response(false, null, $e->getMessage(), 400);
}
?> 