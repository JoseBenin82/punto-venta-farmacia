import { API_BASE_URL, API_ENDPOINTS, getHeaders, handleResponse, fetchConTimeout, USE_MOCK } from './apiConfig';
import Factura from '../models/Factura';
import { simulateNetworkDelay } from './mockData';

/**
 * Servicio para gestión de Facturas / CFDI
 * SRS RF-009: Facturación desde ticket de venta
 * Preparado para conectarse con Spring Boot REST API
 *
 * Endpoints consumidos:
 *   GET    /api/facturas                    → obtenerTodas()
 *   GET    /api/facturas/{id}               → obtenerPorId(id)
 *   GET    /api/facturas/venta/{ventaId}    → obtenerPorVenta(ventaId)
 *   POST   /api/facturas                    → crear(factura)
 *   PUT    /api/facturas/{id}/timbrar       → timbrar(id)
 *   PUT    /api/facturas/{id}/cancelar      → cancelar(id, motivo)
 */

// Almacenamiento temporal para modo MOCK
let facturasMock = [];

class FacturaService {

    #url(endpoint) {
        return `${API_BASE_URL}${endpoint}`;
    }

    #mapArray(data) {
        return (data || []).map(dto => Factura.fromDTO(dto));
    }

    // ── GET /api/facturas ─────────────────────────────────────
    async obtenerTodas() {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return [...facturasMock];
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.FACTURAS), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            console.error('[FacturaService] Error al obtener facturas:', error.message);
            throw error;
        }
    }

    // ── GET /api/facturas/{id} ────────────────────────────────
    async obtenerPorId(id) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return facturasMock.find(f => f.id === parseInt(id)) || null;
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.FACTURA_BY_ID(id)), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return data ? Factura.fromDTO(data) : null;
        } catch (error) {
            console.error(`[FacturaService] Error al obtener factura ${id}:`, error.message);
            throw error;
        }
    }

    // ── GET /api/facturas/venta/{ventaId} ─────────────────────
    async obtenerPorVenta(ventaId) {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return facturasMock.filter(f => f.ventaId === parseInt(ventaId));
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.FACTURA_BY_VENTA(ventaId)), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return this.#mapArray(data);
        } catch (error) {
            if (error.status === 404) return [];
            console.error(`[FacturaService] Error al obtener facturas de venta ${ventaId}:`, error.message);
            throw error;
        }
    }

    // ── POST /api/facturas (solicitar factura) ─────────────────
    async crear(factura) {
        const errores = factura.validar();
        if (errores.length > 0) {
            throw new Error(`Errores de validación: ${errores.join(', ')}`);
        }

        if (USE_MOCK) {
            await simulateNetworkDelay(1000); // Simular proceso de timbrado
            const nueva = Factura.fromDTO({
                ...factura.toDTO(),
                id: Date.now(),
                folio: `A-${String(facturasMock.length + 1).padStart(5, '0')}`,
                uuid: `MOCK-${Date.now()}`,
                estado: 'TIMBRADA',   // En mock se timbra inmediatamente
                fechaTimbrado: new Date().toISOString(),
                urlPDF: `/mock/factura-${Date.now()}.pdf`,
                urlXML: `/mock/factura-${Date.now()}.xml`,
                fechaCreacion: new Date().toISOString(),
            });
            facturasMock.unshift(nueva);
            return nueva;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.FACTURAS), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(factura.toDTO()),
        });
        const data = await handleResponse(response);
        return Factura.fromDTO(data);
    }

    // ── PUT /api/facturas/{id}/timbrar ─────────────────────────
    async timbrar(id) {
        if (USE_MOCK) {
            await simulateNetworkDelay(2000); // Simular latencia de SAT
            const idx = facturasMock.findIndex(f => f.id === parseInt(id));
            if (idx !== -1) {
                facturasMock[idx].estado = 'TIMBRADA';
                facturasMock[idx].fechaTimbrado = new Date().toISOString();
                facturasMock[idx].uuid = `SAT-MOCK-${Date.now()}`;
            }
            return facturasMock[idx] || null;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.FACTURA_TIMBRAR(id)), {
            method: 'PUT',
            headers: getHeaders(),
        });
        const data = await handleResponse(response);
        return data ? Factura.fromDTO(data) : null;
    }

    // ── PUT /api/facturas/{id}/cancelar ────────────────────────
    async cancelar(id, motivo) {
        if (!motivo || motivo.trim() === '') {
            throw new Error('El motivo de cancelación es obligatorio');
        }

        if (USE_MOCK) {
            await simulateNetworkDelay(1000);
            const idx = facturasMock.findIndex(f => f.id === parseInt(id));
            if (idx !== -1) {
                facturasMock[idx].estado = 'CANCELADA';
            }
            return facturasMock[idx] || null;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.FACTURA_CANCELAR(id)), {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ motivo }),
        });
        const data = await handleResponse(response);
        return data ? Factura.fromDTO(data) : null;
    }
}

// Exportar instancia única (Singleton)
export default new FacturaService();
