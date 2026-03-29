# Victu's Burgers - Frontend

![Victu's Burgers](https://via.placeholder.com/1200x630/DC2626/FFFFFF?text=Victu%27s+Burgers)

# ✨ Descripción
Sitio web responsive de restaurante **Victu's Burgers** con menú hamburguesa móvil, cards elegantes, animaciones fluidas.

# 🚀 Tecnologías
* vite+ReactJS+Mysql+tailwind

# Roles establecidos de fabrica
- Cada uno de los roles por simplificacion de la logica se establecio de manera numerica que se dara a continuacion
* 0 Cliente
* 1 Ubber
* 2 Chef
* 3 Contador
* 4 Admin

## 🎨 **Variables de Color (CSS Custom Properties)**


  - primario: #181818;     /* Fondo principal oscuro */
  - segundario: #d7023c;   /* Rojo vibrante hover/CTA */
  - letra: #eeebeb;        /* Texto claro principal */
  - body: #1a1919;         /* Fondo body sutil */
  - body2: #2a1313;        /* Fondo secundario oscuro */

## tipo de letras (todo esta en font elegante a menos que sea necesario)

  - elegante: 'Playfair Display', Georgia, serif;
  - legible: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;


# Actualizaciones

### 28/3/2026
- sistema de seguridad implementado mediante bibliotecas externas de React(React protected) para asi asegurar que cada cuenta tenga ingreso solo a su rol asignado(si es register comun sera cliente) siendo este dashboard solamente con header y footer de trabajador, al ser cliente tendra visual solo de sus pedidos etc

### 20/03/2026
- Agregado sistema de contador y de contenedor de carrito, asignado con una clave cada producto, actualizacion en tiempo real del carrito y sumatoria total en la parte inferior


### 30/1/2026
- login primera parte visual, falta corregir errores de desbordamiento de los form y agg animaciones de extensiones laterales para una interfaz mas agradable

### 28/1/2026
- header mas minimalista en celulares y agg el login (parte visual)
- globalizacion de api para reutilizacion y solo ajustar endpoint en cada page
  
### 19/1/2026 18:31
 - fontsfamily
 - Cardmenu
