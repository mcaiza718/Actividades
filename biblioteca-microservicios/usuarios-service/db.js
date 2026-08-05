// =====================================================
// db.js - Usuarios Service
// Configura y exporta el pool de conexiones a MySQL
// =====================================================

require('dotenv').config();
const mysql = require('mysql2/promise');

// Se crea un "pool" de conexiones en lugar de una sola conexion,
// esto permite manejar varias peticiones simultaneas de forma eficiente.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;