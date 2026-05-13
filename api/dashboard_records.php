<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $db = new Database();
    $pdo = $db->connect();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $orderType = trim($_GET['order_type'] ?? 'all');
    $currency = trim($_GET['currency'] ?? '');
    $paymentStatus = trim($_GET['payment_status'] ?? '');
    $dateFrom = trim($_GET['date_from'] ?? '');
    $dateTo = trim($_GET['date_to'] ?? '');
    $search = trim($_GET['customer_name'] ?? $_GET['employee_name'] ?? $_GET['cost_name'] ?? $_GET['invoice_number'] ?? $_GET['order_number'] ?? '');

    $currencyList = $currency !== '' ? array_map('trim', explode(',', $currency)) : [];
    $statusList = $paymentStatus !== '' ? array_map('trim', explode(',', $paymentStatus)) : [];

    $where = [];
    $params = [];

    if ($orderType === 'income') $where[] = "source_type = 'income'";
    if ($orderType === 'expense') $where[] = "source_type = 'expense'";

    if (!empty($currencyList)) {
        $phs = [];
        foreach ($currencyList as $i => $cur) {
            $ph = ":currency{$i}";
            $phs[] = $ph;
            $params[$ph] = $cur;
        }
        $where[] = "currency IN (" . implode(',', $phs) . ")";
    }

    if (!empty($statusList)) {
        $phs = [];
        foreach ($statusList as $i => $st) {
            $ph = ":status{$i}";
            $phs[] = $ph;
            $params[$ph] = $st;
        }
        $where[] = "(payment_status IN (" . implode(',', $phs) . ") OR status IN (" . implode(',', $phs) . "))";
    }

    if ($dateFrom !== '') {
        $where[] = "record_date >= :date_from";
        $params[':date_from'] = $dateFrom;
    }

    if ($dateTo !== '') {
        $where[] = "record_date <= :date_to";
        $params[':date_to'] = $dateTo;
    }

    if ($search !== '') {
        $where[] = "(reference LIKE :search OR customer_name LIKE :search OR employee_name LIKE :search OR supplier_name LIKE :search OR cost_name LIKE :search)";
        $params[':search'] = "%{$search}%";
    }

    $sql = "
        SELECT * FROM (
            SELECT
                'income' AS source_type,
                'orders_clientes' AS source_entity,
                o.order_id AS source_id,
                o.order_number AS reference,
                o.order_number,
                NULL AS employee_name,
                NULL AS supplier_name,
                NULL AS cost_name,
                i.invoice_id,
                i.invoice_number,
                i.control_number,
                i.customer_name,
                i.customer_cedula,
                i.customer_email,
                i.customer_phone,
                i.currency,
                i.subtotal,
                i.tax_total,
                i.total,
                o.payment_status,
                i.status,
                COALESCE(i.issue_date, o.created_at) AS record_date
            FROM orders_clientes o
            LEFT JOIN invoices i ON i.order_id = o.order_id

            UNION ALL

            SELECT
                'expense' AS source_type,
                'payments_personal' AS source_entity,
                p.payment_id AS source_id,
                p.employee_name AS reference,
                NULL AS order_number,
                p.employee_name,
                NULL AS supplier_name,
                NULL AS cost_name,
                NULL AS invoice_id,
                NULL AS invoice_number,
                NULL AS control_number,
                p.employee_name AS customer_name,
                p.employee_cedula AS customer_cedula,
                NULL AS customer_email,
                NULL AS customer_phone,
                p.currency,
                p.amount AS subtotal,
                0 AS tax_total,
                p.amount AS total,
                p.payment_status,
                p.payment_status AS status,
                COALESCE(p.paid_at, p.created_at) AS record_date
            FROM payments_personal p

            UNION ALL

            SELECT
                'expense' AS source_type,
                'orders_shop' AS source_entity,
                s.shop_order_id AS source_id,
                s.order_number AS reference,
                s.order_number,
                NULL AS employee_name,
                NULL AS supplier_name,
                NULL AS cost_name,
                NULL AS invoice_id,
                NULL AS invoice_number,
                NULL AS control_number,
                NULL AS customer_name,
                NULL AS customer_cedula,
                NULL AS customer_email,
                NULL AS customer_phone,
                s.currency,
                s.subtotal,
                s.tax_total,
                s.total,
                s.payment_status,
                s.payment_status AS status,
                s.created_at AS record_date
            FROM orders_shop s

            UNION ALL

            SELECT
                'expense' AS source_type,
                'fixed_costs' AS source_entity,
                f.cost_id AS source_id,
                f.cost_name AS reference,
                NULL AS order_number,
                NULL AS employee_name,
                f.supplier_name,
                f.cost_name,
                NULL AS invoice_id,
                f.invoice_number,
                NULL AS control_number,
                NULL AS customer_name,
                NULL AS customer_cedula,
                NULL AS customer_email,
                NULL AS customer_phone,
                f.currency,
                f.amount AS subtotal,
                0 AS tax_total,
                f.amount AS total,
                f.payment_status,
                f.payment_status AS status,
                COALESCE(f.paid_date, f.due_date, f.created_at) AS record_date
            FROM fixed_costs f
        ) x
        WHERE 1=1
    ";

    if (!empty($where)) {
        $sql .= " AND " . implode(" AND ", $where);
    }

    $sql .= " ORDER BY record_date DESC";

    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}