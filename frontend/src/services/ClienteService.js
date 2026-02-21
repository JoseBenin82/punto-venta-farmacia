import { API_BASE_URL, API_ENDPOINTS, getHeaders, handleResponse, fetchConTimeout, USE_MOCK } from './apiConfig';
import Cliente from '../models/Cliente';
import { clientesMock, simulateNetworkDelay } from './mockData';

/**
 * Servicio para gestión de Clientes
 * Preparado para conectarse con Spring Boot REST API
 *
 * Endpoints consumidos:
 *   GET    /api/clientes                    → obtenerTodos()
 *   GET    /api/clientes/{id}               → obtenerPorId(id)
 *   GET    /api/clientes/dni/{dni}          → buscarPorDNI(dni)
 *   GET    /api/clientes?nombre={nombre}    → buscarPorNombre(nombre)
 *   GET    /api/clientes?activo=true        → obtenerActivos()
 *   POST   /api/clientes                    → crear(cliente)
 *   PUT    /api/clientes/{id}               → actualizar(id, cliente)
 *   DELETE /api/clientes/{id}              → eliminar(id)  (soft-delete)
 */
class ClienteService {

    #url(endpoint) {
        return `${API_BASE_URL}${endpoint}`;
    }

    #mapArray(data) {
        return (data || []).map(dto => Cliente.fromDTO(dto));
    }

    // ── GET /api/clientes ─────────────────────────────────────
    async obtenerTodos() {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return clientesMock;
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.CLIENTES), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.warn('[ClienteService] Backend no disponible, usando MOCK:', error.message);
            return clientesMock;
        }
    }

    // ── GET /api/clientes/{id} ────────────────────────────────
    async obtenerPorId(id) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return clientesMock.find(c => c.id === parseInt(id)) || null;
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.CLIENTE_BY_ID(id)), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return data ? Cliente.fromDTO(data) : null;
        } catch (error) {
            console.error(`[ClienteService] Error al obtener cliente ${id}:`, error.message);
            throw error;
        }
    }

    // ── GET /api/clientes/dni/{dni} ───────────────────────────
    async buscarPorDNI(dni) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return clientesMock.find(c => c.dni === dni) || null;
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.CLIENTE_BY_DNI(dni)), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return data ? Cliente.fromDTO(data) : null;
        } catch (error) {
            if (error.status === 404) return null;
            console.error(`[ClienteService] Error al buscar DNI ${dni}:`, error.message);
            throw error;
        }
    }

    // ── GET /api/clientes?nombre={nombre} ─────────────────────
    async buscarPorNombre(nombre) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            const t = nombre.toLowerCase();
            return clientesMock.filter(c => c.coincideBusqueda(t));
        }
        try {
            const url = `${this.#url(API_ENDPOINTS.CLIENTES_BUSCAR)}?nombre=${encodeURIComponent(nombre)}`;
            const response = await fetchConTimeout(url, {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error(`[ClienteService] Error al buscar por nombre "${nombre}":`, error.message);
            const t = nombre.toLowerCase();
            return clientesMock.filter(c => c.coincideBusqueda(t));
        }
    }

    // ── GET /api/clientes?activo=true ─────────────────────────
    async obtenerActivos() {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return clientesMock.filter(c => c.activo);
        }
        try {
            const url = `${this.#url(API_ENDPOINTS.CLIENTES_ACTIVOS)}?activo=true`;
            const response = await fetchConTimeout(url, {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error('[ClienteService] Error al obtener activos:', error.message);
            return clientesMock.filter(c => c.activo);
        }
    }

    // ── POST /api/clientes ────────────────────────────────────
    async crear(cliente) {
        const errores = cliente.validar();
        if (errores.length > 0) {
            throw new Error(`Errores de validación: ${errores.join(', ')}`);
        }

        if (USE_MOCK) {
            await simulateNetworkDelay();
            const nuevo = Cliente.fromDTO({ ...cliente.toDTO(), id: Date.now() });
            clientesMock.push(nuevo);
            return nuevo;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.CLIENTES), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(cliente.toDTO()),
        });
        const data = await handleResponse(response);
        return Cliente.fromDTO(data);
    }

    // ── PUT /api/clientes/{id} ────────────────────────────────
    async actualizar(id, cliente) {
        const errores = cliente.validar();
        if (errores.length > 0) {
            throw new Error(`Errores de validación: ${errores.join(', ')}`);
        }

        if (USE_MOCK) {
            await simulateNetworkDelay();
            const idx = clientesMock.findIndex(c => c.id === parseInt(id));
            if (idx === -1) throw new Error(`Cliente ${id} no encontrado`);
            clientesMock[idx] = Cliente.fromDTO({ ...cliente.toDTO(), id: parseInt(id) });
            return clientesMock[idx];
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.CLIENTE_BY_ID(id)), {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(cliente.toDTO()),
        });
        const data = await handleResponse(response);
        return Cliente.fromDTO(data);
    }

    // ── DELETE /api/clientes/{id} (soft-delete) ───────────────
    async eliminar(id) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            const idx = clientesMock.findIndex(c => c.id === parseInt(id));
            if (idx !== -1) clientesMock[idx].activo = false;
            return true;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.CLIENTE_BY_ID(id)), {
            method: 'DELETE',
            headers: getHeaders(),
        });
        await handleResponse(response);
        return true;
    }
}

// Exportar instancia única (Singleton)
export default new ClienteService();
