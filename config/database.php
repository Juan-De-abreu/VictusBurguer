<?php
// config/database.php - CLASE + GLOBAL $pdo ✅
class Database {
    private $host = 'localhost';
    private $dbname = 'dbburguer';
    private $username = 'root';
    private $password = '';
    private $pdo;

    public function connect() {
        try {
            $this->pdo = new PDO(
                "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
            // ✅ EXPORTAR GLOBAL
            $GLOBALS['pdo'] = $this->pdo;
            return $this->pdo;
        } catch(PDOException $e) {
            http_response_code(500);
            die(json_encode(['error' => 'DB: ' . $e->getMessage()]));
        }
    }
}

// ✅ INSTANCIAR AUTOMÁTICO
$db = new Database();
$GLOBALS['pdo'] = $db->connect();
?>