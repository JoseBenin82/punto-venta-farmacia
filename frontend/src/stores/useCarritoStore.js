/**
 * Store Zustand para el Carrito de Compras / POS
 * SRS RF-001 a RF-005: Terminal de venta completo
 *
 * Si zustand aún no está instalado, instálalo con:
 *   npm install zustand
 */
import { create } from 'zustand';
import { DetalleVenta, Venta } from '../models/Venta';
import { seleccionarLoteFEFO } from '../models/Lote';
import { verificarInteraccionConNuevo } from '../utils/interaccionesMedicamentosas';

/**
 * Store principal del POS
 */
const useCarritoStore = create((set, get) => ({
    // === Estado ===
    ventaActual: new Venta(),
    ventasEnEspera: [],        // RF-005: Park/Hold
    clienteSeleccionado: null,
    interaccionesActivas: [],  // RF-003: Alertas de farmacovigilancia
    retirosEfectivo: [],       // RF-005: Retiros de efectivo
    limiteEfectivoCaja: 5000,  // RF-005: Monto configurable para alerta de retiro
    efectivoAcumulado: 0,
    alertaRetiro: false,

    // === RF-001 / RF-002 / RF-003: Agregar producto al carrito ===
    agregarProducto: (producto, cantidad = 1, loteManual = null) => {
        const state = get();
        const venta = state.ventaActual;

        // RF-002: Seleccionar lote FEFO automáticamente (o manual)
        let loteSeleccionado = loteManual;
        if (!loteSeleccionado && producto.lotes && producto.lotes.length > 0) {
            loteSeleccionado = seleccionarLoteFEFO(producto.lotes);
        }

        // RF-003: Bloqueo de caducados
        if (loteSeleccionado && loteSeleccionado.estaCaducado && loteSeleccionado.estaCaducado()) {
            return {
                exito: false,
                error: 'LOTE_CADUCADO',
                mensaje: `El lote ${loteSeleccionado.numeroLote} está caducado. No se puede agregar al carrito.`
            };
        }

        // RF-003: Verificar stock del lote
        if (loteSeleccionado && loteSeleccionado.cantidadDisponible < cantidad) {
            return {
                exito: false,
                error: 'STOCK_INSUFICIENTE',
                mensaje: `Stock insuficiente en lote ${loteSeleccionado.numeroLote}. Disponible: ${loteSeleccionado.cantidadDisponible}`
            };
        }

        // RF-003: Interacciones medicamentosas
        const gruposEnCarrito = venta.detalles.map(d => d.grupoInteraccion || 'NINGUNO');
        const interacciones = verificarInteraccionConNuevo(
            producto.grupoInteraccion || 'NINGUNO',
            gruposEnCarrito
        );

        // Crear detalle de venta
        const detalle = new DetalleVenta(
            null,
            producto.id,
            producto.nombre,
            producto.sustanciaActiva,
            loteSeleccionado?.id || null,
            loteSeleccionado?.numeroLote || '',
            loteSeleccionado?.fechaVencimiento || '',
            cantidad,
            producto.precioVenta,
            0,
            0,
            producto.tipoRegulacion,
            null
        );
        // Guardar grupo de interacción en el detalle para futuras verificaciones
        detalle.grupoInteraccion = producto.grupoInteraccion;
        detalle.calcularSubtotal();

        // Actualizar la venta
        const nuevaVenta = Object.assign(new Venta(), venta);
        nuevaVenta.detalles = [...venta.detalles, detalle];
        nuevaVenta.calcularTotales();

        // Si requiere receta, el resultado indica que se necesita modal
        const requiereReceta = producto.requiereReceta();

        set({
            ventaActual: nuevaVenta,
            interaccionesActivas: interacciones.length > 0
                ? [...state.interaccionesActivas, ...interacciones]
                : state.interaccionesActivas
        });

        return {
            exito: true,
            requiereReceta,
            tipoRegulacion: producto.tipoRegulacion,
            interacciones,
            loteSeleccionado,
            indiceLinea: nuevaVenta.detalles.length - 1
        };
    },

    // Eliminar producto del carrito
    eliminarProducto: (index) => {
        const state = get();
        const nuevaVenta = Object.assign(new Venta(), state.ventaActual);
        nuevaVenta.detalles = [...state.ventaActual.detalles];
        nuevaVenta.detalles.splice(index, 1);
        nuevaVenta.calcularTotales();
        set({ ventaActual: nuevaVenta });
    },

    // Actualizar cantidad
    actualizarCantidad: (index, cantidad) => {
        const state = get();
        const nuevaVenta = Object.assign(new Venta(), state.ventaActual);
        nuevaVenta.detalles = state.ventaActual.detalles.map((d, i) => {
            if (i === index) {
                const detalleCopia = Object.assign(new DetalleVenta(), d);
                detalleCopia.cantidad = parseInt(cantidad);
                detalleCopia.calcularSubtotal();
                return detalleCopia;
            }
            return d;
        });
        nuevaVenta.calcularTotales();
        set({ ventaActual: nuevaVenta });
    },

    // RF-004: Asignar receta a un detalle
    asignarReceta: (index, recetaMedica) => {
        const state = get();
        const nuevaVenta = Object.assign(new Venta(), state.ventaActual);
        nuevaVenta.detalles = state.ventaActual.detalles.map((d, i) => {
            if (i === index) {
                const detalleCopia = Object.assign(new DetalleVenta(), d);
                detalleCopia.recetaMedica = recetaMedica;
                return detalleCopia;
            }
            return d;
        });
        set({ ventaActual: nuevaVenta });
    },

    // Seleccionar cliente
    seleccionarCliente: (cliente) => {
        const state = get();
        const nuevaVenta = Object.assign(new Venta(), state.ventaActual);
        nuevaVenta.clienteId = cliente?.id || null;
        nuevaVenta.clienteNombre = cliente ? cliente.getNombreCompleto() : '';
        if (cliente && cliente.descuento > 0) {
            nuevaVenta.descuentoTotal = cliente.descuento;
        }
        nuevaVenta.calcularTotales();
        set({ ventaActual: nuevaVenta, clienteSeleccionado: cliente });
    },

    // Cambiar método de pago
    cambiarMetodoPago: (metodo) => {
        const state = get();
        const nuevaVenta = Object.assign(new Venta(), state.ventaActual);
        nuevaVenta.metodoPago = metodo;
        set({ ventaActual: nuevaVenta });
    },

    // Establecer monto pagado (efectivo)
    setMontoPagado: (monto) => {
        const state = get();
        const nuevaVenta = Object.assign(new Venta(), state.ventaActual);
        nuevaVenta.montoPagado = parseFloat(monto);
        nuevaVenta.calcularCambio();
        set({ ventaActual: nuevaVenta });
    },

    // === RF-005: Hold / Park Sale ===
    ponerEnEspera: (nombre) => {
        const state = get();
        const ventaEnEspera = Object.assign(new Venta(), state.ventaActual);
        ventaEnEspera.ponerEnEspera(nombre);

        set({
            ventasEnEspera: [...state.ventasEnEspera, ventaEnEspera],
            ventaActual: new Venta(),
            clienteSeleccionado: null,
            interaccionesActivas: []
        });
    },

    recuperarDeEspera: (index) => {
        const state = get();
        if (index < 0 || index >= state.ventasEnEspera.length) return;

        const ventaRecuperada = state.ventasEnEspera[index];
        ventaRecuperada.recuperarDeEspera();

        const nuevasEnEspera = [...state.ventasEnEspera];
        nuevasEnEspera.splice(index, 1);

        // Si hay venta actual con productos, ponerla en espera
        if (state.ventaActual.detalles.length > 0) {
            const ventaActualEnEspera = Object.assign(new Venta(), state.ventaActual);
            ventaActualEnEspera.ponerEnEspera('Auto-espera');
            nuevasEnEspera.push(ventaActualEnEspera);
        }

        set({
            ventaActual: ventaRecuperada,
            ventasEnEspera: nuevasEnEspera,
            interaccionesActivas: []
        });
    },

    // === Completar venta ===
    completarVenta: async () => {
        const state = get();
        const venta = state.ventaActual;
        venta.estado = 'COMPLETADA';
        venta.fecha = new Date().toISOString();

        try {
            // Import dinámico para evitar dependencias circulares si las hubiera
            const VentaService = (await import('../services/VentaService')).default;
            const ventaGuardada = await VentaService.crear(venta);

            // Acumular efectivo si pago en efectivo
            let nuevoEfectivo = state.efectivoAcumulado;
            if (venta.metodoPago === 'EFECTIVO') {
                nuevoEfectivo += venta.total;
            }

            // RF-005: Alerta de retiro si supera límite
            const alertaRetiro = nuevoEfectivo >= state.limiteEfectivoCaja;

            set({
                ventaActual: new Venta(),
                clienteSeleccionado: null,
                interaccionesActivas: [],
                efectivoAcumulado: nuevoEfectivo,
                alertaRetiro
            });

            return ventaGuardada;
        } catch (error) {
            console.error("Error al completar venta:", error);
            throw error;
        }
    },

    // Cancelar venta
    cancelarVenta: () => {
        set({
            ventaActual: new Venta(),
            clienteSeleccionado: null,
            interaccionesActivas: []
        });
    },

    // RF-005: Retiro de efectivo
    registrarRetiro: (retiro) => {
        const state = get();
        set({
            retirosEfectivo: [...state.retirosEfectivo, retiro],
            efectivoAcumulado: state.efectivoAcumulado - retiro.monto,
            alertaRetiro: false
        });
    },

    // Limpiar alertas de interacciones
    limpiarInteracciones: () => set({ interaccionesActivas: [] }),

    // Dismiss alerta retiro
    dismissAlertaRetiro: () => set({ alertaRetiro: false })
}));

export default useCarritoStore;
