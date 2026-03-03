<?php
class User {
  private $conn;
  private $table_name = "users";  // ← TU TABLA

  public $user_id;
  public $nombre;
  public $email;
  public $telefono;
  public $password;

  public function __construct($db) {
    $this->conn = $db;
  }

  // Register - usando tus columnas
  public function create() {
    $query = "INSERT INTO {$this->table_name} 
              (nombre, email, telefono, password) 
              VALUES (:nombre, :email, :telefono, :password)";
    
    $stmt = $this->conn->prepare($query);

    // Sanitizar
    $this->nombre = htmlspecialchars(strip_tags($this->nombre));
    $this->email = htmlspecialchars(strip_tags($this->email));
    $this->telefono = htmlspecialchars(strip_tags($this->telefono ?? ''));
    $this->password = password_hash($this->password, PASSWORD_DEFAULT);

    $stmt->bindParam(":nombre", $this->nombre);
    $stmt->bindParam(":email", $this->email);
    $stmt->bindParam(":telefono", $this->telefono);
    $stmt->bindParam(":password", $this->password);

    return $stmt->execute();
  }

  // Verificar email existe
  public function emailExists() {
    $query = "SELECT user_id, email FROM {$this->table_name} WHERE email = ?";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(1, $this->email);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
      $row = $stmt->fetch();
      $this->user_id = $row['user_id'];
      return true;
    }
    return false;
  }

  // Login
  public function login() {
    $query = "SELECT user_id, nombre, email, password FROM {$this->table_name} WHERE email = ?";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(1, $this->email);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
      $row = $stmt->fetch();
      if(password_verify($this->password, $row['password'])) {
        return $row;
      }
    }
    return false;
  }
}
?>
