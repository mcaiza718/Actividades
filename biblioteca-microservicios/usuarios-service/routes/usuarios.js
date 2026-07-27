// routes/usuarios.js
// Define los endpoints REST del microservicio de Usuarios
// =====================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// -----------------------------------------------------
// POST /api/usuarios
// Registrar un nuevo usuario
// -----------------------------------------------------
router.post('/', async (req, res) => {
    try {
        const { nombre, email, telefono } = req.body;

        // Validacion basica de campos obligatorios
        if (!nombre || !email) {
            return res.status(400).json({ error: 'Los campos nombre y email son obligatorios.' });
        }

        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, email, telefono) VALUES (?, ?, ?)',
            [nombre, email, telefono || null]
        );

        // Se devuelve el usuario recien creado
        res.status(201).json({
            id: result.insertId,
            nombre,
            email,
            telefono
        });
    } catch (error) {
        // Codigo de error 1062 = entrada duplicada (email ya existe)
        if (error.errno === 1062) {
            return res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
        }
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -----------------------------------------------------
// GET /api/usuarios
// Consultar todos los usuarios registrados
// -----------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM usuarios ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al consultar usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// -----------------------------------------------------
// GET /api/usuarios/:id
// Consultar un usuario especifico por su id
// Este endpoint es usado internamente por el microservicio de Prestamos para validar que el usuario existe
// -----------------------------------------------------
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al consultar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;