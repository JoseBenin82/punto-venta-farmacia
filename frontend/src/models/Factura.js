/**
 * Modelo de Factura / CFDI
 * SRS RF-009: Facturación desde ticket de venta
 */

export const REGIMEN_FISCAL = {
    '601': 'General de Ley Personas Morales',
    '603': 'Personas Morales con Fines no Lucrativos',
    '605': 'Sueldos y Salarios',
    '606': 'Arrendamiento',
    '607': 'Régimen de Enajenación',
    '608': 'Demás ingresos',
    '610': 'Residentes en el Extranjero',
    '612': 'Personas Físicas con Actividades Empresariales',
    '616': 'Sin obligaciones fiscales',
    '620': 'Sociedades Cooperativas',
    '621': 'Incorporación Fiscal',
    '622': 'Actividades Agrícolas',
    '625': 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
    '626': 'Régimen Simplificado de Confianza'
};

export const USO_CFDI = {
    'G01': 'Adquisición de mercancías',
    'G03': 'Gastos en general',
    'D01': 'Honorarios médicos',
    'D02': 'Gastos médicos por incapacidad',
    'P01': 'Por definir',
    'S01': 'Sin efectos fiscales'
};

export const METODO_PAGO_CFDI = {
    'PUE': 'Pago en una sola exhibición',
    'PPD': 'Pago en parcialidades o diferido'
};

export const FORMA_PAGO_CFDI = {
    '01': 'Efectivo',
    '04': 'Tarjeta de crédito',
    '28': 'Tarjeta de débito',
    '03': 'Transferencia electrónica'
};

export class Factura {
    constructor(
        id = null,
        ventaId = null,
        folio = '',
        serie = 'A',
        uuid = '',
        // Datos del receptor (cliente)
        rfcReceptor = '',
        razonSocialReceptor = '',
        regimenFiscalReceptor = '616',
        domicilioFiscalReceptor = '',
        usoCfdi = 'S01',
        // Montos
        subtotal = 0,
        descuento = 0,
        impuestosTrasladados = 0,
        total = 0,
        // Pagos
        metodoPago = 'PUE',
        formaPago = '01',
        moneda = 'MXN',
        // Estado
        estado = 'PENDIENTE', // PENDIENTE, TIMBRADA, CANCELADA, ERROR
        urlPDF = '',
        urlXML = '',
        fechaTimbrado = null,
        enviadoPorCorreo = false,
        enviadoPorWhatsApp = false,
        correoEnvio = '',
        telefonoWhatsApp = '',
        observaciones = '',
        fechaCreacion = new Date().toISOString()
    ) {
        this.id = id;
        this.ventaId = ventaId;
        this.folio = folio;
        this.serie = serie;
        this.uuid = uuid;
        this.rfcReceptor = rfcReceptor;
        this.razonSocialReceptor = razonSocialReceptor;
        this.regimenFiscalReceptor = regimenFiscalReceptor;
        this.domicilioFiscalReceptor = domicilioFiscalReceptor;
        this.usoCfdi = usoCfdi;
        this.subtotal = subtotal;
        this.descuento = descuento;
        this.impuestosTrasladados = impuestosTrasladados;
        this.total = total;
        this.metodoPago = metodoPago;
        this.formaPago = formaPago;
        this.moneda = moneda;
        this.estado = estado;
        this.urlPDF = urlPDF;
        this.urlXML = urlXML;
        this.fechaTimbrado = fechaTimbrado;
        this.enviadoPorCorreo = enviadoPorCorreo;
        this.enviadoPorWhatsApp = enviadoPorWhatsApp;
        this.correoEnvio = correoEnvio;
        this.telefonoWhatsApp = telefonoWhatsApp;
        this.observaciones = observaciones;
        this.fechaCreacion = fechaCreacion;
    }

    validarRFC(rfc) {
        // RFC genérica: XAXX010101000 (factura público en general)
        if (rfc === 'XAXX010101000') return true;
        // Persona Física: 4 letras + 6 dígitos + 3 alfanuméricos (13 chars)
        // Persona Moral: 3 letras + 6 dígitos + 3 alfanuméricos (12 chars)
        const regexPF = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;
        const regexPM = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;
        return regexPF.test(rfc) || regexPM.test(rfc);
    }

    validar() {
        const errores = [];
        if (!this.rfcReceptor || this.rfcReceptor.trim() === '') {
            errores.push('El RFC del receptor es obligatorio');
        } else if (!this.validarRFC(this.rfcReceptor.toUpperCase())) {
            errores.push('El RFC no tiene un formato válido');
        }
        if (!this.razonSocialReceptor || this.razonSocialReceptor.trim() === '') {
            errores.push('La razón social es obligatoria');
        }
        if (!this.regimenFiscalReceptor) {
            errores.push('El régimen fiscal es obligatorio');
        }
        if (!this.domicilioFiscalReceptor || this.domicilioFiscalReceptor.trim() === '') {
            errores.push('El código postal del domicilio fiscal es obligatorio');
        }
        if (this.total <= 0) {
            errores.push('El total debe ser mayor a $0');
        }
        return errores;
    }

    toDTO() {
        return {
            id: this.id, ventaId: this.ventaId, folio: this.folio, serie: this.serie,
            rfcReceptor: this.rfcReceptor.toUpperCase(),
            razonSocialReceptor: this.razonSocialReceptor,
            regimenFiscalReceptor: this.regimenFiscalReceptor,
            domicilioFiscalReceptor: this.domicilioFiscalReceptor,
            usoCfdi: this.usoCfdi, subtotal: this.subtotal, descuento: this.descuento,
            impuestosTrasladados: this.impuestosTrasladados, total: this.total,
            metodoPago: this.metodoPago, formaPago: this.formaPago, moneda: this.moneda,
            correoEnvio: this.correoEnvio, telefonoWhatsApp: this.telefonoWhatsApp,
            observaciones: this.observaciones
        };
    }

    static fromDTO(dto) {
        return new Factura(
            dto.id, dto.ventaId, dto.folio, dto.serie, dto.uuid,
            dto.rfcReceptor, dto.razonSocialReceptor, dto.regimenFiscalReceptor,
            dto.domicilioFiscalReceptor, dto.usoCfdi, dto.subtotal, dto.descuento,
            dto.impuestosTrasladados, dto.total, dto.metodoPago, dto.formaPago,
            dto.moneda, dto.estado, dto.urlPDF, dto.urlXML, dto.fechaTimbrado,
            dto.enviadoPorCorreo, dto.enviadoPorWhatsApp, dto.correoEnvio,
            dto.telefonoWhatsApp, dto.observaciones, dto.fechaCreacion
        );
    }
}

export default Factura;
