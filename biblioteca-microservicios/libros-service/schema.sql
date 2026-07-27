-- Base de datos: db_libros
-- Microservicio: Libros
-- =====================================================

CREATE DATABASE IF NOT EXISTS db_libros;
USE db_libros;

-- Tabla principal de libros del catalogo
CREATE TABLE IF NOT EXISTS libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(150) NOT NULL,
    isbn VARCHAR(30) UNIQUE,
    cantidad_total INT NOT NULL DEFAULT 1,
    cantidad_disponible INT NOT NULL DEFAULT 1,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de ejemplo
INSERT INTO libros (titulo, autor, isbn, cantidad_total, cantidad_disponible) VALUES
('Cien Años de Soledad', 'Gabriel Garcia Marquez', '9780307474728', 3, 3),
('Clean Code', 'Robert C. Martin', '9780132350884', 2, 2);