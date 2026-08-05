// =====================================================
// server.js - Usuarios Service
// Punto de entrada del microservicio de Usuarios.
// Corre de forma independiente en su propio puerto (3001) y con su propia base de datos (db_usuarios).
// =====================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globales
app.use(cors());            // Permite peticiones desde el frontend 
app.use(express.json());    // Permite leer JSON en el body de las peticiones

// Endpoint de salud, es util para verificar que el servicio esta activo
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'usuarios-service' });
});

// Se montan las rutas de usuarios bajo el prefijo /api/usuarios
app.use('/api/usuarios', usuariosRoutes);

app.listen(PORT, () => {
    console.log(`Usuarios Service corriendo en http://localhost:${PORT}`);
});