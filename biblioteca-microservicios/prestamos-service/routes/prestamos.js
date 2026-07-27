// =====================================================
// routes/prestamos.js
// Define los endpoints REST del microservicio de Prestamos.
// Aqui se implementa la validacion cruzada con los microservicios de Usuarios y Libros antes de registrar un prestamo.
// =====================================================

const express = require('express');
const router = express.Router();
const db = require('../db');
const {
    obtenerUsuario,
    obtenerLibro,
    actualizarDisponibilidadLibro
} = require('../clienteServicios');

// -----------------------------------------------------
// POST /api/prestamos
// Registrar un nuevo prestamo.
// Flujo:
//   1. Validar que el usuario exista (consulta a Usuarios Service)
//   2. Validar que el libro exista y tenga disponibilidad (consulta a Libros Service)
//   3. Registrar el prestamo en la base de datos propia
//   4. Descontar una copia disponible en Libros Service
// -----------------------------------------------------
router.post('/', async (req, res) => {
    const { usuario_id, libro_id } = req.body;

    if (!usuario_id || !libro_id) {
        return res.status(400).json({ error: 'Los campos usuario_id y libro_id son obligatorios.' });
    }

    try {
        // Paso 1: validar que el usuario exista
        const usuario = await obtenerUsuario(usuario_id);
        if (!usuario) {
            return res.status(404).json({ error: 'El usuario indicado no existe.' });
        }

        // Paso 2: validar que el libro exista y tenga copias disponibles
        const libro = await obtenerLibro(libro_id);
        if (!libro) {
            return res.status(404).json({ error: 'El libro indicado no existe.' });
        }
        if (libro.cantidad_disponible <= 0) {
            return res.status(400).json({ error: 'El libro no tiene copias disponibles actualmente.' });
        }

        // Paso 3: registrar el prestamo 
        const [result] = await db.query(
            `INSERT INTO prestamos (usuario_id, usuario_nombre, libro_id, libro_titulo, estado)
             VALUES (?, ?, ?, ?, 'activo')`,
            [usuario_id, usuario.nombre, libro_id, libro.titulo]
        );

        // Paso 4: descontar disponibilidad en el microservicio de Libros
        await actualizarDisponibilidadLibro(libro_id, 'prestar');

        res.status(201).json({
            id: result.insertId,
            usuario_id,
            usuario_nombre: usuario.nombre,
            libro_id,
            libro_titulo: libro.titulo,
            estado: 'activo'
        });
    } catch (error) {
        console.error('Error al registrar prestamo:', error.message);
        res.status(500).json({ error: error.message || 'Error interno del servidor.' });
    }
});

// -----------------------------------------------------
// GET /api/prestamos
// Consultar el historial completo de prestamos
// -----------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM prestamos ORDER BY fecha_prestamo DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al consultar prestamos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -----------------------------------------------------
// PATCH /api/prestamos/:id/devolver
// Marca un prestamo como devuelto y le devuelve la disponibilidad al libro correspondiente.
// -----------------------------------------------------
router.patch('/:id/devolver', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM prestamos WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Prestamo no encontrado.' });
        }

        const prestamo = rows[0];
        if (prestamo.estado === 'devuelto') {
            return res.status(400).json({ error: 'Este prestamo ya fue devuelto.' });
        }

        await db.query(
            "UPDATE prestamos SET estado = 'devuelto', fecha_devolucion = NOW() WHERE id = ?",
            [id]
        );

        // Se le devuelve la copia disponible al microservicio de Libros
        await actualizarDisponibilidadLibro(prestamo.libro_id, 'devolver');

        const [actualizado] = await db.query('SELECT * FROM prestamos WHERE id = ?', [id]);
        res.json(actualizado[0]);
    } catch (error) {
        console.error('Error al procesar devolucion:', error.message);
        res.status(500).json({ error: error.message || 'Error interno del servidor.' });
    }
});

module.exports = router;