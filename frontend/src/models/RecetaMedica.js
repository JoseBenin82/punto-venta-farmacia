/**
 * Modelo de Receta Médica
 * SRS RF-004: Manejo de Medicamentos Controlados y Antibióticos
 * Modal obligatorio para captura de datos de receta
 */

export class RecetaMedica {
    constructor(
        id = null,
        cedulaMedico = '',
        nombreMedico = '',
        folioReceta = '',
        fechaReceta = new Date().toISOString().split('T')[0],
        institucion = '',
        diagnostico = '',
        ventaId = null,
        productoId = null,
        productoNombre = '',
        tipoRegulacion = '',
        verificada = false,
        observaciones = '',
        fechaCreacion = new Date().toISOString()
    ) {
        this.id = id;
        this.cedulaMedico = cedulaMedico;
        this.nombreMedico = nombreMedico;
        this.folioReceta = folioReceta;
        this.fechaReceta = fechaReceta;
        this.institucion = institucion;
        this.diagnostico = diagnostico;
        this.ventaId = ventaId;
        this.productoId = productoId;
        this.productoNombre = productoNombre;
        this.tipoRegulacion = tipoRegulacion;
        this.verificada = verificada;
        this.observaciones = observaciones;
        this.fechaCreacion = fechaCreacion;
    }

    /**
     * RF-004: Validación obligatoria — sin estos datos NO se puede procesar la línea.
     */
    validar() {
        const errores = [];
        if (!this.cedulaMedico || this.cedulaMedico.trim() === '') {
            errores.push('La cédula profesional del médico es obligatoria');
        }
        if (!this.nombreMedico || this.nombreMedico.trim() === '') {
            errores.push('El nombre del médico es obligatorio');
        }
        if (!this.folioReceta || this.folioReceta.trim() === '') {
            errores.push('El folio de la receta es obligatorio');
        }
        if (!this.fechaReceta) {
            errores.push('La fecha de la receta es obligatoria');
        }
        // Validar que la receta no tenga más de 7 días (para antibióticos)
        if (this.fechaReceta) {
            const fechaRecetaDate = new Date(this.fechaReceta);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const diferenciaDias = Math.ceil((hoy - fechaRecetaDate) / (1000 * 60 * 60 * 24));
            if (diferenciaDias > 7) {
                errores.push('La receta tiene más de 7 días de antigüedad');
            }
            if (diferenciaDias < 0) {
                errores.push('La fecha de la receta no puede ser futura');
            }
        }
        return errores;
    }

    esValida() {
        return this.validar().length === 0;
    }

    toDTO() {
        return {
            id: this.id,
            cedulaMedico: this.cedulaMedico,
            nombreMedico: this.nombreMedico,
            folioReceta: this.folioReceta,
            fechaReceta: this.fechaReceta,
            institucion: this.institucion,
            diagnostico: this.diagnostico,
            ventaId: this.ventaId,
            productoId: this.productoId,
            tipoRegulacion: this.tipoRegulacion,
            verificada: this.verificada,
            observaciones: this.observaciones
        };
    }

    static fromDTO(dto) {
        return new RecetaMedica(
            dto.id, dto.cedulaMedico, dto.nombreMedico, dto.folioReceta,
            dto.fechaReceta, dto.institucion, dto.diagnostico,
            dto.ventaId, dto.productoId, dto.productoNombre,
            dto.tipoRegulacion, dto.verificada, dto.observaciones,
            dto.fechaCreacion
        );
    }
}

export default RecetaMedica;
