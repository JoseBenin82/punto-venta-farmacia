/**
 * Modelo de Movimiento de Inventario
 * Compatible con entidad JPA de Spring Boot
 */
export class MovimientoInventario {
    constructor(
        id = null,
        productoId = null,
        productoNombre = '',
        tipoMovimiento = 'ENTRADA', // ENTRADA, SALIDA, AJUSTE
        cantidad = 0,
        stockAnterior = 0,
        stockNuevo = 0,
        motivo = '',
        referencia = '', // Número de factura, orden de compra, etc.
        usuarioId = null,
        usuarioNombre = '',
        fecha = new Date().toISOString(),
        observaciones = '',
        fechaCreacion = new Date().toISOString()
    ) {
        this.id = id;
        this.productoId = productoId;
        this.productoNombre = productoNombre;
        this.tipoMovimiento = tipoMovimiento;
        this.cantidad = cantidad;
        this.stockAnterior = stockAnterior;
        this.stockNuevo = stockNuevo;
        this.motivo = motivo;
        this.referencia = referencia;
        this.usuarioId = usuarioId;
        this.usuarioNombre = usuarioNombre;
        this.fecha = fecha;
        this.observaciones = observaciones;
        this.fechaCreacion = fechaCreacion;
    }

    // Calcular nuevo stock
    calcularStockNuevo() {
        if (this.tipoMovimiento === 'ENTRADA') {
            this.stockNuevo = this.stockAnterior + this.cantidad;
        } else if (this.tipoMovimiento === 'SALIDA') {
            this.stockNuevo = this.stockAnterior - this.cantidad;
        } else if (this.tipoMovimiento === 'AJUSTE') {
            this.stockNuevo = this.cantidad; // En ajuste, la cantidad es el nuevo stock
        }
        return this.stockNuevo;
    }

    // Validación del movimiento
    validar() {
        const errores = [];

        if (!this.productoId) {
            errores.push('Debe seleccionar un producto');
        }

        if (this.cantidad <= 0 && this.tipoMovimiento !== 'AJUSTE') {
            errores.push('La cantidad debe ser mayor a 0');
        }

        if (this.tipoMovimiento === 'SALIDA' && this.cantidad > this.stockAnterior) {
            errores.push('No hay suficiente stock disponible');
        }

        if (!this.motivo || this.motivo.trim() === '') {
            errores.push('El motivo es obligatorio');
        }

        return errores;
    }

    // Convertir a DTO para enviar al backend
    toDTO() {
        return {
            id: this.id,
            productoId: this.productoId,
            tipoMovimiento: this.tipoMovimiento,
            cantidad: parseInt(this.cantidad),
            stockAnterior: parseInt(this.stockAnterior),
            stockNuevo: parseInt(this.stockNuevo),
            motivo: this.motivo,
            referencia: this.referencia,
            usuarioId: this.usuarioId,
            fecha: this.fecha,
            observaciones: this.observaciones
        };
    }

    // Crear desde DTO del backend
    static fromDTO(dto) {
        return new MovimientoInventario(
            dto.id,
            dto.productoId,
            dto.productoNombre,
            dto.tipoMovimiento,
            dto.cantidad,
            dto.stockAnterior,
            dto.stockNuevo,
            dto.motivo,
            dto.referencia,
            dto.usuarioId,
            dto.usuarioNombre,
            dto.fecha,
            dto.observaciones,
            dto.fechaCreacion
        );
    }
}

export default MovimientoInventario;
