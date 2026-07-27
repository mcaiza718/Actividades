-- Base de datos: db_usuarios
-- Microservicio: Usuarios
-- =====================================================

CREATE DATABASE IF NOT EXISTS db_usuarios;
USE db_usuarios;

-- Tabla principal de usuarios en el sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de ejemplo
INSERT INTO usuarios (nombre, email, telefono) VALUES
('Juan Perez', 'juan.perez@example.com', '0991234567'),
('Maria Lopez', 'maria.lopez@example.com', '0997654321');