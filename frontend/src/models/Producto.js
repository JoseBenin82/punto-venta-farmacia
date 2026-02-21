/**
 * Modelo de Producto / Medicamento
 * SRS RF-007: Validación estricta de campos farmacéuticos
 * Compatible con entidad JPA de Spring Boot
 */

// Tipos de regulación para medicamentos
export const TIPO_REGULACION = {
    VENTA_LIBRE: 'VENTA_LIBRE',
    ANTIBIOTICO: 'ANTIBIOTICO',
    CONTROLADO_II: 'CONTROLADO_II',
    CONTROLADO_III: 'CONTROLADO_III',
    CONTROLADO_IV: 'CONTROLADO_IV'
};

// Categorías de productos farmacéuticos
export const CATEGORIAS_FARMACIA = [
    'Analgésicos',
    'Antibióticos',
    'Antiinflamatorios',
    'Antihipertensivos',
    'Cardiovasculares',
    'Dermatológicos',
    'Digestivos',
    'Respiratorios',
    'Vitaminas y Suplementos',
    'Material de Curación',
    'Higiene Personal',
    'Controlados',
    'Otros'
];

// Grupos de interacción medicamentosa (RF-003)
export const GRUPO_INTERACCION = {
    ANTICOAGULANTES: 'ANTICOAGULANTES',
    AINES: 'AINES',
    ANTIBIOTICOS: 'ANTIBIOTICOS',
    ANTIDEPRESIVOS: 'ANTIDEPRESIVOS',
    ANTIHIPERTENSIVOS: 'ANTIHIPERTENSIVOS',
    OPIOIDES: 'OPIOIDES',
    BENZODIACEPINAS: 'BENZODIACEPINAS',
    ALCOHOL_INTERACCION: 'ALCOHOL_INTERACCION',
    NINGUNO: 'NINGUNO'
};

export class Producto {
    constructor(
        id = null,
        nombre = '',
        descripcion = '',
        categoria = '',
        precioVenta = 0,
        precioCompra = 0,
        porcentajeIVA = 16,
        porcentajeIEPS = 0,
        stockTotal = 0,
        stockMinimo = 10,
        stockOptimo = 50,
        codigoBarras = '',
        sku = '',
        laboratorio = '',
        sustanciaActiva = '',
        presentacion = '',
        tipoRegulacion = TIPO_REGULACION.VENTA_LIBRE,
        grupoInteraccion = GRUPO_INTERACCION.NINGUNO,
        ubicacionAnaquel = '',
        activo = true,
        fechaCreacion = new Date().toISOString(),
        fechaActualizacion = new Date().toISOString()
    ) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.precioVenta = precioVenta;
        this.precioCompra = precioCompra;
        this.porcentajeIVA = porcentajeIVA;
        this.porcentajeIEPS = porcentajeIEPS;
        this.stockTotal = stockTotal;
        this.stockMinimo = stockMinimo;
        this.stockOptimo = stockOptimo;
        this.codigoBarras = codigoBarras;
        this.sku = sku;
        this.laboratorio = laboratorio;
        this.sustanciaActiva = sustanciaActiva;
        this.presentacion = presentacion;
        this.tipoRegulacion = tipoRegulacion;
        this.grupoInteraccion = grupoInteraccion;
        this.ubicacionAnaquel = ubicacionAnaquel;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        // Lotes asociados (se cargan por separado)
        this.lotes = [];
    }

    /** RF-001: Determina si el texto de búsqueda coincide con este producto */
    coincideBusqueda(texto) {
        if (!texto) return false;
        const t = texto.toLowerCase().trim();
        return (
            this.nombre.toLowerCase().includes(t) ||
            this.sustanciaActiva.toLowerCase().includes(t) ||
            this.codigoBarras === t ||
            this.sku.toLowerCase() === t ||
            this.laboratorio.toLowerCase().includes(t)
        );
    }

    /** RF-004: ¿Requiere receta? */
    requiereReceta() {
        return (
            this.tipoRegulacion === TIPO_REGULACION.ANTIBIOTICO ||
            this.tipoRegulacion === TIPO_REGULACION.CONTROLADO_II ||
            this.tipoRegulacion === TIPO_REGULACION.CONTROLADO_III ||
            this.tipoRegulacion === TIPO_REGULACION.CONTROLADO_IV
        );
    }

    /** RF-004: ¿Es controlado? */
    esControlado() {
        return (
            this.tipoRegulacion === TIPO_REGULACION.CONTROLADO_II ||
            this.tipoRegulacion === TIPO_REGULACION.CONTROLADO_III ||
            this.tipoRegulacion === TIPO_REGULACION.CONTROLADO_IV
        );
    }

    /** RF-004: ¿Es antibiótico? */
    esAntibiotico() {
        return this.tipoRegulacion === TIPO_REGULACION.ANTIBIOTICO;
    }

    /** RF-006: Semáforo de existencias */
    getSemaforoStock() {
        if (this.stockTotal <= 0) return 'ROJO';
        if (this.stockTotal <= this.stockMinimo) return 'AMARILLO';
        return 'VERDE';
    }

    /** RF-007: Calcula precio de venta con impuestos */
    getPrecioConImpuestos() {
        const iva = this.precioVenta * (this.porcentajeIVA / 100);
        const ieps = this.precioVenta * (this.porcentajeIEPS / 100);
        return this.precioVenta + iva + ieps;
    }

    /** RF-007: Calcula el margen de ganancia */
    getMargenGanancia() {
        if (this.precioCompra <= 0) return 0;
        return ((this.precioVenta - this.precioCompra) / this.precioCompra) * 100;
    }

    /** RF-007: Validación estricta */
    validar() {
        const errores = [];
        if (!this.nombre || this.nombre.trim() === '') errores.push('El nombre comercial es obligatorio');
        if (!this.categoria) errores.push('La categoría es obligatoria');
        if (this.precioVenta <= 0) errores.push('El precio de venta debe ser mayor a $0');
        if (this.precioCompra < 0) errores.push('El precio de compra no puede ser negativo');
        if (this.precioCompra > 0 && this.precioVenta <= this.precioCompra) {
            errores.push('El precio de venta debe ser mayor al precio de compra');
        }
        if (!this.codigoBarras || this.codigoBarras.trim() === '') errores.push('El código de barras es obligatorio');
        if (this.stockMinimo < 0) errores.push('El stock mínimo no puede ser negativo');
        if (this.porcentajeIVA < 0 || this.porcentajeIVA > 100) errores.push('El % IVA debe estar entre 0 y 100');
        if (this.porcentajeIEPS < 0 || this.porcentajeIEPS > 100) errores.push('El % IEPS debe estar entre 0 y 100');
        if (!this.sustanciaActiva || this.sustanciaActiva.trim() === '') {
            errores.push('La sustancia activa es obligatoria');
        }
        return errores;
    }

    toDTO() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            categoria: this.categoria,
            precioVenta: parseFloat(this.precioVenta),
            precioCompra: parseFloat(this.precioCompra),
            porcentajeIVA: parseFloat(this.porcentajeIVA),
            porcentajeIEPS: parseFloat(this.porcentajeIEPS),
            stockTotal: parseInt(this.stockTotal),
            stockMinimo: parseInt(this.stockMinimo),
            stockOptimo: parseInt(this.stockOptimo),
            codigoBarras: this.codigoBarras,
            sku: this.sku,
            laboratorio: this.laboratorio,
            sustanciaActiva: this.sustanciaActiva,
            presentacion: this.presentacion,
            tipoRegulacion: this.tipoRegulacion,
            grupoInteraccion: this.grupoInteraccion,
            ubicacionAnaquel: this.ubicacionAnaquel,
            activo: this.activo
        };
    }

    static fromDTO(dto) {
        const p = new Producto(
            dto.id, dto.nombre, dto.descripcion, dto.categoria,
            dto.precioVenta, dto.precioCompra, dto.porcentajeIVA, dto.porcentajeIEPS,
            dto.stockTotal, dto.stockMinimo, dto.stockOptimo,
            dto.codigoBarras, dto.sku, dto.laboratorio, dto.sustanciaActiva,
            dto.presentacion, dto.tipoRegulacion, dto.grupoInteraccion,
            dto.ubicacionAnaquel, dto.activo, dto.fechaCreacion, dto.fechaActualizacion
        );
        if (dto.lotes) p.lotes = dto.lotes;
        return p;
    }
}

export default Producto;
