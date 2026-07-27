// server.js - Prestamos Service
// Punto de entrada del microservicio de Prestamos.
// Corre de forma independiente en su propio puerto (3003) y con su propia base de datos (db_prestamos). Se comunica con Usuarios Service y Libros Service via HTTP (ver clienteServicios.js)
// =====================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prestamosRoutes = require('./routes/prestamos');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'prestamos-service' });
});

app.use('/api/prestamos', prestamosRoutes);

app.listen(PORT, () => {
    console.log(`Prestamos Service corriendo en http://localhost:${PORT}`);
});