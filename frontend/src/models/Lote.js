/**
 * Modelo de Lote (Batch)
 * Implementa lógica FEFO (First Expired, First Out)
 * Compatible con entidad JPA de Spring Boot
 */
export class Lote {
    constructor(
        id = null,
        productoId = null,
        numeroLote = '',
        fechaVencimiento = '',
        fechaIngreso = new Date().toISOString().split('T')[0],
        cantidadInicial = 0,
        cantidadDisponible = 0,
        precioCompra = 0,
        proveedor = '',
        ubicacionAnaquel = '',
        activo = true,
        fechaCreacion = new Date().toISOString(),
        fechaActualizacion = new Date().toISOString()
    ) {
        this.id = id;
        this.productoId = productoId;
        this.numeroLote = numeroLote;
        this.fechaVencimiento = fechaVencimiento;
        this.fechaIngreso = fechaIngreso;
        this.cantidadInicial = cantidadInicial;
        this.cantidadDisponible = cantidadDisponible;
        this.precioCompra = precioCompra;
        this.proveedor = proveedor;
        this.ubicacionAnaquel = ubicacionAnaquel;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }

    /**
     * Verifica si el lote está caducado
     */
    estaCaducado() {
        if (!this.fechaVencimiento) return false;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const vencimiento = new Date(this.fechaVencimiento);
        vencimiento.setHours(0, 0, 0, 0);
        return vencimiento < hoy;
    }

    /**
     * Verifica si el lote está próximo a caducar (30 días por defecto)
     */
    estaPorCaducar(diasUmbral = 30) {
        if (!this.fechaVencimiento) return false;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const vencimiento = new Date(this.fechaVencimiento);
        vencimiento.setHours(0, 0, 0, 0);
        const diferenciaDias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
        return diferenciaDias > 0 && diferenciaDias <= diasUmbral;
    }

    /**
     * Devuelve los días restantes hasta el vencimiento
     */
    diasParaVencimiento() {
        if (!this.fechaVencimiento) return Infinity;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const vencimiento = new Date(this.fechaVencimiento);
        vencimiento.setHours(0, 0, 0, 0);
        return Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    }

    /**
     * Obtiene el estado del semáforo del lote
     * ROJO: Caducado
     * AMARILLO: Próximo a caducar
     * VERDE: OK
     */
    getSemaforoEstado() {
        if (this.estaCaducado()) return 'ROJO';
        if (this.estaPorCaducar()) return 'AMARILLO';
        return 'VERDE';
    }

    /**
     * Verifica si tiene stock disponible
     */
    tieneStock() {
        return this.cantidadDisponible > 0;
    }

    /**
     * Validación del lote
     */
    validar() {
        const errores = [];
        if (!this.numeroLote || this.numeroLote.trim() === '') {
            errores.push('El número de lote es obligatorio');
        }
        if (!this.fechaVencimiento) {
            errores.push('La fecha de vencimiento es obligatoria');
        }
        if (this.cantidadInicial <= 0) {
            errores.push('La cantidad inicial debe ser mayor a 0');
        }
        if (this.cantidadDisponible < 0) {
            errores.push('La cantidad disponible no puede ser negativa');
        }
        if (this.precioCompra < 0) {
            errores.push('El precio de compra no puede ser negativo');
        }
        return errores;
    }

    toDTO() {
        return {
            id: this.id,
            productoId: this.productoId,
            numeroLote: this.numeroLote,
            fechaVencimiento: this.fechaVencimiento,
            fechaIngreso: this.fechaIngreso,
            cantidadInicial: parseInt(this.cantidadInicial),
            cantidadDisponible: parseInt(this.cantidadDisponible),
            precioCompra: parseFloat(this.precioCompra),
            proveedor: this.proveedor,
            ubicacionAnaquel: this.ubicacionAnaquel,
            activo: this.activo
        };
    }

    static fromDTO(dto) {
        return new Lote(
            dto.id, dto.productoId, dto.numeroLote, dto.fechaVencimiento,
            dto.fechaIngreso, dto.cantidadInicial, dto.cantidadDisponible,
            dto.precioCompra, dto.proveedor, dto.ubicacionAnaquel,
            dto.activo, dto.fechaCreacion, dto.fechaActualizacion
        );
    }
}

/**
 * Utilidad FEFO: Ordena lotes por fecha de vencimiento más próxima primero.
 * Filtra lotes caducados y sin stock.
 */
export function ordenarLotesFEFO(lotes) {
    return [...lotes]
        .filter(l => !l.estaCaducado() && l.tieneStock())
        .sort((a, b) => {
            const fechaA = new Date(a.fechaVencimiento);
            const fechaB = new Date(b.fechaVencimiento);
            return fechaA - fechaB;
        });
}

/**
 * Selecciona automáticamente el mejor lote para venta (FEFO)
 */
export function seleccionarLoteFEFO(lotes) {
    const lotesOrdenados = ordenarLotesFEFO(lotes);
    return lotesOrdenados.length > 0 ? lotesOrdenados[0] : null;
}

export default Lote;
