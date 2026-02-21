import { useState, useMemo, useEffect } from 'react';
import Cliente from '../models/Cliente';
import ClienteService from '../services/ClienteService';
import './ClienteList.css';

function ClienteList() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [modal, setModal] = useState(null);
    const [clienteEditar, setClienteEditar] = useState(null);
    const [modalHistorial, setModalHistorial] = useState(null);
    const [errores, setErrores] = useState([]);

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        setLoading(true);
        try {
            const data = await ClienteService.obtenerTodos();
            setClientes(data);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        } finally {
            setLoading(false);
        }
    };

    const formVacio = {
        nombre: '', apellido: '', email: '', telefono: '', direccion: '', dni: '',
        rfc: '', codigoPostal: '', regimenFiscal: '616', razonSocial: '',
        fechaNacimiento: '', tipoCliente: 'REGULAR', descuento: '0'
    };
    const [form, setForm] = useState(formVacio);

    const clientesFiltrados = useMemo(() => {
        return clientes.filter(c => {
            const matchBusqueda = !busqueda || c.coincideBusqueda(busqueda);
            const matchTipo = !filtroTipo || c.tipoCliente === filtroTipo;
            return matchBusqueda && matchTipo;
        });
    }, [clientes, busqueda, filtroTipo]);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const abrirCrear = () => { setForm(formVacio); setClienteEditar(null); setErrores([]); setModal('crear'); };
    const abrirEditar = (c) => {
        setForm({
            nombre: c.nombre, apellido: c.apellido, email: c.email, telefono: c.telefono,
            direccion: c.direccion, dni: c.dni, rfc: c.rfc, codigoPostal: c.codigoPostal,
            regimenFiscal: c.regimenFiscal, razonSocial: c.razonSocial,
            fechaNacimiento: c.fechaNacimiento, tipoCliente: c.tipoCliente,
            descuento: c.descuento.toString()
        });
        setClienteEditar(c);
        setErrores([]);
        setModal('editar');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cliente = new Cliente(
            clienteEditar?.id || null, form.nombre, form.apellido, form.email,
            form.telefono, form.direccion, form.dni, form.rfc, form.codigoPostal,
            form.regimenFiscal, form.razonSocial, form.fechaNacimiento,
            form.tipoCliente, parseFloat(form.descuento)
        );
        const validacion = cliente.validar();
        if (validacion.length > 0) { setErrores(validacion); return; }

        try {
            if (modal === 'editar') {
                cliente.id = clienteEditar.id;
                cliente.historialCompras = clienteEditar.historialCompras;
                await ClienteService.actualizar(cliente.id, cliente);
                setClientes(prev => prev.map(c => c.id === cliente.id ? cliente : c));
            } else {
                const nuevo = await ClienteService.crear(cliente);
                setClientes(prev => [...prev, nuevo]);
            }
            setModal(null);
            cargarClientes();
        } catch (error) {
            console.error("Error al guardar cliente:", error);
            setErrores(["Error al guardar en el servidor"]);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Eliminar este cliente?')) return;
        try {
            await ClienteService.eliminar(id);
            setClientes(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    return (
        <div className="clientes-container">
            <div className="clientes-header">
                <h2>👥 Clientes y Facturación</h2>
                <span className="clientes-count">{clientes.length} clientes registrados</span>
                <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo Cliente</button>
            </div>

            <div className="clientes-filtros">
                <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por teléfono, RFC, nombre, email..." className="filtro-input" />
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="filtro-select">
                    <option value="">Todos los tipos</option>
                    <option value="REGULAR">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="MAYORISTA">Mayorista</option>
                </select>
            </div>

            <div className="clientes-tabla-wrapper">
                <table className="clientes-tabla">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Teléfono</th>
                            <th>RFC</th>
                            <th>Tipo</th>
                            <th>Descuento</th>
                            <th>Datos Fiscales</th>
                            <th>Historial</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesFiltrados.map(c => (
                            <tr key={c.id}>
                                <td>
                                    <div className="cliente-cell">
                                        <span className="cliente-nombre-t">{c.getNombreCompleto()}</span>
                                        <span className="cliente-email-t">{c.email}</span>
                                    </div>
                                </td>
                                <td>{c.telefono}</td>
                                <td className="td-rfc">{c.rfc || '—'}</td>
                                <td><span className={`badge badge-${c.tipoCliente.toLowerCase()}`}>{c.tipoCliente}</span></td>
                                <td>{c.descuento > 0 ? <span className="badge-descuento">{c.descuento}%</span> : '—'}</td>
                                <td>
                                    {c.tieneDatosFiscales() ? (
                                        <span className="badge-fiscal completo">✓ Completo</span>
                                    ) : (
                                        <span className="badge-fiscal incompleto">Incompleto</span>
                                    )}
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-historial"
                                        onClick={() => setModalHistorial(c)}
                                        disabled={!c.historialCompras || c.historialCompras.length === 0}>
                                        📋 {(c.historialCompras || []).length}
                                    </button>
                                </td>
                                <td>
                                    <div className="acciones-cell">
                                        <button className="btn btn-sm btn-editar" onClick={() => abrirEditar(c)}>✏</button>
                                        <button className="btn btn-sm btn-eliminar" onClick={() => handleEliminar(c.id)}>🗑</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL CREAR/EDITAR */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal-contenido modal-cliente" onClick={e => e.stopPropagation()}>
                        <h3>{modal === 'crear' ? 'Nuevo Cliente' : 'Editar Cliente'}</h3>
                        {errores.length > 0 && (
                            <div className="alert alert-error"><ul>{errores.map((e, i) => <li key={i}>{e}</li>)}</ul></div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-section"><h4>Datos Personales</h4>
                                <div className="form-row">
                                    <div className="form-group"><label>Nombre *</label>
                                        <input name="nombre" value={form.nombre} onChange={handleChange} required /></div>
                                    <div className="form-group"><label>Apellido *</label>
                                        <input name="apellido" value={form.apellido} onChange={handleChange} required /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Teléfono *</label>
                                        <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="10 dígitos" required /></div>
                                    <div className="form-group"><label>Email</label>
                                        <input type="email" name="email" value={form.email} onChange={handleChange} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>DNI / CURP</label>
                                        <input name="dni" value={form.dni} onChange={handleChange} /></div>
                                    <div className="form-group"><label>Fecha de Nacimiento</label>
                                        <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} /></div>
                                </div>
                                <div className="form-group full-width"><label>Dirección</label>
                                    <input name="direccion" value={form.direccion} onChange={handleChange} /></div>
                            </div>

                            <div className="form-section"><h4>Datos Fiscales (para Facturación)</h4>
                                <div className="form-row">
                                    <div className="form-group"><label>RFC</label>
                                        <input name="rfc" value={form.rfc} onChange={handleChange} placeholder="XXXX000000XX0" /></div>
                                    <div className="form-group"><label>Razón Social</label>
                                        <input name="razonSocial" value={form.razonSocial} onChange={handleChange} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Código Postal Fiscal</label>
                                        <input name="codigoPostal" value={form.codigoPostal} onChange={handleChange} placeholder="5 dígitos" /></div>
                                    <div className="form-group"><label>Régimen Fiscal</label>
                                        <select name="regimenFiscal" value={form.regimenFiscal} onChange={handleChange}>
                                            <option value="601">601 - General de Ley PM</option>
                                            <option value="612">612 - Actividades Empresariales PF</option>
                                            <option value="616">616 - Sin obligaciones fiscales</option>
                                            <option value="626">626 - RESICO</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section"><h4>Tipo de Cliente</h4>
                                <div className="form-row">
                                    <div className="form-group"><label>Tipo</label>
                                        <select name="tipoCliente" value={form.tipoCliente} onChange={handleChange}>
                                            <option value="REGULAR">Regular</option>
                                            <option value="VIP">VIP</option>
                                            <option value="MAYORISTA">Mayorista</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Descuento (%)</label>
                                        <input type="number" name="descuento" value={form.descuento} onChange={handleChange} min="0" max="50" step="0.5" /></div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary">Guardar</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RF-008: MODAL HISTORIAL DE COMPRAS */}
            {modalHistorial && (
                <div className="modal-overlay" onClick={() => setModalHistorial(null)}>
                    <div className="modal-contenido modal-historial" onClick={e => e.stopPropagation()}>
                        <h3>📋 Historial de Compras — {modalHistorial.getNombreCompleto()}</h3>
                        <p className="modal-info">Últimas compras del cliente. Útil para repetir pedidos anteriores.</p>
                        {(modalHistorial.historialCompras || []).length === 0 ? (
                            <p className="historial-vacio">Sin historial de compras registrado.</p>
                        ) : (
                            <div className="historial-lista">
                                {modalHistorial.historialCompras.map((h, i) => (
                                    <div key={i} className="historial-card">
                                        <div className="historial-card-header">
                                            <span className="historial-card-fecha">{h.fecha}</span>
                                            <span className="historial-card-total">${h.total.toFixed(2)}</span>
                                        </div>
                                        <div className="historial-card-productos">
                                            {h.productos.map((p, j) => (
                                                <span key={j} className="historial-producto-badge">{p}</span>
                                            ))}
                                        </div>
                                        <div className="historial-acciones-row">
                                            <button className="btn btn-sm btn-repetir">🔄 Repetir esta compra</button>
                                            <button className="btn btn-sm btn-facturar" style={{ marginLeft: '8px', background: '#e67e22', color: 'white' }}
                                                onClick={() => alert('Generando factura CFDI... (Simulación)')}>
                                                📄 Facturar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalHistorial(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClienteList;
