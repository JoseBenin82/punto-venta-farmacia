import { useState, useRef, useEffect, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import useCarritoStore from '../stores/useCarritoStore';
import RecetaMedica from '../models/RecetaMedica';
import ProductoService from '../services/ProductoService';
import ClienteService from '../services/ClienteService';
import { sonidoExito, sonidoError, sonidoAlerta, sonidoVentaCompletada, sonidoCancelacion } from '../utils/sonidos';
import './PuntoVenta.css';

// ===================================================================
// SF-001: BÚSQUEDA OMNICANAL
// ===================================================================
function BusquedaOmnicanal({ onSeleccionar }) {
    const [texto, setTexto] = useState('');
    const [resultados, setResultados] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const inputRef = useRef(null);

    const detectarTipoBusqueda = (t) => {
        if (/^\d{8,13}$/.test(t)) return 'CODIGO_BARRAS';
        if (/^SKU-/i.test(t)) return 'SKU';
        return 'TEXTO';
    };

    const handleBusqueda = useCallback(async (valor) => {
        setTexto(valor);
        if (!valor || valor.length < 2) { setResultados([]); setMostrar(false); return; }

        try {
            // Determinar si es búsqueda por nombre o código
            const tipo = detectarTipoBusqueda(valor);
            let encontrados = [];

            if (tipo === 'CODIGO_BARRAS') {
                const p = await ProductoService.buscarPorCodigo(valor);
                if (p) encontrados = [p];
            } else {
                encontrados = await ProductoService.buscarPorNombre(valor);
            }

            setResultados(encontrados);
            setMostrar(encontrados.length > 0);

            // Auto-selección para códigos de barras (escáner)
            if (tipo === 'CODIGO_BARRAS' && encontrados.length === 1) {
                onSeleccionar(encontrados[0]);
                setTexto('');
                setResultados([]);
                setMostrar(false);
            }
        } catch (error) {
            console.error("Error en búsqueda:", error);
        }
    }, [onSeleccionar]);

    const seleccionar = (producto) => {
        onSeleccionar(producto);
        setTexto('');
        setResultados([]);
        setMostrar(false);
        inputRef.current?.focus();
    };

    return (
        <div className="busqueda-omnicanal">
            <div className="busqueda-input-wrapper">
                <span className="busqueda-icono">🔍</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={texto}
                    onChange={(e) => handleBusqueda(e.target.value)}
                    placeholder="Escanear código / Buscar por nombre / Sustancia activa / SKU..."
                    className="busqueda-input"
                    autoFocus
                />
                {texto && (
                    <span className="busqueda-tipo-badge">
                        {detectarTipoBusqueda(texto) === 'CODIGO_BARRAS' ? '📊 Código' :
                            detectarTipoBusqueda(texto) === 'SKU' ? '🏷️ SKU' : '🔤 Texto'}
                    </span>
                )}
            </div>
            {mostrar && (
                <div className="busqueda-resultados">
                    {resultados.map(p => (
                        <div key={p.id} className="resultado-item" onClick={() => seleccionar(p)}>
                            <div className="resultado-info">
                                <span className="resultado-nombre">{p.nombre}</span>
                                <span className="resultado-sustancia">{p.sustanciaActiva}</span>
                                <span className="resultado-lab">{p.laboratorio} · {p.presentacion}</span>
                            </div>
                            <div className="resultado-meta">
                                <span className="resultado-precio">${p.precioVenta.toFixed(2)}</span>
                                <span className={`semaforo semaforo-${p.getSemaforoStock().toLowerCase()}`}>
                                    Stock: {p.stockTotal}
                                </span>
                                {p.requiereReceta() && <span className="badge-receta">℞ Receta</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ===================================================================
// RF-002: MODAL DE SELECCIÓN DE LOTE (FEFO)
// ===================================================================
function SeleccionLoteModal({ producto, onSeleccionar, onCerrar }) {
    const lotes = producto.lotes || [];
    return (
        <div className="modal-overlay">
            <div className="modal-contenido modal-lote">
                <h3>Selección de Lote — {producto.nombre}</h3>
                <p className="modal-info">El sistema sugiere el lote con vencimiento más próximo (FEFO).</p>
                <table className="tabla-lotes">
                    <thead>
                        <tr>
                            <th>Lote</th>
                            <th>Vencimiento</th>
                            <th>Días Rest.</th>
                            <th>Disponible</th>
                            <th>Ubicación</th>
                            <th>Estado</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lotes.map((lote, i) => {
                            const caducado = lote.estaCaducado();
                            const porCaducar = lote.estaPorCaducar();
                            const sinStock = !lote.tieneStock();
                            return (
                                <tr key={lote.id} className={caducado ? 'lote-caducado' : porCaducar ? 'lote-por-caducar' : ''}>
                                    <td className="lote-numero">{lote.numeroLote}</td>
                                    <td>{lote.fechaVencimiento}</td>
                                    <td>{lote.diasParaVencimiento()}</td>
                                    <td>{lote.cantidadDisponible} uds.</td>
                                    <td>{lote.ubicacionAnaquel}</td>
                                    <td>
                                        <span className={`semaforo semaforo-${lote.getSemaforoEstado().toLowerCase()}`}>
                                            {caducado ? 'Caducado' : porCaducar ? 'Por caducar' : 'OK'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            disabled={caducado || sinStock}
                                            onClick={() => onSeleccionar(lote)}
                                        >
                                            {i === 0 && !caducado ? 'Sugerido ✓' : 'Seleccionar'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}

// ===================================================================
// RF-004: MODAL DE RECETA MÉDICA
// ===================================================================
function RecetaModal({ producto, indiceLinea, onGuardar, onCerrar }) {
    const [form, setForm] = useState({
        cedulaMedico: '', nombreMedico: '', folioReceta: '',
        fechaReceta: new Date().toISOString().split('T')[0],
        institucion: '', diagnostico: '', observaciones: ''
    });
    const [errores, setErrores] = useState([]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        const receta = new RecetaMedica(
            null, form.cedulaMedico, form.nombreMedico, form.folioReceta,
            form.fechaReceta, form.institucion, form.diagnostico,
            null, producto.id, producto.nombre, producto.tipoRegulacion,
            false, form.observaciones
        );
        const validacion = receta.validar();
        if (validacion.length > 0) {
            setErrores(validacion);
            return;
        }
        onGuardar(indiceLinea, receta);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-contenido modal-receta">
                <div className="modal-receta-header">
                    <h3>℞ Receta Médica Obligatoria</h3>
                    <span className={`badge-regulacion badge-${producto.tipoRegulacion.toLowerCase()}`}>
                        {producto.tipoRegulacion.replace('_', ' ')}
                    </span>
                </div>
                <p className="modal-receta-producto">
                    Producto: <strong>{producto.nombre}</strong> ({producto.sustanciaActiva})
                </p>
                <p className="modal-info alerta-rojo">
                    Este medicamento requiere receta médica. Sin estos datos NO se puede procesar la línea de venta.
                </p>

                {errores.length > 0 && (
                    <div className="alert alert-error">
                        <ul>{errores.map((e, i) => <li key={i}>{e}</li>)}</ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-receta">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Cédula Profesional del Médico *</label>
                            <input type="text" name="cedulaMedico" value={form.cedulaMedico}
                                onChange={handleChange} placeholder="Ej: 12345678" required />
                        </div>
                        <div className="form-group">
                            <label>Folio de la Receta *</label>
                            <input type="text" name="folioReceta" value={form.folioReceta}
                                onChange={handleChange} placeholder="Ej: REC-2024-001" required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre del Médico *</label>
                            <input type="text" name="nombreMedico" value={form.nombreMedico}
                                onChange={handleChange} placeholder="Dr./Dra. Nombre Completo" required />
                        </div>
                        <div className="form-group">
                            <label>Fecha de Receta *</label>
                            <input type="date" name="fechaReceta" value={form.fechaReceta}
                                onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Institución</label>
                            <input type="text" name="institucion" value={form.institucion}
                                onChange={handleChange} placeholder="IMSS, ISSSTE, Particular..." />
                        </div>
                        <div className="form-group">
                            <label>Diagnóstico</label>
                            <input type="text" name="diagnostico" value={form.diagnostico}
                                onChange={handleChange} placeholder="Diagnóstico del paciente" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">Registrar Receta</button>
                        <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar (Eliminar línea)</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ===================================================================
// RF-005: MODAL RETIRO DE EFECTIVO
// ===================================================================
function RetiroEfectivoModal({ efectivoAcumulado, onRetiro, onCerrar }) {
    const [monto, setMonto] = useState('');
    const [motivo, setMotivo] = useState('');
    const [pin, setPin] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!monto || parseFloat(monto) <= 0) return;
        if (!motivo.trim()) return;
        if (!pin.trim()) return;
        onRetiro({ monto: parseFloat(monto), motivo, autorizadoPor: 'Supervisor', pinSupervisor: pin });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-contenido modal-retiro">
                <h3>💰 Retiro de Efectivo</h3>
                <p className="modal-info">Efectivo acumulado en caja: <strong>${efectivoAcumulado.toFixed(2)}</strong></p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Monto a Retirar ($) *</label>
                        <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)}
                            min="1" max={efectivoAcumulado} step="0.01" required />
                    </div>
                    <div className="form-group">
                        <label>Motivo *</label>
                        <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Depósito bancario, cambio, etc." required />
                    </div>
                    <div className="form-group">
                        <label>PIN de Supervisor *</label>
                        <input type="password" value={pin} onChange={(e) => setPin(e.target.value)}
                            placeholder="Ingrese PIN de autorización" required />
                    </div>
                    <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">Confirmar Retiro</button>
                        <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ===================================================================
// RF-003: ALERTAS DE INTERACCIONES MEDICAMENTOSAS
// ===================================================================
function AlertaInteracciones({ interacciones, onDismiss }) {
    if (!interacciones || interacciones.length === 0) return null;
    return (
        <div className="alerta-interacciones">
            <div className="alerta-titulo">
                <span>⚠️ ALERTA DE FARMACOVIGILANCIA — Interacciones Medicamentosas</span>
                <button className="btn-cerrar-alerta" onClick={onDismiss}>✕</button>
            </div>
            {interacciones.map((int, i) => (
                <div key={i} className={`interaccion-item interaccion-${int.severity.toLowerCase()}`}>
                    <span className="interaccion-severity">{int.severity}</span>
                    <div className="interaccion-detalle">
                        <strong>{int.pares}</strong>
                        <p>{int.mensaje}</p>
                        <p className="interaccion-rec">{int.recomendacion}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ===================================================================
// COMPONENTE PRINCIPAL: PUNTO DE VENTA
// ===================================================================
function PuntoVenta() {
    // Zustand Store
    const {
        ventaActual, ventasEnEspera, clienteSeleccionado, interaccionesActivas,
        efectivoAcumulado, alertaRetiro,
        agregarProducto, eliminarProducto, actualizarCantidad, asignarReceta,
        seleccionarCliente: storeSeleccionarCliente, cambiarMetodoPago, setMontoPagado,
        ponerEnEspera, recuperarDeEspera, completarVenta, cancelarVenta,
        registrarRetiro, limpiarInteracciones, dismissAlertaRetiro
    } = useCarritoStore();

    // State local para modales
    const [modalLote, setModalLote] = useState(null);
    const [modalReceta, setModalReceta] = useState(null);
    const [modalRetiro, setModalRetiro] = useState(false);
    const [modalCobro, setModalCobro] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [productoParaLote, setProductoParaLote] = useState(null);

    const metodosPago = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];

    // RF-003: Atajos de Teclado (Zero-Mouse Policy)
    useHotkeys('f1', (e) => {
        e.preventDefault();
        if (ventaActual.detalles.length > 0) handleCobrar();
    }, [ventaActual]);

    useHotkeys('f2', (e) => {
        e.preventDefault();
        document.querySelector('.busqueda-input')?.focus();
    });

    useHotkeys('f5', (e) => {
        e.preventDefault();
        if (ventaActual.detalles.length > 0) handlePonerEnEspera();
    }, [ventaActual]);

    useHotkeys('esc', (e) => {
        e.preventDefault();
        if (modalLote) { setModalLote(null); setProductoParaLote(null); }
        else if (modalReceta) setModalReceta(null);
        else if (modalRetiro) setModalRetiro(false);
        else if (modalCobro) setModalCobro(false);
        else if (ventaActual.detalles.length > 0) handleCancelar();
    }, [modalLote, modalReceta, modalRetiro, modalCobro, ventaActual]);

    // Toast system
    const addToast = (mensaje, tipo = 'info', duracion = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duracion);
    };

    // RF-001/002/003: Seleccionar producto de la búsqueda
    const handleSeleccionarProducto = (producto) => {
        // Si tiene múltiples lotes, mostrar modal de selección
        const lotesValidos = (producto.lotes || []).filter(l => !l.estaCaducado() && l.tieneStock());
        if (lotesValidos.length > 1) {
            setProductoParaLote(producto);
            setModalLote(producto);
            return;
        }

        procesarAgregarProducto(producto, null);
    };

    const procesarAgregarProducto = (producto, loteManual) => {
        const resultado = agregarProducto(producto, 1, loteManual);

        if (!resultado.exito) {
            sonidoError();
            addToast(resultado.mensaje, 'error', 5000);
            return;
        }

        sonidoExito();
        addToast(`${producto.nombre} agregado`, 'success');

        // RF-003: Mostrar interacciones
        if (resultado.interacciones && resultado.interacciones.length > 0) {
            sonidoAlerta();
        }

        // RF-004: Abrir modal de receta si es necesario
        if (resultado.requiereReceta) {
            setModalReceta({
                producto,
                indiceLinea: resultado.indiceLinea
            });
        }
    };

    // RF-002: Selección manual de lote
    const handleSeleccionarLote = (lote) => {
        if (productoParaLote) {
            procesarAgregarProducto(productoParaLote, lote);
            setModalLote(null);
            setProductoParaLote(null);
        }
    };

    // RF-004: Guardar receta
    const handleGuardarReceta = (indiceLinea, receta) => {
        asignarReceta(indiceLinea, receta);
        setModalReceta(null);
        addToast('Receta médica registrada', 'success');
    };

    // RF-004: Cancelar receta = eliminar línea
    const handleCancelarReceta = () => {
        if (modalReceta) {
            eliminarProducto(modalReceta.indiceLinea);
            setModalReceta(null);
            addToast('Línea de venta eliminada (sin receta)', 'warning');
        }
    };

    // Seleccionar cliente (deprecated use in component, moved to QuickSelect)
    const handleBuscarCliente = async (texto) => {
        try {
            return await ClienteService.buscarPorNombre(texto);
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    // RF-005: Cobrar
    const handleCobrar = () => {
        const erroresVenta = ventaActual.validar();
        if (erroresVenta.length > 0) {
            erroresVenta.forEach(e => addToast(e, 'error', 5000));
            sonidoError();
            return;
        }
        setModalCobro(true);
    };

    const handleConfirmarCobro = async () => {
        try {
            const ventaFinalizada = await completarVenta();
            sonidoVentaCompletada();
            addToast(`Venta completada — Total: $${ventaFinalizada.total.toFixed(2)}`, 'success', 5000);
            setModalCobro(false);
        } catch (error) {
            addToast("Error al completar la venta", 'error');
        }
    };

    // RF-005: Hold / Park
    const handlePonerEnEspera = () => {
        if (ventaActual.detalles.length === 0) {
            addToast('No hay productos en la venta', 'warning');
            return;
        }
        const nombre = prompt('Nombre para identificar esta venta (opcional):');
        ponerEnEspera(nombre || '');
        addToast('Venta puesta en espera', 'info');
    };

    // RF-005: Retiro efectivo
    const handleRetiro = (retiro) => {
        registrarRetiro(retiro);
        setModalRetiro(false);
        addToast(`Retiro de $${retiro.monto.toFixed(2)} registrado`, 'success');
    };

    // Cancelar
    const handleCancelar = () => {
        if (ventaActual.detalles.length === 0) return;
        if (!window.confirm('¿Cancelar la venta actual?')) return;
        cancelarVenta();
        sonidoCancelacion();
        addToast('Venta cancelada', 'warning');
    };

    // =========== RENDER ===========
    return (
        <div className="pos-container">
            {/* TOASTS */}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast-${t.tipo}`}>{t.mensaje}</div>
                ))}
            </div>

            {/* MODALES */}
            {modalLote && (
                <SeleccionLoteModal
                    producto={modalLote}
                    onSeleccionar={handleSeleccionarLote}
                    onCerrar={() => { setModalLote(null); setProductoParaLote(null); }}
                />
            )}
            {modalReceta && (
                <RecetaModal
                    producto={modalReceta.producto}
                    indiceLinea={modalReceta.indiceLinea}
                    onGuardar={handleGuardarReceta}
                    onCerrar={handleCancelarReceta}
                />
            )}
            {modalRetiro && (
                <RetiroEfectivoModal
                    efectivoAcumulado={efectivoAcumulado}
                    onRetiro={handleRetiro}
                    onCerrar={() => setModalRetiro(false)}
                />
            )}
            {modalCobro && (
                <ModalCobro
                    venta={ventaActual}
                    metodosPago={metodosPago}
                    metodoActual={ventaActual.metodoPago}
                    onCambiarMetodo={cambiarMetodoPago}
                    onSetMontoPagado={setMontoPagado}
                    onConfirmar={handleConfirmarCobro}
                    onCerrar={() => setModalCobro(false)}
                />
            )}

            {/* RF-005: Alerta de retiro */}
            {alertaRetiro && (
                <div className="alerta-retiro">
                    <span>⚠️ Se acumularon <strong>${efectivoAcumulado.toFixed(2)}</strong> en caja. Se recomienda hacer un retiro.</span>
                    <button className="btn btn-sm btn-primary" onClick={() => setModalRetiro(true)}>Hacer Retiro</button>
                    <button className="btn btn-sm btn-secondary" onClick={dismissAlertaRetiro}>Después</button>
                </div>
            )}

            {/* HEADER */}
            <div className="pos-header">
                <div className="pos-header-left">
                    <h2>🏥 Terminal de Venta</h2>
                    <span className="pos-fecha">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="pos-header-right">
                    <span className="pos-efectivo">💵 Efectivo: ${efectivoAcumulado.toFixed(2)}</span>
                    {ventasEnEspera.length > 0 && (
                        <span className="pos-espera-badge">⏸ {ventasEnEspera.length} en espera</span>
                    )}
                </div>
            </div>

            {/* RF-003: Alertas de interacciones */}
            <AlertaInteracciones interacciones={interaccionesActivas} onDismiss={limpiarInteracciones} />

            <div className="pos-body">
                {/* ===== PANEL IZQUIERDO ===== */}
                <div className="pos-panel-izq">
                    {/* RF-001: Búsqueda Omnicanal */}
                    <BusquedaOmnicanal onSeleccionar={handleSeleccionarProducto} />

                    {/* Selector de cliente */}
                    <div className="pos-cliente-section">
                        <label>Cliente:</label>
                        <ClienteQuickSelect
                            seleccionado={clienteSeleccionado}
                            onSeleccionar={storeSeleccionarCliente}
                        />
                    </div>

                    {/* RF-005: Ventas en espera */}
                    {ventasEnEspera.length > 0 && (
                        <div className="pos-espera-section">
                            <h4>⏸ Ventas en Espera</h4>
                            {ventasEnEspera.map((v, i) => (
                                <div key={i} className="espera-item" onClick={() => recuperarDeEspera(i)}>
                                    <span className="espera-nombre">{v.nombreEspera || `Venta #${i + 1}`}</span>
                                    <span className="espera-total">${v.total.toFixed(2)} · {v.detalles.length} items</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Historial del cliente seleccionado */}
                    {clienteSeleccionado && clienteSeleccionado.historialCompras && clienteSeleccionado.historialCompras.length > 0 && (
                        <div className="pos-historial">
                            <h4>📋 Últimas compras de {clienteSeleccionado.nombre}</h4>
                            {clienteSeleccionado.historialCompras.slice(0, 3).map((h, i) => (
                                <div key={i} className="historial-item">
                                    <span className="historial-fecha">{h.fecha}</span>
                                    <span className="historial-prods">{h.productos.join(', ')}</span>
                                    <span className="historial-total">${h.total.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ===== PANEL DERECHO: CARRITO ===== */}
                <div className="pos-panel-der">
                    <div className="pos-carrito-header">
                        <h3>Carrito de Venta</h3>
                        <span className="carrito-items">{ventaActual.detalles.length} productos</span>
                    </div>

                    <div className="pos-carrito-body">
                        {ventaActual.detalles.length === 0 ? (
                            <div className="carrito-vacio">
                                <span className="carrito-vacio-icono">🛒</span>
                                <p>Escanee o busque un producto para comenzar</p>
                            </div>
                        ) : (
                            <div className="carrito-lista">
                                {ventaActual.detalles.map((d, i) => (
                                    <div key={i} className={`carrito-item ${(typeof d.requiereReceta === 'function' ? d.requiereReceta() : false) && !(typeof d.tieneRecetaCompleta === 'function' ? d.tieneRecetaCompleta() : true) ? 'sin-receta' : ''}`}>
                                        <div className="carrito-item-info">
                                            <div className="carrito-item-nombre">
                                                {d.productoNombre}
                                                {(typeof d.requiereReceta === 'function' ? d.requiereReceta() : false) && (
                                                    <span className={`badge-receta-mini ${d.recetaMedica ? 'receta-ok' : 'receta-pendiente'}`}>
                                                        {d.recetaMedica ? '℞ ✓' : '℞ Pendiente'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="carrito-item-sub">
                                                {d.sustanciaActiva && <span>{d.sustanciaActiva}</span>}
                                                {d.numeroLote && <span>Lote: {d.numeroLote}</span>}
                                                {d.fechaVencimientoLote && <span>Vence: {d.fechaVencimientoLote}</span>}
                                            </div>
                                        </div>
                                        <div className="carrito-item-qty">
                                            <button className="btn-qty" onClick={() => d.cantidad > 1 && actualizarCantidad(i, d.cantidad - 1)}>−</button>
                                            <span className="qty-value">{d.cantidad}</span>
                                            <button className="btn-qty" onClick={() => actualizarCantidad(i, d.cantidad + 1)}>+</button>
                                        </div>
                                        <div className="carrito-item-precio">
                                            <span className="precio-unit">${d.precioUnitario.toFixed(2)}</span>
                                            <span className="precio-subtotal">${(d.cantidad * d.precioUnitario).toFixed(2)}</span>
                                        </div>
                                        <button className="btn-eliminar-item" onClick={() => eliminarProducto(i)}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* TOTALES */}
                    <div className="pos-totales">
                        <div className="total-row"><span>Subtotal:</span><span>${ventaActual.subtotal.toFixed(2)}</span></div>
                        <div className="total-row"><span>IVA (16%):</span><span>${ventaActual.impuesto.toFixed(2)}</span></div>
                        {ventaActual.descuentoTotal > 0 && (
                            <div className="total-row descuento"><span>Descuento ({ventaActual.descuentoTotal}%):</span><span>-${(ventaActual.subtotal * ventaActual.descuentoTotal / 100).toFixed(2)}</span></div>
                        )}
                        <div className="total-row total-final"><span>TOTAL:</span><span>${ventaActual.total.toFixed(2)}</span></div>
                    </div>

                    {/* ACCIONES */}
                    <div className="pos-acciones">
                        <button className="btn btn-cobrar" onClick={handleCobrar} disabled={ventaActual.detalles.length === 0}>
                            💳 COBRAR
                        </button>
                        <button className="btn btn-espera" onClick={handlePonerEnEspera} disabled={ventaActual.detalles.length === 0}>
                            ⏸ Espera
                        </button>
                        <button className="btn btn-retiro" onClick={() => setModalRetiro(true)}>
                            💰 Retiro
                        </button>
                        <button className="btn btn-cancelar-venta" onClick={handleCancelar} disabled={ventaActual.detalles.length === 0}>
                            ✕ Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===================================================================
// SELECTOR RÁPIDO DE CLIENTE
// ===================================================================
function ClienteQuickSelect({ seleccionado, onSeleccionar }) {
    const [busqueda, setBusqueda] = useState('');
    const [resultados, setResultados] = useState([]);
    const [mostrar, setMostrar] = useState(false);

    const handleBusqueda = async (texto) => {
        setBusqueda(texto);
        if (!texto || texto.length < 2) { setResultados([]); setMostrar(false); return; }
        try {
            const encontrados = await ClienteService.buscarPorNombre(texto);
            setResultados(encontrados);
            setMostrar(true);
        } catch (error) {
            console.error("Error buscando cliente:", error);
        }
    };

    return (
        <div className="cliente-quick-select">
            {seleccionado ? (
                <div className="cliente-seleccionado">
                    <span>{seleccionado.getNombreCompleto()}</span>
                    <span className={`badge badge-${seleccionado.tipoCliente.toLowerCase()}`}>{seleccionado.tipoCliente}</span>
                    {seleccionado.descuento > 0 && <span className="badge badge-descuento">{seleccionado.descuento}% dto.</span>}
                    <button className="btn-cambiar-cliente" onClick={() => onSeleccionar(null)}>✕</button>
                </div>
            ) : (
                <>
                    <input type="text" value={busqueda} onChange={(e) => handleBusqueda(e.target.value)}
                        placeholder="Buscar por teléfono, RFC, nombre..." className="search-input" />
                    {mostrar && resultados.length > 0 && (
                        <div className="cliente-resultados">
                            {resultados.map(c => (
                                <div key={c.id} className="cliente-resultado-item" onClick={() => { onSeleccionar(c); setMostrar(false); setBusqueda(''); }}>
                                    <span className="cliente-nombre-r">{c.getNombreCompleto()}</span>
                                    <span className="cliente-tel-r">Tel: {c.telefono}</span>
                                    <span className={`badge badge-${c.tipoCliente.toLowerCase()}`}>{c.tipoCliente}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ===================================================================
// MODAL DE COBRO
// ===================================================================
function ModalCobro({ venta, metodosPago, metodoActual, onCambiarMetodo, onSetMontoPagado, onConfirmar, onCerrar }) {
    const [montoPagado, setMontoPagado] = useState('');

    const handleConfirmar = () => {
        if (metodoActual === 'EFECTIVO') {
            const monto = parseFloat(montoPagado);
            if (!monto || monto < venta.total) {
                alert('Monto insuficiente');
                return;
            }
            onSetMontoPagado(monto);
        } else {
            onSetMontoPagado(venta.total);
        }
        onConfirmar();
    };

    const cambio = metodoActual === 'EFECTIVO' && montoPagado
        ? Math.max(0, parseFloat(montoPagado) - venta.total)
        : 0;

    // Botones rápidos para efectivo
    const botonesRapidos = [50, 100, 200, 500, 1000];

    return (
        <div className="modal-overlay">
            <div className="modal-contenido modal-cobro">
                <h3>💳 Cobrar Venta</h3>
                <div className="cobro-total">
                    <span>Total a cobrar:</span>
                    <span className="cobro-monto">${venta.total.toFixed(2)}</span>
                </div>
                <div className="cobro-metodos">
                    {metodosPago.map(m => (
                        <button key={m} className={`btn-metodo-cobro ${metodoActual === m ? 'active' : ''}`}
                            onClick={() => onCambiarMetodo(m)}>
                            {m === 'EFECTIVO' ? '💵' : m === 'TARJETA' ? '💳' : '🏦'} {m}
                        </button>
                    ))}
                </div>
                {metodoActual === 'EFECTIVO' && (
                    <div className="cobro-efectivo">
                        <div className="form-group">
                            <label>Monto recibido ($)</label>
                            <input type="number" value={montoPagado} onChange={(e) => setMontoPagado(e.target.value)}
                                min={venta.total} step="0.01" className="cobro-input"
                                autoFocus placeholder="0.00" />
                        </div>
                        <div className="cobro-rapidos">
                            {botonesRapidos.map(b => (
                                <button key={b} className="btn btn-rapido" onClick={() => setMontoPagado(b.toString())}>
                                    ${b}
                                </button>
                            ))}
                            <button className="btn btn-rapido" onClick={() => setMontoPagado(Math.ceil(venta.total).toString())}>
                                Exacto
                            </button>
                        </div>
                        {montoPagado && parseFloat(montoPagado) >= venta.total && (
                            <div className="cobro-cambio">
                                <span>Cambio:</span>
                                <span className="cambio-monto">${cambio.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                )}
                <div className="modal-footer">
                    <button className="btn btn-cobrar-final" onClick={handleConfirmar}
                        disabled={metodoActual === 'EFECTIVO' && (!montoPagado || parseFloat(montoPagado) < venta.total)}>
                        Confirmar Cobro
                    </button>
                    <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}

export default PuntoVenta;
