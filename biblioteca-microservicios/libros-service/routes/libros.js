// routes/libros.js
// Define los endpoints REST del microservicio de libros
// =====================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// -----------------------------------------------------
// POST /api/libros
// Registrar un nuevo libro en el catalogo
// -----------------------------------------------------
router.post('/', async (req, res) => {
    try {
        const { titulo, autor, isbn, cantidad_total } = req.body;

        if (!titulo || !autor) {
            return res.status(400).json({ error: 'Los campos titulo y autor son obligatorios.' });
        }

        const cantidad = cantidad_total && cantidad_total > 0 ? cantidad_total : 1;

        // Al registrar el libro, la cantidad disponible inicia igual a la cantidad total
        const [result] = await db.query(
            'INSERT INTO libros (titulo, autor, isbn, cantidad_total, cantidad_disponible) VALUES (?, ?, ?, ?, ?)',
            [titulo, autor, isbn || null, cantidad, cantidad]
        );

        res.status(201).json({
            id: result.insertId,
            titulo,
            autor,
            isbn,
            cantidad_total: cantidad,
            cantidad_disponible: cantidad
        });
    } catch (error) {
        if (error.errno === 1062) {
            return res.status(409).json({ error: 'Ya existe un libro con ese ISBN.' });
        }
        console.error('Error al registrar libro:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -----------------------------------------------------
// GET /api/libros
// Consultar libros. Soporta ?disponibles=true para filtrar solo los libros que tienen al menos 1 copia disponible.
// -----------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const { disponibles } = req.query;

        let query = 'SELECT * FROM libros';
        if (disponibles === 'true') {
            query += ' WHERE cantidad_disponible > 0';
        }
        query += ' ORDER BY id DESC';

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al consultar libros:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -----------------------------------------------------
// GET /api/libros/:id
// Consultar un libro especifico por su id.
// Usado internamente por el microservicio de prestamos para validar que el libro existe y tiene disponibilidad.
// -----------------------------------------------------
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM libros WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Libro no encontrado.' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al consultar libro:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -----------------------------------------------------
// PATCH /api/libros/:id/disponibilidad
// Ajusta la cantidad disponible de un libro (+1 o -1).
// Este endpoint es invocado por el microservicio de prestamos al registrar un prestamo (-1) o una devolucion (+1).
// -----------------------------------------------------
router.patch('/:id/disponibilidad', async (req, res) => {
    try {
        const { id } = req.params;
        const { accion } = req.body; // 'prestar' o 'devolver'

        const [rows] = await db.query('SELECT * FROM libros WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Libro no encontrado.' });
        }

        const libro = rows[0];

        if (accion === 'prestar') {
            if (libro.cantidad_disponible <= 0) {
                return res.status(400).json({ error: 'No hay copias disponibles de este libro.' });
            }
            await db.query('UPDATE libros SET cantidad_disponible = cantidad_disponible - 1 WHERE id = ?', [id]);
        } else if (accion === 'devolver') {
            await db.query(
                'UPDATE libros SET cantidad_disponible = LEAST(cantidad_disponible + 1, cantidad_total) WHERE id = ?',
                [id]
            );
        } else {
            return res.status(400).json({ error: "El campo 'accion' debe ser 'prestar' o 'devolver'." });
        }

        const [actualizado] = await db.query('SELECT * FROM libros WHERE id = ?', [id]);
        res.json(actualizado[0]);
    } catch (error) {
        console.error('Error al actualizar disponibilidad:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;