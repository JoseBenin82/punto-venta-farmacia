import { API_BASE_URL, API_ENDPOINTS, getHeaders, handleResponse, fetchConTimeout, USE_MOCK } from './apiConfig';
import Venta from '../models/Venta';
import { simulateNetworkDelay } from './mockData';

/**
 * Servicio para gestión de Ventas
 * Preparado para conectarse con Spring Boot REST API
 *
 * Endpoints consumidos:
 *   GET    /api/ventas                              → obtenerTodas()
 *   GET    /api/ventas/{id}                         → obtenerPorId(id)
 *   GET    /api/ventas/cliente/{clienteId}          → obtenerPorCliente(clienteId)
 *   GET    /api/ventas/fecha?inicio=&fin=           → obtenerPorFecha(ini, fin)
 *   GET    /api/ventas/reporte?inicio=&fin=         → obtenerReporte(ini, fin)
 *   POST   /api/ventas                             → crear(venta)
 *   PUT    /api/ventas/{id}                         → actualizar(id, venta)
 *   PUT    /api/ventas/{id}/cancelar               → cancelar(id, motivo)
 */

// Almacenamiento temporal de ventas para modo MOCK
let ventasMock = [];

class VentaService {

    #url(endpoint) {
        return `${API_BASE_URL}${endpoint}`;
    }

    #mapArray(data) {
        return (data || []).map(dto => Venta.fromDTO(dto));
    }

    // ── GET /api/ventas ───────────────────────────────────────
    async obtenerTodas() {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return [...ventasMock];
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.VENTAS), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error('[VentaService] Error al obtener ventas:', error.message);
            throw error;
        }
    }

    // ── GET /api/ventas/{id} ──────────────────────────────────
    async obtenerPorId(id) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return ventasMock.find(v => v.id === parseInt(id)) || null;
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.VENTA_BY_ID(id)), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return data ? Venta.fromDTO(data) : null;
        } catch (error) {
            console.error(`[VentaService] Error al obtener venta ${id}:`, error.message);
            throw error;
        }
    }

    // ── GET /api/ventas/cliente/{clienteId} ───────────────────
    async obtenerPorCliente(clienteId) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return ventasMock.filter(v => v.clienteId === parseInt(clienteId));
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.VENTAS_BY_CLIENTE(clienteId)), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error(`[VentaService] Error al obtener ventas de cliente ${clienteId}:`, error.message);
            throw error;
        }
    }

    // ── GET /api/ventas/fecha?inicio={ini}&fin={fin} ──────────
    async obtenerPorFecha(fechaInicio, fechaFin) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return ventasMock.filter(v => {
                const fecha = new Date(v.fecha);
                return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
            });
        }
        try {
            const params = new URLSearchParams({ inicio: fechaInicio, fin: fechaFin });
            const response = await fetchConTimeout(
                `${this.#url(API_ENDPOINTS.VENTAS_BY_FECHA)}?${params}`,
                { method: 'GET', headers: getHeaders() }
            );
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error('[VentaService] Error al obtener ventas por fecha:', error.message);
            throw error;
        }
    }

    // ── GET /api/ventas/reporte?inicio=&fin= ──────────────────
    async obtenerReporte(fechaInicio, fechaFin) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            const ventas = await this.obtenerPorFecha(fechaInicio, fechaFin);
            const total = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
            return { ventas, totalVentas: total, cantidadVentas: ventas.length };
        }
        try {
            const params = new URLSearchParams({ inicio: fechaInicio, fin: fechaFin });
            const response = await fetchConTimeout(
                `${this.#url(API_ENDPOINTS.VENTAS_REPORTE)}?${params}`,
                { method: 'GET', headers: getHeaders() }
            );
            return await handleResponse(response);
        } catch (error) {
            console.error('[VentaService] Error al obtener reporte:', error.message);
            throw error;
        }
    }

    // ── POST /api/ventas ───────────────────────────────────────
    async crear(venta) {
        const errores = venta.validar();
        if (errores.length > 0) {
            throw new Error(`Errores de validación: ${errores.join(', ')}`);
        }

        if (USE_MOCK) {
            await simulateNetworkDelay(500); // Simular operación más lenta
            const nueva = Venta.fromDTO({
                ...venta.toDTO(),
                id: Date.now(),
                estado: 'COMPLETADA',
                fecha: new Date().toISOString(),
            });
            ventasMock.unshift(nueva);
            return nueva;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.VENTAS), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(venta.toDTO()),
        });
        const data = await handleResponse(response);
        return Venta.fromDTO(data);
    }

    // ── PUT /api/ventas/{id} ───────────────────────────────────
    async actualizar(id, venta) {
        const errores = venta.validar();
        if (errores.length > 0) {
            throw new Error(`Errores de validación: ${errores.join(', ')}`);
        }

        if (USE_MOCK) {
            await simulateNetworkDelay();
            const idx = ventasMock.findIndex(v => v.id === parseInt(id));
            if (idx === -1) throw new Error(`Venta ${id} no encontrada`);
            const actualizada = Venta.fromDTO({ ...venta.toDTO(), id: parseInt(id) });
            ventasMock[idx] = actualizada;
            return actualizada;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.VENTA_BY_ID(id)), {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(venta.toDTO()),
        });
        const data = await handleResponse(response);
        return Venta.fromDTO(data);
    }

    // ── PUT /api/ventas/{id}/cancelar ──────────────────────────
    async cancelar(id, motivo) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            const idx = ventasMock.findIndex(v => v.id === parseInt(id));
            if (idx !== -1) {
                ventasMock[idx].estado = 'CANCELADA';
                ventasMock[idx].observaciones = motivo || '';
            }
            return ventasMock[idx] || null;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.VENTA_CANCELAR(id)), {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ motivo }),
        });
        const data = await handleResponse(response);
        return data ? Venta.fromDTO(data) : null;
    }

    // ── GET ventas del día (helper) ────────────────────────────
    async obtenerVentasHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        return this.obtenerPorFecha(`${hoy}T00:00:00`, `${hoy}T23:59:59`);
    }
}

// Exportar instancia única (Singleton)
export default new VentaService();
