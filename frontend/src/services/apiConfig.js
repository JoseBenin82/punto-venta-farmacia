/**
 * Configuración de la API
 * ─────────────────────────────────────────────────────────────
 * URL base del backend Spring Boot  (puerto 8080)
 * El proxy de Vite (vite.config.js) redirige /api/* → http://localhost:8080/
 * así que en desarrollo la API_BASE_URL puede ser relativa.
 * En producción cambiarla por la URL real del servidor.
 * ─────────────────────────────────────────────────────────────
 */

// URL base del backend — cambia sólo si despliegas en otro servidor
export const API_BASE_URL = '/api';

// ──────────────────────────────────────────────
// Endpoints de la API (todos relativos a API_BASE_URL)
// ──────────────────────────────────────────────
export const API_ENDPOINTS = {

    // ---------------- Productos ----------------
    PRODUCTOS: '/productos',
    PRODUCTO_BY_ID: (id) => `/productos/${id}`,
    PRODUCTO_BY_CODIGO: (codigo) => `/productos/codigo/${codigo}`,
    PRODUCTOS_CATEGORIA: (cat) => `/productos/categoria/${cat}`,
    PRODUCTOS_STOCK_BAJO: '/productos/stock-bajo',
    PRODUCTOS_BUSCAR: '/productos',         // GET ?nombre=

    // ---------------- Lotes --------------------
    LOTES: '/lotes',
    LOTE_BY_ID: (id) => `/lotes/${id}`,
    LOTES_BY_PRODUCTO: (prodId) => `/lotes/producto/${prodId}`,
    LOTES_VENCIDOS: '/lotes/vencidos',
    LOTES_PROXIMOS: '/lotes/proximos-vencer',

    // ---------------- Clientes -----------------
    CLIENTES: '/clientes',
    CLIENTE_BY_ID: (id) => `/clientes/${id}`,
    CLIENTE_BY_DNI: (dni) => `/clientes/dni/${dni}`,
    CLIENTES_BUSCAR: '/clientes',           // GET ?nombre=
    CLIENTES_ACTIVOS: '/clientes',            // GET ?activo=true

    // ---------------- Ventas -------------------
    VENTAS: '/ventas',
    VENTA_BY_ID: (id) => `/ventas/${id}`,
    VENTAS_BY_CLIENTE: (cliId) => `/ventas/cliente/${cliId}`,
    VENTAS_BY_FECHA: '/ventas/fecha',       // GET ?inicio=&fin=
    VENTAS_REPORTE: '/ventas/reporte',     // GET ?inicio=&fin=
    VENTA_CANCELAR: (id) => `/ventas/${id}/cancelar`,

    // ---------------- Inventario ---------------
    INVENTARIO_MOVIMIENTOS: '/inventario/movimientos',
    INVENTARIO_MOVIMIENTO_BY_ID: (id) => `/inventario/movimientos/${id}`,
    INVENTARIO_BY_PRODUCTO: (prodId) => `/inventario/producto/${prodId}`,
    INVENTARIO_ENTRADA: '/inventario/entrada',
    INVENTARIO_SALIDA: '/inventario/salida',
    INVENTARIO_AJUSTE: '/inventario/ajuste',

    // ---------------- Corte de Caja -----------
    CORTE_CAJA_ACTUAL: '/corte-caja/actual',
    CORTE_CAJA_CERRAR: '/corte-caja/cerrar',
    CORTE_CAJA_RETIRO: '/corte-caja/retiro',
    CORTE_CAJA_HISTORIAL: '/corte-caja/historial',

    // ---------------- Recetas Médicas ---------
    RECETAS: '/recetas',
    RECETA_BY_ID: (id) => `/recetas/${id}`,
    RECETAS_BY_VENTA: (ventId) => `/recetas/venta/${ventId}`,

    // ---------------- Facturas ----------------
    FACTURAS: '/facturas',
    FACTURA_BY_ID: (id) => `/facturas/${id}`,
    FACTURA_BY_VENTA: (ventId) => `/facturas/venta/${ventId}`,
    FACTURA_TIMBRAR: (id) => `/facturas/${id}/timbrar`,
    FACTURA_CANCELAR: (id) => `/facturas/${id}/cancelar`,
};

// ──────────────────────────────────────────────
// Construcción de headers HTTP
// ──────────────────────────────────────────────
export const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    // Descomenta cuando implementes autenticación JWT:
    // const token = localStorage.getItem('token');
    // if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// ──────────────────────────────────────────────
// Manejo centralizado de respuestas HTTP
// ──────────────────────────────────────────────
export const handleResponse = async (response) => {
    // 204 No Content → retornar null explícitamente
    if (response.status === 204) return null;

    if (!response.ok) {
        let errorMessage = `Error HTTP ${response.status}`;
        try {
            const errorBody = await response.json();
            // Soporte mejorado para respuestas del backend Spring Validation
            if (errorBody.errors && Array.isArray(errorBody.errors)) {
                errorMessage = errorBody.errors.map(err => err.defaultMessage || err).join(' | ');
            } else {
                errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
            }
        } catch {
            errorMessage = await response.text().catch(() => errorMessage);
        }

        // Despachamos evento global para que un Toast (notificaciones) lo capture
        const ev = new CustomEvent('api-error', { detail: { status: response.status, message: errorMessage } });
        window.dispatchEvent(ev);

        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
    }

    // Intentar parsear JSON; si el cuerpo está vacío retornar null
    const text = await response.text();
    if (!text || text.trim() === '') return null;
    return JSON.parse(text);
};

// ──────────────────────────────────────────────
// fetch con timeout automático
// ──────────────────────────────────────────────
export const TIMEOUT_MS = 30000; // 30 segundos

export const fetchConTimeout = (url, options = {}) => {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timerId));
};

// ──────────────────────────────────────────────
// MODO MOCK
// ──────────────────────────────────────────────
/**
 * USE_MOCK = true  → los servicios devuelven datos locales (mockData.js)
 * USE_MOCK = false → los servicios llaman al backend Spring Boot
 *
 * Para conectar con el backend real, asegúrate de:
 *   1. El backend esté corriendo en http://localhost:8080
 *   2. Este flag esté en false
 */
export const USE_MOCK = false;

export default {
    API_BASE_URL,
    API_ENDPOINTS,
    getHeaders,
    handleResponse,
    fetchConTimeout,
    TIMEOUT_MS,
    USE_MOCK,
};
