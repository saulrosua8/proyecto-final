-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-04-2025 a las 10:05:11
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `padel_reservas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clubes`
--

CREATE TABLE `clubes` (
  `id_club` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `provincia` varchar(100) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `apertura` time NOT NULL COMMENT 'Hora de apertura (p.ej. 08:30:00)',
  `cierre` time NOT NULL COMMENT 'Hora de cierre (p.ej. 17:00:00)',
  `descripcion` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clubes`
--

INSERT INTO `clubes` (`id_club`, `nombre`, `provincia`, `direccion`, `telefono`, `id_usuario`, `apertura`, `cierre`, `descripcion`) VALUES
(3, 'Club de Padel Barcelona', 'Barcelona', 'Rambla 45, Barcelona', '934001122', 2, '07:00:00', '22:00:00', 'desc'),
(4, 'Padel Sevilla Arena', 'Sevilla', 'Av. de la Constitución 50, Sevilla', '954001122', 2, '09:00:00', '21:00:00', 'desc'),
(5, 'Alicante Padel Club', 'Valencia', 'C/ Colón 76, Valencia', '963001122', 2, '08:00:00', '20:00:00', 'desc'),
(6, 'Bilbao Padel Center', 'Bizkaia', 'Gran Vía de Don Diego López de Haro 10, Bilbao', '944001122', 2, '10:00:00', '18:00:00', 'desc'),
(7, 'Padel Club Lucena', 'Córdoba', 'C7 CAWNMD', '628308078', 1, '11:00:00', '18:00:00', 'cLUB DE PADEL LUCENA'),
(9, 'Padel Club Alacala', 'Madrid', 'c/cadf', '62830879', 1, '08:00:00', '01:00:00', 'wed');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios_stack`
--

CREATE TABLE `horarios_stack` (
  `id_horario` int(11) NOT NULL,
  `id_pista` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `duracion` int(11) NOT NULL COMMENT 'Duración en minutos',
  `precio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pistas`
--

CREATE TABLE `pistas` (
  `id_pista` int(11) NOT NULL,
  `id_club` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `tipo` enum('Cubierta','Exterior','Mixta') NOT NULL DEFAULT 'Cubierta',
  `precio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id_reserva` int(11) NOT NULL,
  `id_horario` int(11) NOT NULL COMMENT 'Cada franja solo puede reservarse una vez',
  `id_usuario` int(11) NOT NULL,
  `estado` enum('Confirmada','Cancelada','Pendiente') NOT NULL DEFAULT 'Pendiente',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `precio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `rol` enum('Administrador','Club','Cliente') NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `email`, `contraseña`, `rol`, `fecha_registro`) VALUES
(1, 'admin', 'saul.rosua.ortiz@gmail.com', '$2b$10$VhKa7Mubr7d5rrqJKIr6hOQWBzeIsQM1jr/5OFcouAcTI6sNQuU5.', 'Administrador', '2025-04-25 10:45:31'),
(2, 'Club Madrid Centro', 'madrid.centro@padelclub.com', '$2b$10$EjemploHashClub...', 'Club', '2025-04-25 11:20:27'),
(3, 'Juan Pérez', 'juan.perez@example.com', '$2b$10$EjemploHashUser...', 'Cliente', '2025-04-25 11:20:27'),
(4, 'Ana López', 'ana.lopez@example.com', '$2b$10$EjemploHashUser...', 'Cliente', '2025-04-25 11:20:27');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clubes`
--
ALTER TABLE `clubes`
  ADD PRIMARY KEY (`id_club`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `horarios_stack`
--
ALTER TABLE `horarios_stack`
  ADD PRIMARY KEY (`id_horario`),
  ADD UNIQUE KEY `uniq_pista_fecha_inicio` (`id_pista`,`fecha`,`hora_inicio`),
  ADD KEY `horarios_stack_ibfk_2` (`precio`);

--
-- Indices de la tabla `pistas`
--
ALTER TABLE `pistas`
  ADD PRIMARY KEY (`id_pista`),
  ADD KEY `id_club` (`id_club`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id_reserva`),
  ADD UNIQUE KEY `id_horario` (`id_horario`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `reservas_ibfk_3` (`precio`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clubes`
--
ALTER TABLE `clubes`
  MODIFY `id_club` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `horarios_stack`
--
ALTER TABLE `horarios_stack`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `pistas`
--
ALTER TABLE `pistas`
  MODIFY `id_pista` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `clubes`
--
ALTER TABLE `clubes`
  ADD CONSTRAINT `clubes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `horarios_stack`
--
ALTER TABLE `horarios_stack`
  ADD CONSTRAINT `horarios_stack_ibfk_1` FOREIGN KEY (`id_pista`) REFERENCES `pistas` (`id_pista`) ON DELETE CASCADE,
  ADD CONSTRAINT `horarios_stack_ibfk_2` FOREIGN KEY (`precio`) REFERENCES `pistas` (`id_pista`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pistas`
--
ALTER TABLE `pistas`
  ADD CONSTRAINT `pistas_ibfk_1` FOREIGN KEY (`id_club`) REFERENCES `clubes` (`id_club`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`id_horario`) REFERENCES `horarios_stack` (`id_horario`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservas_ibfk_3` FOREIGN KEY (`precio`) REFERENCES `horarios_stack` (`id_horario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
