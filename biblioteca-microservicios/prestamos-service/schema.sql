-- Base de datos: db_prestamos
-- Microservicio: Prestamos
-- =====================================================

CREATE DATABASE IF NOT EXISTS db_prestamos;
USE db_prestamos;

-- Tabla principal de prestamos.
-- Nota: usuario_id y libro_id son solo referencias logicas, no hay foreign key fisica porque los datos viven en bases de datos distintas (usuarios y libros).
CREATE TABLE IF NOT EXISTS prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    usuario_nombre VARCHAR(100) NOT NULL,
    libro_id INT NOT NULL,
    libro_titulo VARCHAR(200) NOT NULL,
    fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion DATETIME NULL,
    estado ENUM('activo', 'devuelto') DEFAULT 'activo'
);