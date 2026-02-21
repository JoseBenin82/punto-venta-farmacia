/**
 * Modelo de Venta / DetalleVenta
 * SRS RF-001 a RF-005: POS completo con FEFO, recetas, hold/park
 */

export class DetalleVenta {
    constructor(
        id = null,
        productoId = null,
        productoNombre = '',
        sustanciaActiva = '',
        loteId = null,
        numeroLote = '',
        fechaVencimientoLote = '',
        cantidad = 1,
        precioUnitario = 0,
        descuento = 0,
        subtotal = 0,
        tipoRegulacion = 'VENTA_LIBRE',
        recetaMedica = null
    ) {
        this.id = id;
        this.productoId = productoId;
        this.productoNombre = productoNombre;
        this.sustanciaActiva = sustanciaActiva;
        this.loteId = loteId;
        this.numeroLote = numeroLote;
        this.fechaVencimientoLote = fechaVencimientoLote;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.descuento = descuento;
        this.subtotal = subtotal;
        this.tipoRegulacion = tipoRegulacion;
        this.recetaMedica = recetaMedica; // RF-004
    }

    /** RF-004: ¿Esta línea requiere receta? */
    requiereReceta() {
        return ['ANTIBIOTICO', 'CONTROLADO_II', 'CONTROLADO_III', 'CONTROLADO_IV'].includes(this.tipoRegulacion);
    }

    /** RF-004: ¿La receta está completa? */
    tieneRecetaCompleta() {
        if (!this.requiereReceta()) return true;
        return this.recetaMedica && this.recetaMedica.esValida && this.recetaMedica.esValida();
    }

    calcularSubtotal() {
        const subtotalSinDescuento = this.cantidad * this.precioUnitario;
        this.subtotal = subtotalSinDescuento - (subtotalSinDescuento * this.descuento / 100);
        return this.subtotal;
    }

    toDTO() {
        return {
            id: this.id, productoId: this.productoId, loteId: this.loteId,
            cantidad: parseInt(this.cantidad),
            precioUnitario: parseFloat(this.precioUnitario),
            descuento: parseFloat(this.descuento),
            subtotal: parseFloat(this.subtotal),
            tipoRegulacion: this.tipoRegulacion,
            recetaMedica: this.recetaMedica ? this.recetaMedica.toDTO() : null
        };
    }
}

export class Venta {
    constructor(
        id = null,
        clienteId = null,
        clienteNombre = '',
        fecha = new Date().toISOString(),
        detalles = [],
        subtotal = 0,
        descuentoTotal = 0,
        impuesto = 0,
        total = 0,
        metodoPago = 'EFECTIVO',
        montoPagado = 0,
        cambio = 0,
        estado = 'EN_PROCESO', // EN_PROCESO, EN_ESPERA, COMPLETADA, CANCELADA
        observaciones = '',
        usuarioId = null,
        usuarioNombre = '',
        // RF-005: Hold / Park
        enEspera = false,
        nombreEspera = '',
        fechaEspera = null,
        // RF-009: Facturación
        facturaId = null,
        facturada = false,
        fechaCreacion = new Date().toISOString(),
        fechaActualizacion = new Date().toISOString()
    ) {
        this.id = id;
        this.clienteId = clienteId;
        this.clienteNombre = clienteNombre;
        this.fecha = fecha;
        this.detalles = detalles;
        this.subtotal = subtotal;
        this.descuentoTotal = descuentoTotal;
        this.impuesto = impuesto;
        this.total = total;
        this.metodoPago = metodoPago;
        this.montoPagado = montoPagado;
        this.cambio = cambio;
        this.estado = estado;
        this.observaciones = observaciones;
        this.usuarioId = usuarioId;
        this.usuarioNombre = usuarioNombre;
        this.enEspera = enEspera;
        this.nombreEspera = nombreEspera;
        this.fechaEspera = fechaEspera;
        this.facturaId = facturaId;
        this.facturada = facturada;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }

    agregarDetalle(detalle) {
        this.detalles.push(detalle);
        this.calcularTotales();
    }

    eliminarDetalle(index) {
        this.detalles.splice(index, 1);
        this.calcularTotales();
    }

    actualizarCantidadDetalle(index, nuevaCantidad) {
        if (this.detalles[index]) {
            this.detalles[index].cantidad = parseInt(nuevaCantidad);
            this.detalles[index].calcularSubtotal();
            this.calcularTotales();
        }
    }

    calcularTotales() {
        this.subtotal = this.detalles.reduce((sum, d) => {
            d.calcularSubtotal();
            return sum + d.subtotal;
        }, 0);
        this.impuesto = this.subtotal * 0.16;
        this.total = this.subtotal + this.impuesto;
        if (this.descuentoTotal > 0) {
            this.total -= this.subtotal * (this.descuentoTotal / 100);
        }
        return this.total;
    }

    calcularCambio() {
        this.cambio = Math.max(0, this.montoPagado - this.total);
        return this.cambio;
    }

    /** RF-005: Poner venta en espera */
    ponerEnEspera(nombre = '') {
        this.enEspera = true;
        this.estado = 'EN_ESPERA';
        this.nombreEspera = nombre || `Espera #${Date.now()}`;
        this.fechaEspera = new Date().toISOString();
    }

    /** RF-005: Recuperar venta de espera */
    recuperarDeEspera() {
        this.enEspera = false;
        this.estado = 'EN_PROCESO';
        this.fechaEspera = null;
    }

    /** RF-004: Verifica que todas las líneas de controlados tengan receta */
    todasRecetasCompletas() {
        return this.detalles.every(d => d.tieneRecetaCompleta());
    }

    /** Obtiene las líneas que requieren receta y no la tienen */
    getLineasSinReceta() {
        return this.detalles.filter(d => d.requiereReceta() && !d.tieneRecetaCompleta());
    }

    validar() {
        const errores = [];
        if (this.detalles.length === 0) errores.push('Debe agregar al menos un producto');
        if (this.total <= 0) errores.push('El total debe ser mayor a $0');
        // Validar recetas
        const sinReceta = this.getLineasSinReceta();
        if (sinReceta.length > 0) {
            sinReceta.forEach(d => errores.push(`${d.productoNombre} requiere receta médica`));
        }
        this.detalles.forEach((d, i) => {
            if (d.cantidad <= 0) errores.push(`Cantidad inválida en línea ${i + 1}`);
        });
        // Solo validar monto pagado si ya se estableció (> 0, durante cobro)
        if (this.metodoPago === 'EFECTIVO' && this.montoPagado > 0 && this.montoPagado < this.total) {
            errores.push('El monto pagado es insuficiente');
        }
        return errores;
    }

    toDTO() {
        return {
            id: this.id, clienteId: this.clienteId, fecha: this.fecha,
            detalles: this.detalles.map(d => d.toDTO()),
            subtotal: parseFloat(this.subtotal), descuentoTotal: parseFloat(this.descuentoTotal),
            impuesto: parseFloat(this.impuesto), total: parseFloat(this.total),
            metodoPago: this.metodoPago, montoPagado: parseFloat(this.montoPagado),
            cambio: parseFloat(this.cambio), estado: this.estado,
            observaciones: this.observaciones, usuarioId: this.usuarioId
        };
    }

    static fromDTO(dto) {
        const detalles = dto.detalles ? dto.detalles.map(d =>
            new DetalleVenta(
                d.id, d.productoId, d.productoNombre, d.sustanciaActiva,
                d.loteId, d.numeroLote, d.fechaVencimientoLote,
                d.cantidad, d.precioUnitario, d.descuento, d.subtotal,
                d.tipoRegulacion, d.recetaMedica
            )
        ) : [];
        return new Venta(
            dto.id, dto.clienteId, dto.clienteNombre, dto.fecha, detalles,
            dto.subtotal, dto.descuentoTotal, dto.impuesto, dto.total,
            dto.metodoPago, dto.montoPagado, dto.cambio, dto.estado,
            dto.observaciones, dto.usuarioId, dto.usuarioNombre,
            dto.enEspera, dto.nombreEspera, dto.fechaEspera,
            dto.facturaId, dto.facturada, dto.fechaCreacion, dto.fechaActualizacion
        );
    }
}

export default Venta;
