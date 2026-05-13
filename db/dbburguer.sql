-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 10-05-2026 a las 21:23:48
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `invoice_id` int DEFAULT NULL,
  `order_type` enum('ingreso','egreso') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'ingreso',
  `payment_status` enum('pendiente','pagada','rechazada','anulada') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'pendiente',
  `currency` enum('USD','VES') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'USD',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(150) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `line_total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

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
