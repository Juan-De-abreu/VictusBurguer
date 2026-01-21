<?php
// api/orders.php - FIX RUTAS
require_once __DIR__ . '/../config/database.php';  // ✅ FIX

$db = new Database();
$pdo = $db->connect();

$user_id = $_GET['user_id'] ?? 0;
$query = "
    SELECT o.*, a.calle, a.ciudad, u.nombre as user_nombre 
    FROM orders o
    LEFT JOIN addresses a ON o.address_id = a.address_id
    LEFT JOIN users u ON o.user_id = u.user_id
    WHERE o.user_id = ? OR ? = 0
    ORDER BY o.created_at DESC
";

$stmt = $pdo->prepare($query);
$stmt->execute([$user_id, $user_id]);
header('Content-Type: application/json');
echo json_encode($stmt->fetchAll());
?>
