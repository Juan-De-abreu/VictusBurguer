-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 13-05-2026 a las 02:27:18
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `dbburguer`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `addresses`
--

DROP TABLE IF EXISTS `addresses`;
CREATE TABLE IF NOT EXISTS `addresses` (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `calle` varchar(255) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `referencia` text,
  PRIMARY KEY (`address_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3;

--
-- Volcado de datos para la tabla `addresses`
--

INSERT INTO `addresses` (`address_id`, `user_id`, `calle`, `ciudad`, `latitud`, `longitud`, `referencia`) VALUES
(1, 1, 'Calle D, Manzana F, Urb. La Esmeralda', 'San Diego', 10.24351200, -67.95421000, 'Casa de portón blanco frente al parque, tiene un árbol de mango afuera.'),
(2, 2, 'Av. Principal, Conjunto Residencial El Remanso', 'San Diego', 10.25100200, -67.94880100, 'Edificio A, Piso 3, Apto 3-B. Tocar intercomunicador #32.'),
(3, 3, 'Vereda 8, Urb. Los Jarales', 'San Diego', 10.22984500, -67.96123400, 'Casa color azul, rejas negras. Al lado de la bodega.'),
(4, 4, 'Av. Don Julio Centeno, CC Fin de Siglo', 'San Diego', 10.23567800, -67.95912300, 'Entregar en la entrada principal del banco, llamar al llegar.'),
(5, 5, 'Av. Andrés Eloy Blanco, Res. Laste', 'Valencia', 10.21567800, -68.00123400, 'Dejar en vigilancia. Decir que es para la familia Rodríguez.'),
(6, 6, 'Calle 140, Urb. El Morro II', 'San Diego', 10.23123400, -67.95111100, 'Casa de esquina color beige. Cuidado con el perro.'),
(7, 7, 'Calle Los Pinos, Res. Monteserino 12', 'San Diego', 10.23890100, -67.95678900, 'Torre B, Planta Baja. El timbre no sirve, por favor llamar.'),
(8, 8, 'Calle 90, Res. Portales de Shalimar', 'Valencia', 10.22234500, -68.01234500, 'Entregar al guardia de seguridad en la garita.'),
(9, 9, 'Av. Universidad, Campus UJAP', 'San Diego', 10.24890000, -67.94560000, 'Entregar en la entrada peatonal frente al estacionamiento.'),
(10, 10, 'Calle Real de Campo Solo', 'San Diego', 10.25567800, -67.96543200, 'Casa amarilla de dos pisos, puerta de madera.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `nombre_categoria` enum('desayuno','almuerzo','cena') NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`category_id`, `nombre_categoria`) VALUES
(1, 'desayuno'),
(2, 'almuerzo'),
(3, 'cena');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `drivers`
--

DROP TABLE IF EXISTS `drivers`;
CREATE TABLE IF NOT EXISTS `drivers` (
  `driver_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `vehiculo` varchar(50) DEFAULT NULL,
  `latitud_actual` decimal(10,8) DEFAULT NULL,
  `longitud_actual` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`driver_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

--
-- Volcado de datos para la tabla `drivers`
--

INSERT INTO `drivers` (`driver_id`, `nombre`, `foto_url`, `vehiculo`, `latitud_actual`, `longitud_actual`) VALUES
(1, 'Jose Martinez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jose', 'Moto Empire Keeway', 10.25050000, -67.94500000),
(2, 'Alejandro Silva', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alejandro', 'Moto Suzuki', 10.21500000, -67.94000000),
(3, 'Ricardo Gomez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo', 'Bicicleta', 10.23200000, -67.95800000),
(4, 'Luis Rodriguez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis', 'Moto Honda', 10.25500000, -67.94800000),
(5, 'Daniel Blanco', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel', 'Moto Yamaha', 10.25800000, -67.96100000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favorites`
--

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_product` int NOT NULL,
  `id_user` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_product` (`id_product`),
  KEY `id_user` (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `favorites`
--

INSERT INTO `favorites` (`id`, `id_product`, `id_user`) VALUES
(11, 8, 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fixed_costs`
--

DROP TABLE IF EXISTS `fixed_costs`;
CREATE TABLE IF NOT EXISTS `fixed_costs` (
  `cost_id` int NOT NULL AUTO_INCREMENT,
  `cost_name` varchar(120) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `cost_category` enum('alquiler','internet','servicios','software','seguridad','mantenimiento','otros') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'otros',
  `supplier_name` varchar(120) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `invoice_number` varchar(30) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `payment_status` enum('pendiente','pagada','anulada') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'pendiente',
  `currency` enum('USD','VES') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'USD',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `due_date` date DEFAULT NULL,
  `paid_date` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_spanish2_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cost_id`),
  KEY `idx_due_date` (`due_date`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `fixed_costs`
--

INSERT INTO `fixed_costs` (`cost_id`, `cost_name`, `cost_category`, `supplier_name`, `invoice_number`, `payment_status`, `currency`, `amount`, `due_date`, `paid_date`, `description`, `created_at`) VALUES
(1, 'Alquiler del local', 'alquiler', 'Inmobiliaria Central', 'FC-0001', 'pagada', 'USD', 650.00, '2026-05-05', '2026-05-05', 'Pago mensual del local', '2026-05-11 15:20:03'),
(2, 'Internet empresarial', 'servicios', 'NetPlus', 'FC-0002', 'pagada', 'USD', 35.00, '2026-05-03', '2026-05-03', 'Servicio de internet', '2026-05-11 15:20:03'),
(3, 'Sistema de punto de venta', 'software', 'POS Cloud', 'FC-0003', 'pagada', 'USD', 49.99, '2026-06-10', '2026-05-13', 'Suscripción mensual', '2026-05-11 15:20:03'),
(4, 'Seguridad privada', 'seguridad', 'Vigilancia Integral', 'FC-0004', 'pagada', 'VES', 1800.00, '2026-05-04', '2026-05-04', 'Turno nocturno', '2026-05-11 15:20:03'),
(5, 'Mantenimiento de equipos', 'mantenimiento', 'TechService', 'FC-0005', 'anulada', 'USD', 120.00, '2026-05-08', NULL, 'Servicio cancelado', '2026-05-11 15:20:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoices`
--

DROP TABLE IF EXISTS `invoices`;
CREATE TABLE IF NOT EXISTS `invoices` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(30) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `control_number` varchar(30) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `order_id` int NOT NULL,
  `customer_name` varchar(120) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `customer_cedula` varchar(30) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `customer_email` varchar(120) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `customer_phone` varchar(30) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `currency` enum('USD','VES') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'USD',
  `exchange_rate` decimal(12,6) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `issue_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('emitida','pagada','anulada') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'emitida',
  `pdf_url` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  UNIQUE KEY `control_number` (`control_number`),
  KEY `order_id` (`order_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `invoices`
--

INSERT INTO `invoices` (`invoice_id`, `invoice_number`, `control_number`, `order_id`, `customer_name`, `customer_cedula`, `customer_email`, `customer_phone`, `currency`, `exchange_rate`, `subtotal`, `tax_total`, `total`, `issue_date`, `status`, `pdf_url`, `image_url`) VALUES
(1, 'FAC-2026-0001', 'CNT-0001', 1, 'Juan Pérez', 'V-12345678', 'juan.perez@mail.com', '0414-1234567', 'USD', 38.500000, 22.00, 3.52, 25.52, '2026-05-01 10:16:00', 'pagada', '/storage/invoices/FAC-2026-0001.pdf', '/storage/invoices/FAC-2026-0001.png'),
(2, 'FAC-2026-0002', 'CNT-0002', 2, 'María García', 'V-87654321', 'maria.garcia@mail.com', '0412-9876543', 'VES', 38.500000, 450.00, 72.00, 522.00, '2026-05-02 11:21:00', 'emitida', '/storage/invoices/FAC-2026-0002.pdf', '/storage/invoices/FAC-2026-0002.png'),
(3, 'FAC-2026-0003', 'CNT-0003', 3, 'Carlos González', 'V-11223344', 'carlos.gonzalez@mail.com', '0424-4567890', 'USD', 38.500000, 18.00, 2.88, 20.88, '2026-05-03 14:06:00', 'pagada', '/storage/invoices/FAC-2026-0003.pdf', '/storage/invoices/FAC-2026-0003.png'),
(4, 'FAC-2026-0004', 'CNT-0004', 4, 'Ana Martínez', 'V-55667788', 'ana.martinez@mail.com', '0416-1122334', 'VES', 38.500000, 980.00, 156.80, 1111.80, '2026-05-04 09:31:00', 'pagada', '/storage/invoices/FAC-2026-0004.pdf', '/storage/invoices/FAC-2026-0004.png'),
(5, 'FAC-2026-0005', 'CNT-0005', 5, 'Luis Hernández', 'V-99887766', 'luis.hernandez@mail.com', '0414-5556677', 'USD', 38.500000, 12.50, 2.00, 14.50, '2026-05-05 17:41:00', 'anulada', '/storage/invoices/FAC-2026-0005.pdf', '/storage/invoices/FAC-2026-0005.png'),
(6, 'FAC-2026-P-0003', 'CNT-P-0003', 0, 'Carlos Pérez', 'V-11223344', NULL, NULL, 'VES', NULL, 1200.00, 0.00, 1200.00, '2026-05-11 22:28:52', 'pagada', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders_clientes`
--

DROP TABLE IF EXISTS `orders_clientes`;
CREATE TABLE IF NOT EXISTS `orders_clientes` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `invoice_id` int DEFAULT NULL,
  `order_number` varchar(30) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `order_type` enum('income') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'income',
  `payment_status` enum('pendiente','pagada','rechazada','anulada') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'pendiente',
  `currency` enum('USD','VES') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'USD',
  `payment_method` varchar(50) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uq_order_number` (`order_number`),
  KEY `idx_user` (`user_id`),
  KEY `idx_invoice` (`invoice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `orders_clientes`
--

INSERT INTO `orders_clientes` (`order_id`, `user_id`, `invoice_id`, `order_number`, `order_type`, `payment_status`, `currency`, `payment_method`, `subtotal`, `tax_total`, `discount_total`, `total`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'ORD-C-0001', 'income', 'pagada', 'USD', 'pagomovil', 22.00, 3.52, 0.00, 25.52, '2026-05-01 14:15:00', '2026-05-11 15:19:26'),
(2, 2, 2, 'ORD-C-0002', 'income', 'pendiente', 'VES', 'efectivo', 450.00, 72.00, 0.00, 522.00, '2026-05-02 15:20:00', '2026-05-11 15:19:26'),
(3, 3, 3, 'ORD-C-0003', 'income', 'pagada', 'USD', 'zelle', 18.00, 2.88, 0.00, 20.88, '2026-05-03 18:05:00', '2026-05-11 15:19:26'),
(4, 4, 4, 'ORD-C-0004', 'income', 'pagada', 'VES', 'tarjeta', 980.00, 156.80, 25.00, 1111.80, '2026-05-04 13:30:00', '2026-05-11 15:19:26'),
(5, 5, 5, 'ORD-C-0005', 'income', 'rechazada', 'USD', 'paypal', 12.50, 2.00, 0.00, 14.50, '2026-05-05 21:40:00', '2026-05-11 15:19:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders_shop`
--

DROP TABLE IF EXISTS `orders_shop`;
CREATE TABLE IF NOT EXISTS `orders_shop` (
  `shop_order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_number` varchar(30) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `order_type` enum('expense') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'expense',
  `expense_category` enum('proveedores','insumos','mantenimiento','marketing','servicios','otros') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'otros',
  `payment_status` enum('pendiente','pagada','rechazada','anulada') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'pendiente',
  `currency` enum('USD','VES') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'USD',
  `payment_method` varchar(50) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `note` text COLLATE utf8mb4_spanish2_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`shop_order_id`),
  UNIQUE KEY `uq_shop_order_number` (`order_number`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `orders_shop`
--

INSERT INTO `orders_shop` (`shop_order_id`, `user_id`, `order_number`, `order_type`, `expense_category`, `payment_status`, `currency`, `payment_method`, `subtotal`, `tax_total`, `discount_total`, `total`, `note`, `created_at`, `updated_at`) VALUES
(1, 1, 'ORD-S-0001', 'expense', 'proveedores', 'pagada', 'USD', 'transferencia', 120.00, 19.20, 0.00, 139.20, 'Compra de insumos para cocina', '2026-05-06 12:10:00', '2026-05-13 01:29:50'),
(2, 5, 'ORD-S-0002', 'expense', 'servicios', 'pagada', 'VES', 'pago movil', 1850.00, 296.00, 0.00, 2146.00, 'Pago de gas y electricidad', '2026-05-06 16:45:00', '2026-05-13 01:29:55'),
(3, 8, 'ORD-S-0003', 'expense', 'mantenimiento', 'pendiente', 'USD', 'efectivo', 85.00, 13.60, 0.00, 98.60, 'Reparación de extractor', '2026-05-07 13:25:00', '2026-05-13 01:29:59'),
(4, 1, 'ORD-S-0004', 'expense', 'marketing', 'anulada', 'VES', 'transferencia', 2400.00, 384.00, 0.00, 2784.00, 'Campaña promocional cancelada', '2026-05-07 19:30:00', '2026-05-13 01:30:01'),
(5, 1, 'ORD-S-0005', 'expense', 'insumos', 'pendiente', 'USD', 'tarjeta', 42.50, 6.80, 0.00, 49.30, 'Compra de empaques y servilletas', '2026-05-08 14:05:00', '2026-05-13 01:30:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_items_clientes`
--

DROP TABLE IF EXISTS `order_items_clientes`;
CREATE TABLE IF NOT EXISTS `order_items_clientes` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(150) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `line_total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `order_items_clientes`
--

INSERT INTO `order_items_clientes` (`order_item_id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `line_total`) VALUES
(1, 1, 4, 'Burger Clásica', 2, 8.50, 17.00),
(2, 1, 10, 'Perro Caliente Especial', 1, 4.00, 4.00),
(3, 2, 7, 'The Monster Burguer', 1, 14.00, 14.00),
(4, 2, 9, 'Salchipapa Especial', 1, 9.50, 9.50),
(5, 2, 6, 'Combo Ejecutivo Burguer', 1, 10.00, 10.00),
(6, 3, 1, 'Arepa Pabellón', 2, 5.50, 11.00),
(7, 3, 2, 'Desayuno Americano', 1, 7.00, 7.00),
(8, 4, 8, 'BBQ Bacon Burguer', 2, 11.50, 23.00),
(9, 4, 5, 'Crispy Chicken Sandwich', 3, 9.00, 27.00),
(10, 5, 10, 'Perro Caliente Especial', 3, 4.00, 12.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payments_personal`
--

DROP TABLE IF EXISTS `payments_personal`;
CREATE TABLE IF NOT EXISTS `payments_personal` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(120) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `employee_cedula` varchar(30) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `role_name` varchar(80) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `payment_type` enum('sueldo','bono','comision','vacaciones','utilidades') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'sueldo',
  `payment_status` enum('pendiente','pagada','anulada') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'pendiente',
  `currency` enum('USD','VES') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'USD',
  `payment_method` varchar(50) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `description` text COLLATE utf8mb4_spanish2_ci,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `idx_employee` (`employee_cedula`),
  KEY `idx_paid_at` (`paid_at`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `payments_personal`
--

INSERT INTO `payments_personal` (`payment_id`, `employee_name`, `employee_cedula`, `role_name`, `payment_type`, `payment_status`, `currency`, `payment_method`, `amount`, `description`, `paid_at`, `created_at`) VALUES
(1, 'José Martínez', 'V-12345678', 'Delivery', 'sueldo', 'pagada', 'USD', 'transferencia', 180.00, 'Pago quincenal', '2026-05-05 18:00:00', '2026-05-11 15:19:58'),
(2, 'María González', 'V-87654321', 'Cajera', 'sueldo', 'pagada', 'USD', 'zelle', 220.00, 'Nómina de abril', '2026-05-05 18:10:00', '2026-05-11 15:19:58'),
(3, 'Carlos Pérez', 'V-11223344', 'Chef', 'bono', 'pagada', 'VES', 'efectivo', 1200.00, 'Bonificación por producción', NULL, '2026-05-11 15:19:58'),
(4, 'Ana López', 'V-55667788', 'Atención al cliente', 'comision', 'pagada', 'VES', 'pago movil', 850.00, 'Comisión por ventas', '2026-05-06 09:00:00', '2026-05-11 15:19:58'),
(5, 'Luis Torres', 'V-99887766', 'Supervisor', 'utilidades', 'anulada', 'USD', 'transferencia', 300.00, 'Pago anulado por corrección', NULL, '2026-05-11 15:19:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `descuento` float NOT NULL DEFAULT '0',
  `is_trending` tinyint(1) DEFAULT '0',
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`product_id`, `category_id`, `nombre`, `descripcion`, `precio`, `descuento`, `is_trending`, `image_url`) VALUES
(1, 1, 'Arepa Pabellón', 'Arepa rellena con carne mechada, caraotas negras, tajadas y queso blanco rallado.', 5.50, 50, 1, 'https://img.dbburguer.com/desayunos/arepa_pabellon.jpg'),
(2, 1, 'Desayuno Americano', 'Dos huevos fritos, tocineta crujiente, pan tostado y mermelada de la casa.', 7.00, 0, 0, 'https://img.dbburguer.com/desayunos/americano.jpg'),
(3, 1, 'Empanadas Trio', 'Set de 3 empanadas (queso, carne y pollo) acompañadas con salsa guasacaca.', 4.50, 50, 1, 'https://img.dbburguer.com/desayunos/empanadas.jpg'),
(4, 3, 'Burger Clásica', 'Carne de res 150g, queso cheddar, lechuga fresh, tomate y cebolla morada.', 8.50, 50, 0, 'https://img.dbburguer.com/almuerzos/burger_clasica.jpg'),
(5, 2, 'Crispy Chicken Sandwich', 'Pechuga de pollo apanada, salsa de miel y mostaza, pepinillos y pan brioche.', 9.00, 0, 1, 'https://img.dbburguer.com/almuerzos/chicken_crispy.jpg'),
(6, 2, 'Combo Ejecutivo Burguer', 'Hamburguesa sencilla con papas fritas y bebida de 350ml.', 10.00, 50, 0, 'https://img.dbburguer.com/almuerzos/combo_ejecutivo.jpg'),
(7, 3, 'The Monster Burguer', 'Doble carne de res (300g total), doble tocino, huevo frito, aros de cebolla y salsa especial.', 14.00, 100, 1, 'https://img.dbburguer.com/cenas/monster_burguer.jpg'),
(8, 3, 'BBQ Bacon Burguer', 'Carne de res, bañado en salsa BBQ artesanal, cebolla caramelizada y mucho tocino.', 11.50, 0, 1, 'https://img.dbburguer.com/cenas/bbq_bacon.jpg'),
(9, 3, 'Salchipapa Especial', 'Cama de papas fritas con salchicha troceada, queso fundido, maíz tierno y salsas.', 9.50, 0, 0, 'https://img.dbburguer.com/cenas/salchipapa.jpg'),
(10, 3, 'Perro Caliente Especial', 'Salchicha de primera, cebolla picadita, papas ralladas, queso parmesano y trío de salsas.', 4.00, 0, 0, 'https://img.dbburguer.com/cenas/perro_especial.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `shop_order_items`
--

DROP TABLE IF EXISTS `shop_order_items`;
CREATE TABLE IF NOT EXISTS `shop_order_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `shop_order_id` int NOT NULL,
  `concept_name` varchar(150) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(12,2) NOT NULL,
  `line_total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`item_id`),
  KEY `idx_shop_order` (`shop_order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `shop_order_items`
--

INSERT INTO `shop_order_items` (`item_id`, `shop_order_id`, `concept_name`, `quantity`, `unit_price`, `line_total`) VALUES
(1, 1, 'Harina y proteína', 10, 12.00, 120.00),
(2, 2, 'Servicio eléctrico', 1, 1850.00, 1850.00),
(3, 3, 'Reparación de extractor', 1, 85.00, 85.00),
(4, 4, 'Publicidad en redes', 1, 2400.00, 2400.00),
(5, 5, 'Empaques biodegradables', 5, 8.50, 42.50);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `rol` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`user_id`, `nombre`, `email`, `password`, `telefono`, `created_at`, `rol`) VALUES
(1, 'Juan Pérez', 'juan.perez@gmail.com', '$2b$10$EpOuJdQa...HASH_SIMULADO_DE_123456', '0414-1234567', '2026-01-20 14:10:46', 0),
(2, 'María Rodríguez', 'maria.rod@hotmail.com', '$2b$10$EpOuJdQa...HASH_SIMULADO_DE_123456', '0412-9876543', '2026-01-20 14:10:46', 0),
(3, 'Carlos González', 'carlos.gonzalez@yahoo.com', '$2b$10$EpOuJdQa...HASH_SIMULADO_DE_123456', '0424-4567890', '2026-01-20 14:10:46', 0),
(4, 'Ana Martínez', 'ana.martinez@outlook.com', '$2b$10$EpOuJdQa...HASH_SIMULADO_DE_123456', '0416-1122334', '2026-01-20 14:10:46', 0),
(5, 'Luis Hernández', 'luis.hernandez@gmail.com', '$2b$10$EpOuJdQa...HASH_SIMULADO_DE_123456', '0414-5556677', '2026-01-20 14:10:46', 0),
(6, 'Elena Gómez', 'elena.gomez@empresa.com', '$2b$10$EpOuJdQa...HASH_SIMULADO_DE_123456', '0412-3344556', '2026-01-20 14:10:46', 0),
(7, 'Miguel Torres', 'miguel.torres@gmail.com', '$2b$10$EpOuJdQa...HASH_SIMULADO_DE_123456', '0424-9988776', '2026-01-20 14:10:46', 0),
(8, 'Laura Díaz', 'laura.diaz@icloud.com', '$2b$10$EpOuJdQa...HASH_SIMULADO_DE_123456', '0414-2223344', '2026-01-20 14:10:46', 0),
(9, 'David Ruiz', 'david.ruiz@ujap.edu.ve', '$2b$10$EpOuJdQa...HASH_SIMULADO_DE_123456', '0412-7778899', '2026-01-20 14:10:46', 0),
(10, 'Sofía Castro', 'sofia.castro@gmail.com', '$2b$10$EpOuJdQa...HASH_SIMULADO_DE_123456', '0416-0001122', '2026-01-20 14:10:46', 0),
(11, 'juan jose de abreu diaz', 'juanadmin@gmail.com', '$2y$12$FkhiRv6HXyACNuR5woZI5ulMgdhp/M6qkK1/nFkUeUovzghJkg6S.', '+58 4144145969', '2026-03-03 17:48:42', 4),
(12, 'Juan De abreu', 'juancliente@gmail.com', '$2y$12$/.rb5BNksrFd0QmPdaGfnuBF73IGFoTF8/LMG8XnodHU86nE.QBd.', '+58 4144145969', '2026-03-30 00:26:01', 0);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
