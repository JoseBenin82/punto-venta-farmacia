import { useState } from 'react';
import './ControlledMedModal.css';

/**
 * Modal para captura de datos de receta de medicamentos controlados/antibióticos
 * Validación manual sin dependencias externas (@hookform/resolvers no está instalado)
 */
function ControlledMedModal({ producto, onClose, onConfirm }) {
    const [form, setForm] = useState({
        cedulaMedico: '',
        nombreMedico: '',
        folioReceta: ''
    });
    const [errores, setErrores] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo al escribir
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validar = () => {
        const nuevosErrores = {};
        if (!form.cedulaMedico || form.cedulaMedico.trim().length < 5) {
            nuevosErrores.cedulaMedico = 'La cédula debe tener al menos 5 caracteres';
        } else if (!/^\d+$/.test(form.cedulaMedico.trim())) {
            nuevosErrores.cedulaMedico = 'Solo números';
        }
        if (!form.nombreMedico || form.nombreMedico.trim().length < 5) {
            nuevosErrores.nombreMedico = 'Nombre completo requerido (mínimo 5 caracteres)';
        }
        if (!form.folioReceta || form.folioReceta.trim().length < 3) {
            nuevosErrores.folioReceta = 'Folio requerido (mínimo 3 caracteres)';
        }
        return nuevosErrores;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const nuevosErrores = validar();
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }
        onConfirm(form);
    };

    if (!producto) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-contenido controlled-modal">
                <h3>⚠️ Requerido para Venta: {producto.nombre}</h3>
                <p className="warning-text">Este producto es <strong>{producto.tipoRegulacion.replace(/_/g, ' ')}</strong>. Ingrese los datos de la receta.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Cédula Profesional del Médico *</label>
                        <input name="cedulaMedico" value={form.cedulaMedico}
                            onChange={handleChange} placeholder="Ej. 12345678" autoFocus />
                        {errores.cedulaMedico && <span className="error">{errores.cedulaMedico}</span>}
                    </div>

                    <div className="form-group">
                        <label>Nombre del Médico *</label>
                        <input name="nombreMedico" value={form.nombreMedico}
                            onChange={handleChange} placeholder="Ej. Dr. Juan Pérez" />
                        {errores.nombreMedico && <span className="error">{errores.nombreMedico}</span>}
                    </div>

                    <div className="form-group">
                        <label>Folio de Receta *</label>
                        <input name="folioReceta" value={form.folioReceta}
                            onChange={handleChange} placeholder="Ej. REC-001" />
                        {errores.folioReceta && <span className="error">{errores.folioReceta}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancelar (ESC)</button>
                        <button type="submit" className="btn-confirm">Confirmar y Agregar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ControlledMedModal;
