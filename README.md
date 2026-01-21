# 🍔 Victu's Burgers API Backend

Backend PHP/MySQL para E-commerce de comida rápida. **Puerto 8081**.

## 🚀 **Iniciar el Backend**

```bash
php -S localhost:8081
URL Base: http://localhost:8081/victus-backend/api/

📋 Endpoints Disponibles
Método	Endpoint	Descripción
GET	/api/	📄 Documentación interactiva
GET	/api/products	📦 Lista productos
GET	/api/products?category_id=1	🏷️ Productos por categoría
GET	/api/orders?user_id=1	🛒 Pedidos de usuario
GET	/api/users?user_id=1	👥 Datos usuario
GET	/api/addresses?user_id=1	📍 Direcciones GPS
GET	/api/drivers	🚗 Choferes con tracking
🗄️ Base de Datos: dbbuguer
text
Tablas:
├── products (productos + categorías)
├── orders (pedidos + estado)
├── order_items (items del pedido)
├── users (clientes)
├── addresses (direcciones GPS)
├── drivers (choferes GPS)
└── categories (desayuno/almuerzo/cena)
Credenciales MySQL:

text
Host: localhost
DB: dbbuguer
User: root
Password: (vacío)
🏗️ Estructura del Proyecto
text
victus-backend/
├── config/
│   └── database.php      # Conexión PDO MySQL
├── api/
│   ├── products.php     # CRUD productos
│   ├── orders.php       # Pedidos + items
│   ├── users.php        # Usuarios
│   └── ...              # Más endpoints
├── public/
│   └── index.html       # 📄 Docs interactivas
├── index.php            # 🎛️ Router centralizado
├── .htaccess           # URLs limpias (opcional)
└── README.md           # 👈 Este archivo
🔧 Dependencias
bash
# Ninguna externa - PHP puro + PDO MySQL
PHP >= 8.0
MySQL/MariaDB
XAMPP/WAMP (desarrollo)
🧪 Pruebas Rápidas
bash
# 1. Iniciar servidor
php -S localhost:8081

# 2. Abrir docs
http://localhost:8081/api/

# 3. Probar productos
curl http://localhost:8081/api/products

# 4. Crear pedido (Postman)
POST http://localhost:8081/api/orders
{
  "user_id": 1,
  "address_id": 1,
  "total": 25.50,
  "metodo_pago": "efectivo",
  "items": [{"product_id":1,"cantidad":2,"precio":12.50}]
}
🎨 Documentación Interactiva
Docs Screenshot

Features:

✅ Click endpoints → Nueva pestaña

✅ Hover animado + copy URL

✅ Responsive + Playfair Display

✅ Dark theme con tu paleta de colores

🚀 Desarrollo Local (XAMPP)
XAMPP: Apache + MySQL ON

DocumentRoot: C:\ruta\victus-backend

Base datos: dbbuguer (importar SQL si existe)

Iniciar: php -S localhost:8081

🔗 React Frontend
javascript
// Ejemplo fetch productos
fetch('http://localhost:8081/api/products')
  .then(res => res.json())
  .then(products => console.log(products));
📊 Tablas Relacionales
sql
-- Ejemplo JOIN productos + categorías
SELECT p.*, c.nombre_categoria 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.category_id
👥 Equipo
Rol	Responsable
🏗️ Backend	@tuusuario
🎨 Frontend	Pendiente
🗃️ Database	@tuusuario
📱 Mobile	Pendiente
📈 Próximas Features
 POST /api/orders - Crear pedidos

 PUT /api/orders/:id/status - Actualizar estado

 POST /api/drivers/location - GPS real-time

 Autenticación JWT

 Upload imágenes productos

 WebSockets tracking

🛠️ Comandos Git
bash
# Rama actual: back
git checkout back
git pull origin back

# Nuevos cambios
git add .
git commit -m "feat: nueva funcionalidad"
git push origin back
📱 Screenshots
API Docs
Productos JSON

🍔 Victu's Burgers API | v0.1 | Enero 2026 | Puerto 8081

text

## **🚀 SUBIR README.MD a GitHub:**

```powershell
# En tu carpeta back/
git add README.md
git commit -m "docs: README profesional con instrucciones completas"
git push origin back
📁 Crear screenshots (opcional):
powershell
# Carpeta screenshots
New-Item -ItemType Directory "screenshots" -Force

# Capturas:
# 1. http://localhost:8081/api/ → docs.png
# 2. http://localhost:8081/api/products → products.png
✅ RESULTADO FINAL en GitHub:
text
https://github.com/TU-USUARIO/repo/tree/back
├── README.md ← ⭐ PROFESIONAL
├── config/
├── api/
├── public/
└── index.php
🎯 COMANDO RÁPIDO (copia/pega):
powershell
cd "C:\Users\jesus\Documents\2 Proyectos web\Victusburger\Desarrollo\back"
# (pega README.md completo arriba)
git add README.md
git commit -m "docs: README completa con php -S localhost:8081"
git push origin back
