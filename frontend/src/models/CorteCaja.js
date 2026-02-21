/**
 * Modelo de Corte de Caja / Cierre de Turno
 * SRS RF-010: Corte Z con Pantalla Ciega (Blind Count)
 */

export class CorteCaja {
    constructor(
        id = null,
        numeroCaja = 1,
        cajeroId = null,
        cajeroNombre = '',
        supervisorId = null,
        supervisorNombre = '',
        fechaApertura = new Date().toISOString(),
        fechaCierre = null,
        // Montos registrados por el sistema
        ventasEfectivo = 0,
        ventasTarjeta = 0,
        ventasTransferencia = 0,
        totalVentas = 0,
        totalDevoluciones = 0,
        retirosEfectivo = 0,
        fondoInicial = 0,
        // Montos declarados por el cajero (Blind Count)
        efectivoDeclarado = 0,
        // Calculados
        efectivoEsperado = 0,
        diferencia = 0,
        estado = 'ABIERTO', // ABIERTO, CERRADO
        observaciones = '',
        // Desglose de denominaciones del conteo ciego
        desgloseDenominaciones = null,
        cantidadVentas = 0,
        cantidadCancelaciones = 0,
        fechaCreacion = new Date().toISOString()
    ) {
        this.id = id;
        this.numeroCaja = numeroCaja;
        this.cajeroId = cajeroId;
        this.cajeroNombre = cajeroNombre;
        this.supervisorId = supervisorId;
        this.supervisorNombre = supervisorNombre;
        this.fechaApertura = fechaApertura;
        this.fechaCierre = fechaCierre;
        this.ventasEfectivo = ventasEfectivo;
        this.ventasTarjeta = ventasTarjeta;
        this.ventasTransferencia = ventasTransferencia;
        this.totalVentas = totalVentas;
        this.totalDevoluciones = totalDevoluciones;
        this.retirosEfectivo = retirosEfectivo;
        this.fondoInicial = fondoInicial;
        this.efectivoDeclarado = efectivoDeclarado;
        this.efectivoEsperado = efectivoEsperado;
        this.diferencia = diferencia;
        this.estado = estado;
        this.observaciones = observaciones;
        this.desgloseDenominaciones = desgloseDenominaciones || this.crearDesgloseVacio();
        this.cantidadVentas = cantidadVentas;
        this.cantidadCancelaciones = cantidadCancelaciones;
        this.fechaCreacion = fechaCreacion;
    }

    /** Crea la estructura de desglose de denominaciones MXN */
    crearDesgloseVacio() {
        return {
            billetes: { 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0 },
            monedas: { 20: 0, 10: 0, 5: 0, 2: 0, 1: 0, 0.5: 0 }
        };
    }

    /** Calcula el total del conteo ciego a partir del desglose */
    calcularEfectivoDeclarado() {
        let total = 0;
        if (this.desgloseDenominaciones) {
            for (const [denominacion, cantidad] of Object.entries(this.desgloseDenominaciones.billetes)) {
                total += parseFloat(denominacion) * cantidad;
            }
            for (const [denominacion, cantidad] of Object.entries(this.desgloseDenominaciones.monedas)) {
                total += parseFloat(denominacion) * cantidad;
            }
        }
        this.efectivoDeclarado = total;
        return total;
    }

    /** Calcula el efectivo esperado en caja */
    calcularEfectivoEsperado() {
        this.efectivoEsperado = this.fondoInicial + this.ventasEfectivo - this.retirosEfectivo - this.totalDevoluciones;
        return this.efectivoEsperado;
    }

    /** Calcula la diferencia entre declarado y esperado */
    calcularDiferencia() {
        this.calcularEfectivoEsperado();
        this.calcularEfectivoDeclarado();
        this.diferencia = this.efectivoDeclarado - this.efectivoEsperado;
        return this.diferencia;
    }

    /** Obtiene el estado de la diferencia */
    getEstadoDiferencia() {
        if (this.diferencia === 0) return 'CUADRADO';
        if (this.diferencia > 0) return 'SOBRANTE';
        return 'FALTANTE';
    }

    /** Cierra el corte */
    cerrar() {
        this.fechaCierre = new Date().toISOString();
        this.estado = 'CERRADO';
        this.calcularDiferencia();
    }

    validar() {
        const errores = [];
        if (this.efectivoDeclarado < 0) errores.push('El efectivo declarado no puede ser negativo');
        if (this.fondoInicial < 0) errores.push('El fondo inicial no puede ser negativo');
        return errores;
    }

    toDTO() {
        return {
            id: this.id,
            numeroCaja: this.numeroCaja,
            cajeroId: this.cajeroId,
            supervisorId: this.supervisorId,
            fechaApertura: this.fechaApertura,
            fechaCierre: this.fechaCierre,
            ventasEfectivo: this.ventasEfectivo,
            ventasTarjeta: this.ventasTarjeta,
            ventasTransferencia: this.ventasTransferencia,
            totalVentas: this.totalVentas,
            totalDevoluciones: this.totalDevoluciones,
            retirosEfectivo: this.retirosEfectivo,
            fondoInicial: this.fondoInicial,
            efectivoDeclarado: this.efectivoDeclarado,
            efectivoEsperado: this.efectivoEsperado,
            diferencia: this.diferencia,
            estado: this.estado,
            observaciones: this.observaciones,
            desgloseDenominaciones: this.desgloseDenominaciones,
            cantidadVentas: this.cantidadVentas,
            cantidadCancelaciones: this.cantidadCancelaciones
        };
    }

    static fromDTO(dto) {
        return new CorteCaja(
            dto.id, dto.numeroCaja, dto.cajeroId, dto.cajeroNombre,
            dto.supervisorId, dto.supervisorNombre,
            dto.fechaApertura, dto.fechaCierre,
            dto.ventasEfectivo, dto.ventasTarjeta, dto.ventasTransferencia,
            dto.totalVentas, dto.totalDevoluciones, dto.retirosEfectivo,
            dto.fondoInicial, dto.efectivoDeclarado, dto.efectivoEsperado,
            dto.diferencia, dto.estado, dto.observaciones,
            dto.desgloseDenominaciones, dto.cantidadVentas,
            dto.cantidadCancelaciones, dto.fechaCreacion
        );
    }
}

/**
 * Modelo de Retiro de Efectivo
 * SRS RF-005: Alerta y modal para retiros de efectivo
 */
export class RetiroEfectivo {
    constructor(
        id = null,
        corteCajaId = null,
        monto = 0,
        motivo = '',
        autorizadoPor = '',
        pinSupervisor = '',
        fecha = new Date().toISOString(),
        observaciones = ''
    ) {
        this.id = id;
        this.corteCajaId = corteCajaId;
        this.monto = monto;
        this.motivo = motivo;
        this.autorizadoPor = autorizadoPor;
        this.pinSupervisor = pinSupervisor;
        this.fecha = fecha;
        this.observaciones = observaciones;
    }

    validar() {
        const errores = [];
        if (this.monto <= 0) errores.push('El monto del retiro debe ser mayor a $0');
        if (!this.motivo || this.motivo.trim() === '') errores.push('El motivo es obligatorio');
        if (!this.autorizadoPor || this.autorizadoPor.trim() === '') errores.push('Se requiere autorización de un supervisor');
        return errores;
    }

    toDTO() {
        return {
            id: this.id, corteCajaId: this.corteCajaId,
            monto: parseFloat(this.monto), motivo: this.motivo,
            autorizadoPor: this.autorizadoPor, fecha: this.fecha,
            observaciones: this.observaciones
        };
    }
}

export default CorteCaja;
