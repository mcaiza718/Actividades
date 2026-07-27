// =====================================================
// server.js - Libros Service
// Punto de entrada del microservicio de Libros.
// Corre de forma independiente en su propio puerto (3002) y con su propia base de datos (db_libros).
// =====================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const librosRoutes = require('./routes/libros');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'libros-service' });
});

app.use('/api/libros', librosRoutes);

app.listen(PORT, () => {
    console.log(`Libros Service corriendo en http://localhost:${PORT}`);
});