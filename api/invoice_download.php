<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($pdo)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection not available'], JSON_UNESCAPED_UNICODE);
    exit;
}

$invoice_id = (int)($_GET['invoice_id'] ?? 0);

if (!$invoice_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'invoice_id is required'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT
            i.*,
            o.order_type,
            o.payment_status,
            o.total AS order_total
        FROM invoices i
        INNER JOIN orders o ON o.order_id = i.order_id
        WHERE i.invoice_id = ?
        LIMIT 1
    ");
    $stmt->execute([$invoice_id]);
    $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$invoice) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Invoice not found'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        'success' => true,
        'data' => $invoice,
        'download_pdf' => $invoice['pdf_url'] ?? null,
        'download_image' => $invoice['image_url'] ?? null
    ], JSON_UNESCAPED_UNICODE);
    exit;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>