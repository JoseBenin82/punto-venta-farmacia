import { API_BASE_URL, API_ENDPOINTS, getHeaders, handleResponse, fetchConTimeout, USE_MOCK } from './apiConfig';
import { MovimientoInventario } from '../models/Inventario';
import { simulateNetworkDelay } from './mockData';

/**
 * Servicio para gestión de Inventario (Movimientos)
 * Preparado para conectarse con Spring Boot REST API
 *
 * Endpoints consumidos:
 *   GET    /api/inventario/movimientos                → obtenerMovimientos()
 *   GET    /api/inventario/movimientos/{id}           → obtenerMovimientoPorId(id)
 *   GET    /api/inventario/producto/{productoId}      → obtenerPorProducto(prodId)
 *   POST   /api/inventario/entrada                    → registrarEntrada(movimiento)
 *   POST   /api/inventario/salida                     → registrarSalida(movimiento)
 *   POST   /api/inventario/ajuste                     → registrarAjuste(movimiento)
 */

// Almacenamiento temporal para modo MOCK
let movimientosMock = [];

class InventarioService {

    #url(endpoint) {
        return `${API_BASE_URL}${endpoint}`;
    }

    #mapArray(data) {
        return (data || []).map(dto => MovimientoInventario.fromDTO(dto));
    }

    // ── GET /api/inventario/movimientos ───────────────────────
    async obtenerMovimientos(productoId = null) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            if (productoId) {
                return movimientosMock.filter(m => m.productoId === parseInt(productoId));
            }
            return [...movimientosMock];
        }
        try {
            const endpoint = productoId
                ? API_ENDPOINTS.INVENTARIO_BY_PRODUCTO(productoId)
                : API_ENDPOINTS.INVENTARIO_MOVIMIENTOS;

            const response = await fetchConTimeout(this.#url(endpoint), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error('[InventarioService] Error al obtener movimientos:', error.message);
            throw error;
        }
    }

    // ── GET /api/inventario/movimientos/{id} ──────────────────
    async obtenerMovimientoPorId(id) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return movimientosMock.find(m => m.id === parseInt(id)) || null;
        }
        try {
            const response = await fetchConTimeout(
                this.#url(API_ENDPOINTS.INVENTARIO_MOVIMIENTO_BY_ID(id)),
                { method: 'GET', headers: getHeaders() }
            );
            const data = await handleResponse(response);
            return data ? MovimientoInventario.fromDTO(data) : null;
        } catch (error) {
            console.error(`[InventarioService] Error al obtener movimiento ${id}:`, error.message);
            throw error;
        }
    }

    // ── POST /api/inventario/entrada ──────────────────────────
    async registrarEntrada(movimiento) {
        const errores = movimiento.validar();
        if (errores.length > 0) {
            throw new Error(`Errores de validación: ${errores.join(', ')}`);
        }

        if (USE_MOCK) {
            await simulateNetworkDelay(500);
            const nuevo = MovimientoInventario.fromDTO({
                ...movimiento.toDTO(),
                id: Date.now(),
                tipoMovimiento: 'ENTRADA',
                fecha: new Date().toISOString(),
            });
            movimientosMock.unshift(nuevo);
            return nuevo;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.INVENTARIO_ENTRADA), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(movimiento.toDTO()),
        });
        const data = await handleResponse(response);
        return MovimientoInventario.fromDTO(data);
    }

    // ── POST /api/inventario/salida ───────────────────────────
    async registrarSalida(movimiento) {
        const errores = movimiento.validar();
        if (errores.length > 0) {
            throw new Error(`Errores de validación: ${errores.join(', ')}`);
        }

        if (USE_MOCK) {
            await simulateNetworkDelay(500);
            const nuevo = MovimientoInventario.fromDTO({
                ...movimiento.toDTO(),
                id: Date.now(),
                tipoMovimiento: 'SALIDA',
                fecha: new Date().toISOString(),
            });
            movimientosMock.unshift(nuevo);
            return nuevo;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.INVENTARIO_SALIDA), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(movimiento.toDTO()),
        });
        const data = await handleResponse(response);
        return MovimientoInventario.fromDTO(data);
    }

    // ── POST /api/inventario/ajuste ───────────────────────────
    async registrarAjuste(movimiento) {
        // Ajustes pueden ser positivos o negativos, validación diferente
        if (!movimiento.productoId) {
            throw new Error('El producto es obligatorio');
        }
        if (!movimiento.motivo) {
            throw new Error('El motivo del ajuste es obligatorio');
        }

        if (USE_MOCK) {
            await simulateNetworkDelay(500);
            const nuevo = MovimientoInventario.fromDTO({
                ...movimiento.toDTO(),
                id: Date.now(),
                tipoMovimiento: 'AJUSTE',
                fecha: new Date().toISOString(),
            });
            movimientosMock.unshift(nuevo);
            return nuevo;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.INVENTARIO_AJUSTE), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(movimiento.toDTO()),
        });
        const data = await handleResponse(response);
        return MovimientoInventario.fromDTO(data);
    }
}

// Exportar instancia única (Singleton)
export default new InventarioService();
