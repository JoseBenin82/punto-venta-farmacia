import { API_BASE_URL, API_ENDPOINTS, getHeaders, handleResponse, fetchConTimeout, USE_MOCK } from './apiConfig';
import Producto from '../models/Producto';
import { productosMock, simulateNetworkDelay } from './mockData';

/**
 * Servicio para gestión de Productos
 * Preparado para conectarse con Spring Boot REST API
 *
 * Endpoints consumidos:
 *   GET    /api/productos                              → obtenerTodos()
 *   GET    /api/productos/{id}                         → obtenerPorId(id)
 *   GET    /api/productos/codigo/{codigo}              → buscarPorCodigo(codigo)
 *   GET    /api/productos/categoria/{cat}              → obtenerPorCategoria(cat)
 *   GET    /api/productos/stock-bajo                   → obtenerStockBajo()
 *   GET    /api/productos?nombre={nombre}              → buscarPorNombre(nombre)
 *   POST   /api/productos                              → crear(producto)
 *   PUT    /api/productos/{id}                         → actualizar(id, producto)
 *   DELETE /api/productos/{id}                         → eliminar(id)   (soft-delete)
 */
class ProductoService {

    // ── Helpers internos ─────────────────────────────────────
    #url(endpoint) {
        return `${API_BASE_URL}${endpoint}`;
    }

    /**
     * Mapea un array de DTOs del backend a instancias de Producto.
     * Si el DTO incluye lotes, los convierte también.
     */
    #mapArray(dataArray) {
        return (dataArray || []).map(dto => Producto.fromDTO(dto));
    }

    // ── GET /api/productos ────────────────────────────────────
    async obtenerTodos() {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return productosMock;
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.PRODUCTOS), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.warn('[ProductoService] Backend no disponible, usando MOCK:', error.message);
            return productosMock;
        }
    }

    // ── GET /api/productos/{id} ───────────────────────────────
    async obtenerPorId(id) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return productosMock.find(p => p.id === parseInt(id)) || null;
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.PRODUCTO_BY_ID(id)), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return data ? Producto.fromDTO(data) : null;
        } catch (error) {
            console.error(`[ProductoService] Error al obtener producto ${id}:`, error.message);
            throw error;
        }
    }

    // ── GET /api/productos/codigo/{codigo} ────────────────────
    async buscarPorCodigo(codigo) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return productosMock.find(p => p.codigoBarras === codigo) || null;
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.PRODUCTO_BY_CODIGO(codigo)), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return data ? Producto.fromDTO(data) : null;
        } catch (error) {
            if (error.status === 404) return null;
            console.error(`[ProductoService] Error al buscar código ${codigo}:`, error.message);
            // Fallback local en caso de error de red
            return productosMock.find(p => p.codigoBarras === codigo) || null;
        }
    }

    // ── GET /api/productos/categoria/{categoria} ──────────────
    async obtenerPorCategoria(categoria) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return productosMock.filter(p => p.categoria === categoria);
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.PRODUCTOS_CATEGORIA(categoria)), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error(`[ProductoService] Error al obtener categoría ${categoria}:`, error.message);
            return productosMock.filter(p => p.categoria === categoria);
        }
    }

    // ── GET /api/productos/stock-bajo ─────────────────────────
    async obtenerStockBajo() {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return productosMock.filter(p => p.getSemaforoStock() !== 'VERDE');
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.PRODUCTOS_STOCK_BAJO), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error('[ProductoService] Error al obtener stock bajo:', error.message);
            return productosMock.filter(p => p.getSemaforoStock() !== 'VERDE');
        }
    }

    // ── GET /api/productos?nombre={nombre} ────────────────────
    async buscarPorNombre(nombre) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            const t = nombre.toLowerCase();
            return productosMock.filter(p => p.coincideBusqueda(t));
        }
        try {
            const url = `${this.#url(API_ENDPOINTS.PRODUCTOS_BUSCAR)}?nombre=${encodeURIComponent(nombre)}`;
            const response = await fetchConTimeout(url, {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error(`[ProductoService] Error al buscar por nombre "${nombre}":`, error.message);
            // Fallback local
            const t = nombre.toLowerCase();
            return productosMock.filter(p => p.coincideBusqueda(t));
        }
    }

    // ── POST /api/productos ───────────────────────────────────
    async crear(producto) {
        const errores = producto.validar();
        if (errores.length > 0) {
            throw new Error(`Errores de validación: ${errores.join(', ')}`);
        }

        if (USE_MOCK) {
            await simulateNetworkDelay();
            const nuevo = Producto.fromDTO({ ...producto.toDTO(), id: Date.now() });
            productosMock.push(nuevo);
            return nuevo;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.PRODUCTOS), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(producto.toDTO()),
        });
        const data = await handleResponse(response);
        return Producto.fromDTO(data);
    }

    // ── PUT /api/productos/{id} ───────────────────────────────
    async actualizar(id, producto) {
        const errores = producto.validar();
        if (errores.length > 0) {
            throw new Error(`Errores de validación: ${errores.join(', ')}`);
        }

        if (USE_MOCK) {
            await simulateNetworkDelay();
            const idx = productosMock.findIndex(p => p.id === parseInt(id));
            if (idx === -1) throw new Error(`Producto ${id} no encontrado`);
            productosMock[idx] = Producto.fromDTO({ ...producto.toDTO(), id: parseInt(id) });
            return productosMock[idx];
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.PRODUCTO_BY_ID(id)), {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(producto.toDTO()),
        });
        const data = await handleResponse(response);
        return Producto.fromDTO(data);
    }

    // ── DELETE /api/productos/{id} (soft-delete) ──────────────
    async eliminar(id) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            const idx = productosMock.findIndex(p => p.id === parseInt(id));
            if (idx !== -1) productosMock[idx].activo = false;
            return true;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.PRODUCTO_BY_ID(id)), {
            method: 'DELETE',
            headers: getHeaders(),
        });
        await handleResponse(response);
        return true;
    }
}

// Exportar instancia única (Singleton)
export default new ProductoService();
