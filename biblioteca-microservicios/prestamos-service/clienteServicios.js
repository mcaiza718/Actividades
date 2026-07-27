// clienteServicios.js
// Este modulo centraliza la comunicacion entre servicios.
// =====================================================

require('dotenv').config();
const axios = require('axios');

const USUARIOS_URL = process.env.USUARIOS_SERVICE_URL;
const LIBROS_URL = process.env.LIBROS_SERVICE_URL;

// -----------------------------------------------------
// Verifica que un usuario exista consultando al microservicio de Usuarios (GET /api/usuarios/:id)
// -----------------------------------------------------
async function obtenerUsuario(usuarioId) {
    try {
        const respuesta = await axios.get(`${USUARIOS_URL}/api/usuarios/${usuarioId}`);
        return respuesta.data; // el usuario existe, se devuelven sus datos
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null; // el usuario no existe
        }
        // Si el servicio de Usuarios esta caido u ocurre otro error de red
        throw new Error('No se pudo contactar al servicio de Usuarios.');
    }
}

// -----------------------------------------------------
// Verifica que un libro exista y tenga copias disponibles consultando al microservicio de Libros (GET /api/libros/:id)
// -----------------------------------------------------
async function obtenerLibro(libroId) {
    try {
        const respuesta = await axios.get(`${LIBROS_URL}/api/libros/${libroId}`);
        return respuesta.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw new Error('No se pudo contactar al servicio de Libros.');
    }
}

// -----------------------------------------------------
// Le indica al microservicio de Libros que descuente (o devuelva) una copia disponible de un libro.
// accion: 'prestar' | 'devolver'
// -----------------------------------------------------
async function actualizarDisponibilidadLibro(libroId, accion) {
    const respuesta = await axios.patch(`${LIBROS_URL}/api/libros/${libroId}/disponibilidad`, { accion });
    return respuesta.data;
}

module.exports = {
    obtenerUsuario,
    obtenerLibro,
    actualizarDisponibilidadLibro
};