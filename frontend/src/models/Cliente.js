/**
 * Modelo de Cliente
 * SRS RF-008: Búsqueda por Teléfono / RFC, Alta Rápida, Historial de compras
 */
export class Cliente {
    constructor(
        id = null,
        nombre = '',
        apellido = '',
        email = '',
        telefono = '',
        direccion = '',
        dni = '',
        rfc = '',
        codigoPostal = '',
        regimenFiscal = '616',
        razonSocial = '',
        fechaNacimiento = '',
        tipoCliente = 'REGULAR',
        descuento = 0,
        activo = true,
        fechaCreacion = new Date().toISOString(),
        fechaActualizacion = new Date().toISOString()
    ) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.telefono = telefono;
        this.direccion = direccion;
        this.dni = dni;
        this.rfc = rfc;
        this.codigoPostal = codigoPostal;
        this.regimenFiscal = regimenFiscal;
        this.razonSocial = razonSocial;
        this.fechaNacimiento = fechaNacimiento;
        this.tipoCliente = tipoCliente;
        this.descuento = descuento;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        // RF-008: Historial de compras
        this.historialCompras = [];
    }

    /** RF-008: Búsqueda omnicanal de cliente */
    coincideBusqueda(texto) {
        if (!texto) return false;
        const t = texto.toLowerCase().trim();
        return (
            this.nombre.toLowerCase().includes(t) ||
            this.apellido.toLowerCase().includes(t) ||
            this.telefono.includes(t) ||
            this.rfc.toLowerCase().includes(t) ||
            this.dni.includes(t) ||
            this.email.toLowerCase().includes(t)
        );
    }

    getNombreCompleto() {
        return `${this.nombre} ${this.apellido}`.trim();
    }

    /** Verificar si tiene datos fiscales completos para facturación */
    tieneDatosFiscales() {
        return this.rfc && this.razonSocial && this.codigoPostal && this.regimenFiscal;
    }

    validar() {
        const errores = [];
        if (!this.nombre || this.nombre.trim() === '') errores.push('El nombre es obligatorio');
        if (!this.apellido || this.apellido.trim() === '') errores.push('El apellido es obligatorio');
        if (!this.telefono || this.telefono.trim() === '') errores.push('El teléfono es obligatorio');
        if (this.telefono && !/^[0-9]{10}$/.test(this.telefono.replace(/\s|-/g, ''))) {
            errores.push('El teléfono debe tener 10 dígitos');
        }
        if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            errores.push('El email no es válido');
        }
        if (this.rfc && this.rfc !== 'XAXX010101000') {
            const regexPF = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;
            const regexPM = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;
            if (!regexPF.test(this.rfc.toUpperCase()) && !regexPM.test(this.rfc.toUpperCase())) {
                errores.push('El RFC no tiene formato válido');
            }
        }
        return errores;
    }

    toDTO() {
        return {
            id: this.id, nombre: this.nombre, apellido: this.apellido,
            email: this.email, telefono: this.telefono, direccion: this.direccion,
            dni: this.dni, rfc: this.rfc ? this.rfc.toUpperCase() : '',
            codigoPostal: this.codigoPostal, regimenFiscal: this.regimenFiscal,
            razonSocial: this.razonSocial, fechaNacimiento: this.fechaNacimiento,
            tipoCliente: this.tipoCliente, descuento: parseFloat(this.descuento),
            activo: this.activo
        };
    }

    static fromDTO(dto) {
        const c = new Cliente(
            dto.id, dto.nombre, dto.apellido, dto.email, dto.telefono,
            dto.direccion, dto.dni, dto.rfc, dto.codigoPostal, dto.regimenFiscal,
            dto.razonSocial, dto.fechaNacimiento, dto.tipoCliente, dto.descuento,
            dto.activo, dto.fechaCreacion, dto.fechaActualizacion
        );
        if (dto.historialCompras) c.historialCompras = dto.historialCompras;
        return c;
    }
}

export default Cliente;
