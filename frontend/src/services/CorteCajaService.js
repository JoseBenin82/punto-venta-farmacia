import { API_BASE_URL, API_ENDPOINTS, getHeaders, handleResponse, fetchConTimeout, USE_MOCK } from './apiConfig';
import { CorteCaja, RetiroEfectivo } from '../models/CorteCaja';
import { simulateNetworkDelay } from './mockData';

/**
 * Servicio para gestión de Corte de Caja
 * Preparado para conectarse con Spring Boot REST API
 *
 * Endpoints consumidos:
 *   GET    /api/corte-caja/actual      → obtenerActual()
 *   POST   /api/corte-caja/cerrar      → cerrar(corte)
 *   POST   /api/corte-caja/retiro      → registrarRetiro(retiro)
 *   GET    /api/corte-caja/historial   → obtenerHistorial()
 */

// Mock en memoria para Corte de Caja
let corteMockActual = null;
let historialMock = [];

class CorteCajaService {

    #url(endpoint) {
        return `${API_BASE_URL}${endpoint}`;
    }

    // ── GET /api/corte-caja/actual ────────────────────────────
    async obtenerActual() {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            if (!corteMockActual) {
                // Usamos el constructor correcto: CorteCaja(id, numeroCaja, cajeroId, cajeroNombre, ...)
                corteMockActual = new CorteCaja(
                    Date.now(),  // id
                    1,           // numeroCaja
                    null,        // cajeroId
                    'Cajero Demo', // cajeroNombre
                    null,        // supervisorId
                    '',          // supervisorNombre
                    new Date().toISOString(), // fechaApertura
                    null,        // fechaCierre
                    0, 0, 0, 0, 0, 0, // ventas/totales/retiros
                    1000,        // fondoInicial
                    0, 0, 0,     // efectivoDeclarado, esperado, diferencia
                    'ABIERTO'
                );
            }
            return corteMockActual;
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.CORTE_CAJA_ACTUAL), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return data ? CorteCaja.fromDTO(data) : null;
        } catch (error) {
            console.error('[CorteCajaService] Error al obtener corte actual:', error.message);
            // Si no hay backend, retornar un corte vacío para no bloquear la UI
            return null;
        }
    }

    // ── POST /api/corte-caja/cerrar ───────────────────────────
    async cerrar(corte) {
        if (USE_MOCK) {
            await simulateNetworkDelay(800);
            const corteCerrado = CorteCaja.fromDTO({
                ...corte.toDTO(),
                estado: 'CERRADO',
                fechaCierre: new Date().toISOString(),
            });
            historialMock.unshift(corteCerrado);
            corteMockActual = null;
            return corteCerrado;
        }

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.CORTE_CAJA_CERRAR), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(corte.toDTO ? corte.toDTO() : corte),
        });
        const data = await handleResponse(response);
        return data ? CorteCaja.fromDTO(data) : null;
    }

    // ── POST /api/corte-caja/retiro ───────────────────────────
    async registrarRetiro(retiro) {
        if (!retiro || retiro.monto <= 0) {
            throw new Error('El monto del retiro debe ser mayor a cero');
        }
        if (!retiro.motivo) {
            throw new Error('El motivo del retiro es obligatorio');
        }

        if (USE_MOCK) {
            await simulateNetworkDelay();
            const nuevoRetiro = retiro instanceof RetiroEfectivo
                ? retiro
                : new RetiroEfectivo(
                    Date.now(),
                    retiro.monto,
                    retiro.motivo,
                    retiro.autorizadoPor || 'Sistema',
                    new Date().toISOString()
                );

            // Si hay un corte mock activo, agregar el retiro
            if (corteMockActual) {
                corteMockActual.retiros = [...(corteMockActual.retiros || []), nuevoRetiro];
                corteMockActual.totalRetiros = (corteMockActual.totalRetiros || 0) + retiro.monto;
            }
            return nuevoRetiro;
        }

        const body = retiro instanceof RetiroEfectivo
            ? { monto: retiro.monto, motivo: retiro.motivo, autorizadoPor: retiro.autorizadoPor }
            : retiro;

        const response = await fetchConTimeout(this.#url(API_ENDPOINTS.CORTE_CAJA_RETIRO), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        const data = await handleResponse(response);
        return data;
    }

    // ── GET /api/corte-caja/historial ─────────────────────────
    async obtenerHistorial() {
        if (USE_MOCK) {
            await simulateNetworkDelay();
            return [...historialMock];
        }
        try {
            const response = await fetchConTimeout(this.#url(API_ENDPOINTS.CORTE_CAJA_HISTORIAL), {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await handleResponse(response);
            return (data || []).map(dto => CorteCaja.fromDTO(dto));
        } catch (error) {
            console.error('[CorteCajaService] Error al obtener historial:', error.message);
            throw error;
        }
    }
}

// Exportar instancia única (Singleton)
export default new CorteCajaService();
