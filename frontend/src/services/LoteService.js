import { API_BASE_URL, API_ENDPOINTS, getHeaders, handleResponse, fetchConTimeout, USE_MOCK } from './apiConfig';
import Lote from '../models/Lote';
import { simulateNetworkDelay } from './mockData';

/**
 * Servicio para gestión de Lotes
 * Preparado para conectarse con Spring Boot REST API
 *
 * Los lotes son gestionados tanto desde ProductoService (embedded)
 * como a través de este servicio independiente para operaciones
 * específicas de lote (consultas de vencimiento, lotes vencidos, etc.)
 *
 * Endpoints consumidos:
 *   GET    /api/lotes                       → obtenerTodos()
 *   GET    /api/lotes/{id}                  → obtenerPorId(id)
 *   GET    /api/lotes/producto/{productoId} → obtenerPorProducto(productoId)
 *   GET    /api/lotes/vencidos              → obtenerVencidos()
 *   GET    /api/lotes/proximos-vencer       → obtenerProximosVencer()
 *   POST   /api/lotes                       → crear(lote)
 *   PUT    /api/lotes/{id}                  → actualizar(id, lote)
 *   DELETE /api/lotes/{id}                  → eliminar(id)
 */

// Almacenamiento temporal para modo MOCK
let lotesMock = [];

class LoteService {

    #url(endpoint) {
        return `${API_BASE_URL}${endpoint}`;
    }

    #mapArray(data) {
        return (data || []).map(dto => Lote.fromDTO(dto));
    }

    // ── GET /api/lotes ────────────────────────────────────────
    async obtenerTodos() {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return [...lotesMock];
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.LOTES), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error('[LoteService] Error al obtener lotes:', error.message);
            throw error;
        }
    }

    // ── GET /api/lotes/{id} ───────────────────────────────────
    async obtenerPorId(id) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return lotesMock.find(l => l.id === parseInt(id)) || null;
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.LOTE_BY_ID(id)), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return data ? Lote.fromDTO(data) : null;
        } catch (error) {
            console.error(`[LoteService] Error al obtener lote ${id}:`, error.message);
            throw error;
        }
    }

    // ── GET /api/lotes/producto/{productoId} ──────────────────
    async obtenerPorProducto(productoId) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return lotesMock.filter(l => l.productoId === parseInt(productoId));
        }
        try {
            const response = await fetchConTimeout(
                this.#url(API_ENDPOINTS.LOTES_BY_PRODUCTO(productoId)),
                { method: 'GET', headers: getHeaders() }
            );
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error(`[LoteService] Error al obtener lotes del producto ${productoId}:`, error.message);
            throw error;
        }
    }

    // ── GET /api/lotes/vencidos ───────────────────────────────
    async obtenerVencidos() {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return lotesMock.filter(l => {
                const loteObj = l instanceof Lote ? l : Lote.fromDTO(l);
                return loteObj.estaCaducado();
            });
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.LOTES_VENCIDOS), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error('[LoteService] Error al obtener lotes vencidos:', error.message);
            throw error;
        }
    }

    // ── GET /api/lotes/proximos-vencer ────────────────────────
    async obtenerProximosVencer(diasUmbral = 90) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return lotesMock.filter(l => {
                const loteObj = l instanceof Lote ? l : Lote.fromDTO(l);
                return loteObj.estaPorCaducar(diasUmbral) && !loteObj.estaCaducado();
            });
        }
        try {
            const url = `${this.#url(API_ENDPOINTS.LOTES_PROXIMOS)}?dias=${diasUmbral}`;
            const response = await fetchConTimeout(url, {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error('[LoteService] Error al obtener lotes próximos a vencer:', error.message);
            throw error;
        }
    }

    // ── POST /api/lotes ───────────────────────────────────────
    async crear(lote) {
        const errores = lote.validar();
        if (errores.length > 0) {
            throw new Error(`Errores de validación: ${errores.join(', ')}`);
        }

        if (USE_MOCK) {
            await simulateNetworkDelay(400);
            const nuevo = Lote.fromDTO({ ...lote.toDTO(), id: Date.now() });
            lotesMock.push(nuevo);
            return nuevo;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.LOTES), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(lote.toDTO()),
        });
        const data = await handleResponse(response);
        return Lote.fromDTO(data);
    }

    // ── PUT /api/lotes/{id} ───────────────────────────────────
    async actualizar(id, lote) {
        const errores = lote.validar();
        if (errores.length > 0) {
            throw new Error(`Errores de validación: ${errores.join(', ')}`);
        }

        if (USE_MOCK) {
            await simulateNetworkDelay();
            const idx = lotesMock.findIndex(l => l.id === parseInt(id));
            if (idx === -1) throw new Error(`Lote ${id} no encontrado`);
            lotesMock[idx] = Lote.fromDTO({ ...lote.toDTO(), id: parseInt(id) });
            return lotesMock[idx];
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.LOTE_BY_ID(id)), {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(lote.toDTO()),
        });
        const data = await handleResponse(response);
        return Lote.fromDTO(data);
    }

    // ── DELETE /api/lotes/{id} ────────────────────────────────
    async eliminar(id) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            const idx = lotesMock.findIndex(l => l.id === parseInt(id));
            if (idx !== -1) lotesMock.splice(idx, 1);
            return true;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.LOTE_BY_ID(id)), {
            method: 'DELETE',
            headers: getHeaders(),
        });
        await handleResponse(response);
        return true;
    }
}

// Exportar instancia única (Singleton)
export default new LoteService();
