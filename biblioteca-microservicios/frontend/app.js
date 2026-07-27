// =====================================================
// app.js
// Frontend en JavaScript puro que consume las 3 APIs REST (Usuarios, Libros, Prestamos). No usa ningun framework: solo fetch() nativo del navegador.
// =====================================================

// -----------------------------------------------------
// URLs base de cada microservicio.
// Si despliegas los servicios en otro host/puerto, solo necesitas cambiar estas 3 constantes.
// -----------------------------------------------------
const API = {
    usuarios: 'http://localhost:3001/api/usuarios',
    libros: 'http://localhost:3002/api/libros',
    prestamos: 'http://localhost:3003/api/prestamos'
};

const HEALTH = {
    usuarios: 'http://localhost:3001/health',
    libros: 'http://localhost:3002/health',
    prestamos: 'http://localhost:3003/health'
};

// =====================================================
// Utilidades generales
// =====================================================

// Envuelve fetch() para simplificar el manejo de errores del backend
async function apiRequest(url, options = {}) {
    const respuesta = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
        throw new Error(datos.error || 'Ocurrio un error inesperado.');
    }
    return datos;
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '-';
    const f = new Date(fechaISO);
    return f.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
}

function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = 'form-msg ' + tipo;
}

// =====================================================
// Navegacion por pestañas (Usuarios / Libros / Prestamos)
// =====================================================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById('panel-' + tab.dataset.tab).classList.add('active');

        // Al entrar a la pestania de prestamos, se refrescan los selects
        if (tab.dataset.tab === 'prestamos') {
            cargarSelectsPrestamo();
        }
    });
});

// =====================================================
// Chequeo de salud de los 3 microservicios (indicadores arriba)
// =====================================================
async function verificarEstadoServicios() {
    for (const nombre of Object.keys(HEALTH)) {
        const pill = document.querySelector(`.status-pill[data-service="${nombre}"]`);
        try {
            await apiRequest(HEALTH[nombre]);
            pill.classList.add('online');
            pill.classList.remove('offline');
        } catch (e) {
            pill.classList.add('offline');
            pill.classList.remove('online');
        }
    }
}

// =====================================================
// SECCION USUARIOS
// =====================================================

async function cargarUsuarios() {
    const tbody = document.getElementById('tablaUsuarios');
    tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Cargando...</td></tr>';
    try {
        const usuarios = await apiRequest(API.usuarios);
        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Aun no hay usuarios registrados.</td></tr>';
            return;
        }
        tbody.innerHTML = usuarios.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td>${u.telefono || '-'}</td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="4">No se pudo conectar con usuarios-service.</td></tr>`;
    }
}

document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('usuarioMsg');
    const boton = e.target.querySelector('button');
    boton.disabled = true;

    const payload = {
        nombre: document.getElementById('usuarioNombre').value.trim(),
        email: document.getElementById('usuarioEmail').value.trim(),
        telefono: document.getElementById('usuarioTelefono').value.trim()
    };

    try {
        await apiRequest(API.usuarios, { method: 'POST', body: JSON.stringify(payload) });
        mostrarMensaje(msg, 'Usuario registrado correctamente.', 'ok');
        e.target.reset();
        cargarUsuarios();
    } catch (err) {
        mostrarMensaje(msg, err.message, 'error');
    } finally {
        boton.disabled = false;
    }
});

document.getElementById('refreshUsuarios').addEventListener('click', cargarUsuarios);

// =====================================================
// SECCION LIBROS
// =====================================================

async function cargarLibros() {
    const tbody = document.getElementById('tablaLibros');
    const soloDisponibles = document.getElementById('soloDisponibles').checked;
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Cargando...</td></tr>';

    try {
        const url = soloDisponibles ? `${API.libros}?disponibles=true` : API.libros;
        const libros = await apiRequest(url);
        if (libros.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No hay libros que mostrar.</td></tr>';
            return;
        }
        tbody.innerHTML = libros.map(l => `
            <tr>
                <td>${l.id}</td>
                <td>${l.titulo}</td>
                <td>${l.autor}</td>
                <td>${l.cantidad_disponible}</td>
                <td>${l.cantidad_total}</td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No se pudo conectar con libros-service.</td></tr>`;
    }
}

document.getElementById('formLibro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('libroMsg');
    const boton = e.target.querySelector('button');
    boton.disabled = true;

    const payload = {
        titulo: document.getElementById('libroTitulo').value.trim(),
        autor: document.getElementById('libroAutor').value.trim(),
        isbn: document.getElementById('libroIsbn').value.trim(),
        cantidad_total: parseInt(document.getElementById('libroCantidad').value, 10)
    };

    try {
        await apiRequest(API.libros, { method: 'POST', body: JSON.stringify(payload) });
        mostrarMensaje(msg, 'Libro registrado correctamente.', 'ok');
        e.target.reset();
        cargarLibros();
    } catch (err) {
        mostrarMensaje(msg, err.message, 'error');
    } finally {
        boton.disabled = false;
    }
});

document.getElementById('refreshLibros').addEventListener('click', cargarLibros);
document.getElementById('soloDisponibles').addEventListener('change', cargarLibros);

// =====================================================
// SECCION PRESTAMOS
// =====================================================

// Llena los <select> de usuario y libro con datos frescos de los otros dos microservicios (comunicacion desde el frontend).
async function cargarSelectsPrestamo() {
    const selectUsuario = document.getElementById('prestamoUsuario');
    const selectLibro = document.getElementById('prestamoLibro');

    try {
        const usuarios = await apiRequest(API.usuarios);
        selectUsuario.innerHTML = '<option value="">Selecciona un usuario&hellip;</option>' +
            usuarios.map(u => `<option value="${u.id}">${u.nombre} (${u.email})</option>`).join('');
    } catch (e) {
        selectUsuario.innerHTML = '<option value="">No se pudo cargar usuarios</option>';
    }

    try {
        const libros = await apiRequest(`${API.libros}?disponibles=true`);
        if (libros.length === 0) {
            selectLibro.innerHTML = '<option value="">No hay libros disponibles</option>';
        } else {
            selectLibro.innerHTML = '<option value="">Selecciona un libro&hellip;</option>' +
                libros.map(l => `<option value="${l.id}">${l.titulo} (${l.cantidad_disponible} disp.)</option>`).join('');
        }
    } catch (e) {
        selectLibro.innerHTML = '<option value="">No se pudo cargar libros</option>';
    }
}

async function cargarPrestamos() {
    const tbody = document.getElementById('tablaPrestamos');
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Cargando...</td></tr>';
    try {
        const prestamos = await apiRequest(API.prestamos);
        if (prestamos.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Aun no hay prestamos registrados.</td></tr>';
            return;
        }
        tbody.innerHTML = prestamos.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.usuario_nombre}</td>
                <td>${p.libro_titulo}</td>
                <td>${formatearFecha(p.fecha_prestamo)}</td>
                <td><span class="badge ${p.estado}">${p.estado}</span></td>
                <td>${p.estado === 'activo' ? `<button class="link-btn" data-id="${p.id}">Marcar devuelto</button>` : ''}</td>
            </tr>
        `).join('');

        // Se enlazan los botones de devolucion generados dinamicamente
        tbody.querySelectorAll('.link-btn').forEach(btn => {
            btn.addEventListener('click', () => devolverPrestamo(btn.dataset.id));
        });
    } catch (e) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No se pudo conectar con prestamos-service.</td></tr>`;
    }
}

async function devolverPrestamo(id) {
    try {
        await apiRequest(`${API.prestamos}/${id}/devolver`, { method: 'PATCH', body: JSON.stringify({}) });
        cargarPrestamos();
        cargarLibros(); // la disponibilidad del libro cambio
    } catch (err) {
        alert('No se pudo registrar la devolucion: ' + err.message);
    }
}

document.getElementById('formPrestamo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('prestamoMsg');
    const boton = e.target.querySelector('button');
    boton.disabled = true;

    const payload = {
        usuario_id: parseInt(document.getElementById('prestamoUsuario').value, 10),
        libro_id: parseInt(document.getElementById('prestamoLibro').value, 10)
    };

    try {
        await apiRequest(API.prestamos, { method: 'POST', body: JSON.stringify(payload) });
        mostrarMensaje(msg, 'Prestamo registrado correctamente.', 'ok');
        e.target.reset();
        cargarPrestamos();
        cargarSelectsPrestamo(); // el libro prestado ya no aparecera como disponible
    } catch (err) {
        mostrarMensaje(msg, err.message, 'error');
    } finally {
        boton.disabled = false;
    }
});

document.getElementById('refreshPrestamos').addEventListener('click', cargarPrestamos);

// =====================================================
// Inicializacion: se ejecuta al cargar la pagina
// =====================================================
verificarEstadoServicios();
cargarUsuarios();
cargarLibros();
cargarPrestamos();

// Se vuelve a verifica el estado de los servicios cada 15 segundos
setInterval(verificarEstadoServicios, 15000);