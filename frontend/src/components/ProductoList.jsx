import { useState, useMemo, useEffect } from 'react';
import Producto, { TIPO_REGULACION, CATEGORIAS_FARMACIA, GRUPO_INTERACCION } from '../models/Producto';
import Lote from '../models/Lote';
import ProductoService from '../services/ProductoService';
import './ProductoList.css';

function ProductoList() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroSemaforo, setFiltroSemaforo] = useState('');
    const [modal, setModal] = useState(null); // null | 'crear' | 'editar'
    const [modalLotes, setModalLotes] = useState(null);
    const [productoEditar, setProductoEditar] = useState(null);
    const [errores, setErrores] = useState([]);
    const [formLote, setFormLote] = useState(null);

    // Cargar productos al iniciar
    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        setLoading(true);
        try {
            const data = await ProductoService.obtenerTodos();
            setProductos(data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
            alert("Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    // Formulario vacío
    const formVacio = {
        nombre: '', descripcion: '', categoria: '', precioVenta: '', precioCompra: '',
        porcentajeIVA: '16', porcentajeIEPS: '0', stockMinimo: '10', stockOptimo: '50',
        codigoBarras: '', sku: '', laboratorio: '', sustanciaActiva: '', presentacion: '',
        tipoRegulacion: 'VENTA_LIBRE', grupoInteraccion: 'NINGUNO', ubicacionAnaquel: ''
    };
    const [form, setForm] = useState(formVacio);

    // RF-006: Filtrado con semáforo
    const productosFiltrados = useMemo(() => {
        return productos.filter(p => {
            const matchBusqueda = !busqueda || p.coincideBusqueda(busqueda);
            const matchCategoria = !filtroCategoria || p.categoria === filtroCategoria;
            const matchSemaforo = !filtroSemaforo || p.getSemaforoStock() === filtroSemaforo;
            return matchBusqueda && matchCategoria && matchSemaforo;
        });
    }, [productos, busqueda, filtroCategoria, filtroSemaforo]);

    // Stats
    const stats = useMemo(() => ({
        total: productos.length,
        agotados: productos.filter(p => p.getSemaforoStock() === 'ROJO').length,
        minimo: productos.filter(p => p.getSemaforoStock() === 'AMARILLO').length,
        porCaducar: productos.filter(p => p.lotes && p.lotes.some(l => l.estaPorCaducar && l.estaPorCaducar())).length
    }), [productos]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const abrirCrear = () => {
        setForm(formVacio);
        setProductoEditar(null);
        setErrores([]);
        setModal('crear');
    };

    const abrirEditar = (p) => {
        setForm({
            nombre: p.nombre, descripcion: p.descripcion, categoria: p.categoria,
            precioVenta: p.precioVenta.toString(), precioCompra: p.precioCompra.toString(),
            porcentajeIVA: p.porcentajeIVA.toString(), porcentajeIEPS: p.porcentajeIEPS.toString(),
            stockMinimo: p.stockMinimo.toString(), stockOptimo: p.stockOptimo.toString(),
            codigoBarras: p.codigoBarras, sku: p.sku, laboratorio: p.laboratorio,
            sustanciaActiva: p.sustanciaActiva, presentacion: p.presentacion,
            tipoRegulacion: p.tipoRegulacion, grupoInteraccion: p.grupoInteraccion,
            ubicacionAnaquel: p.ubicacionAnaquel
        });
        setProductoEditar(p);
        setErrores([]);
        setModal('editar');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const producto = new Producto(
            productoEditar?.id || null, form.nombre, form.descripcion, form.categoria,
            parseFloat(form.precioVenta), parseFloat(form.precioCompra),
            parseFloat(form.porcentajeIVA), parseFloat(form.porcentajeIEPS),
            productoEditar?.stockTotal || 0, parseInt(form.stockMinimo), parseInt(form.stockOptimo),
            form.codigoBarras, form.sku, form.laboratorio, form.sustanciaActiva,
            form.presentacion, form.tipoRegulacion, form.grupoInteraccion,
            form.ubicacionAnaquel
        );
        const validacion = producto.validar();
        if (validacion.length > 0) { setErrores(validacion); return; }

        try {
            if (modal === 'editar') {
                producto.lotes = productoEditar.lotes; // Mantener lotes
                producto.id = productoEditar.id; // Asegurar ID
                await ProductoService.actualizar(producto.id, producto);
                setProductos(prev => prev.map(p => p.id === producto.id ? producto : p));
            } else {
                const nuevo = await ProductoService.crear(producto);
                setProductos(prev => [...prev, nuevo]);
            }
            setModal(null);
            cargarProductos(); // Recargar para asegurar consistencia
        } catch (error) {
            console.error("Error al guardar:", error);
            setErrores(["Error al guardar en el servidor"]);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Eliminar este producto?')) return;
        try {
            await ProductoService.eliminar(id);
            setProductos(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al eliminar el producto");
        }
    };

    // Lotes
    const abrirLotes = (producto) => {
        setModalLotes(producto);
        setFormLote(null);
    };

    const handleAgregarLote = (e) => {
        e.preventDefault();
        if (!formLote) return;
        const lote = new Lote(
            Date.now(), modalLotes.id, formLote.numeroLote, formLote.fechaVencimiento,
            new Date().toISOString().split('T')[0], parseInt(formLote.cantidad),
            parseInt(formLote.cantidad), parseFloat(formLote.precioCompra),
            formLote.proveedor, formLote.ubicacion
        );
        const err = lote.validar();
        if (err.length > 0) { alert(err.join('\n')); return; }

        setProductos(prev => prev.map(p => {
            if (p.id === modalLotes.id) {
                const nuevo = Object.assign(new Producto(), p);
                nuevo.lotes = [...(p.lotes || []), lote];
                nuevo.stockTotal = nuevo.lotes.reduce((s, l) => s + l.cantidadDisponible, 0);
                return nuevo;
            }
            return p;
        }));
        // Actualizar vista del modal
        setModalLotes(prev => {
            const p = Object.assign(new Producto(), prev);
            p.lotes = [...(prev.lotes || []), lote];
            return p;
        });
        setFormLote(null);
    };

    return (
        <div className="productos-container">
            {/* HEADER / STATS */}
            <div className="productos-header">
                <h2>📦 Catálogo de Productos</h2>
                <div className="productos-stats">
                    <div className="stat">{stats.total}<span>Total</span></div>
                    <div className="stat stat-rojo">{stats.agotados}<span>Agotados</span></div>
                    <div className="stat stat-amarillo">{stats.minimo}<span>Stock mín.</span></div>
                    <div className="stat stat-naranja">{stats.porCaducar}<span>Por caducar</span></div>
                </div>
                <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo Producto</button>
            </div>

            {/* FILTROS */}
            <div className="productos-filtros">
                <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, sustancia activa, código, SKU..." className="filtro-input" />
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="filtro-select">
                    <option value="">Todas las categorías</option>
                    {CATEGORIAS_FARMACIA.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="filtro-semaforo">
                    <button className={`btn-semaforo ${filtroSemaforo === '' ? 'active' : ''}`} onClick={() => setFiltroSemaforo('')}>Todos</button>
                    <button className={`btn-semaforo verde ${filtroSemaforo === 'VERDE' ? 'active' : ''}`} onClick={() => setFiltroSemaforo('VERDE')}>🟢</button>
                    <button className={`btn-semaforo amarillo ${filtroSemaforo === 'AMARILLO' ? 'active' : ''}`} onClick={() => setFiltroSemaforo('AMARILLO')}>🟡</button>
                    <button className={`btn-semaforo rojo ${filtroSemaforo === 'ROJO' ? 'active' : ''}`} onClick={() => setFiltroSemaforo('ROJO')}>🔴</button>
                </div>
            </div>

            {/* TABLA */}
            <div className="productos-tabla-wrapper">
                <table className="productos-tabla">
                    <thead>
                        <tr>
                            <th>Estado</th>
                            <th>Producto</th>
                            <th>Sustancia Activa</th>
                            <th>Categoría</th>
                            <th>Regulación</th>
                            <th>P. Venta</th>
                            <th>Stock</th>
                            <th>Lotes</th>
                            <th>Ubicación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosFiltrados.map(p => {
                            const semaforo = p.getSemaforoStock();
                            const tienePorCaducar = p.lotes && p.lotes.some(l => l.estaPorCaducar && l.estaPorCaducar());
                            return (
                                <tr key={p.id}>
                                    <td>
                                        <span className={`indicador-semaforo indicador-${semaforo.toLowerCase()}`}></span>
                                        {tienePorCaducar && <span className="icono-caducar" title="Tiene lotes por caducar">⏰</span>}
                                    </td>
                                    <td>
                                        <div className="producto-cell">
                                            <span className="producto-nombre-tabla">{p.nombre}</span>
                                            <span className="producto-lab-tabla">{p.laboratorio} · {p.presentacion}</span>
                                        </div>
                                    </td>
                                    <td className="td-sustancia">{p.sustanciaActiva}</td>
                                    <td><span className="badge-categoria">{p.categoria}</span></td>
                                    <td>
                                        {p.requiereReceta() && (
                                            <span className={`badge-regulacion badge-${p.tipoRegulacion.toLowerCase()}`}>
                                                {p.tipoRegulacion === 'ANTIBIOTICO' ? '℞ Antibiótico' :
                                                    p.tipoRegulacion.replace('CONTROLADO_', 'Ctrl. Grupo ')}
                                            </span>
                                        )}
                                        {!p.requiereReceta() && <span className="badge-libre">Libre</span>}
                                    </td>
                                    <td className="td-precio">${p.precioVenta.toFixed(2)}</td>
                                    <td>
                                        <span className={`stock-valor stock-${semaforo.toLowerCase()}`}>{p.stockTotal}</span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-lotes" onClick={() => abrirLotes(p)}>
                                            {(p.lotes || []).length} lotes
                                        </button>
                                    </td>
                                    <td className="td-ubicacion">{p.ubicacionAnaquel}</td>
                                    <td>
                                        <div className="acciones-cell">
                                            <button className="btn btn-sm btn-editar" onClick={() => abrirEditar(p)}>✏</button>
                                            <button className="btn btn-sm btn-eliminar" onClick={() => handleEliminar(p.id)}>🗑</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* MODAL CREAR/EDITAR PRODUCTO */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal-contenido modal-producto" onClick={e => e.stopPropagation()}>
                        <h3>{modal === 'crear' ? 'Nuevo Producto' : 'Editar Producto'}</h3>

                        {errores.length > 0 && (
                            <div className="alert alert-error">
                                <ul>{errores.map((e, i) => <li key={i}>{e}</li>)}</ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h4>Información General</h4>
                                <div className="form-row">
                                    <div className="form-group"><label>Nombre Comercial *</label>
                                        <input name="nombre" value={form.nombre} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group"><label>Sustancia Activa *</label>
                                        <input name="sustanciaActiva" value={form.sustanciaActiva} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Laboratorio</label>
                                        <input name="laboratorio" value={form.laboratorio} onChange={handleChange} />
                                    </div>
                                    <div className="form-group"><label>Presentación</label>
                                        <input name="presentacion" value={form.presentacion} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group full-width"><label>Descripción</label>
                                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="2" />
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Clasificación y Regulación</h4>
                                <div className="form-row">
                                    <div className="form-group"><label>Categoría *</label>
                                        <select name="categoria" value={form.categoria} onChange={handleChange} required>
                                            <option value="">Seleccionar...</option>
                                            {CATEGORIAS_FARMACIA.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Tipo Regulación</label>
                                        <select name="tipoRegulacion" value={form.tipoRegulacion} onChange={handleChange}>
                                            {Object.entries(TIPO_REGULACION).map(([k, v]) =>
                                                <option key={k} value={v}>{v.replace(/_/g, ' ')}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Grupo Interacción</label>
                                        <select name="grupoInteraccion" value={form.grupoInteraccion} onChange={handleChange}>
                                            {Object.entries(GRUPO_INTERACCION).map(([k, v]) =>
                                                <option key={k} value={v}>{v.replace(/_/g, ' ')}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Precios e Impuestos</h4>
                                <div className="form-row">
                                    <div className="form-group"><label>Precio Compra ($)</label>
                                        <input type="number" name="precioCompra" value={form.precioCompra} onChange={handleChange} min="0" step="0.01" />
                                    </div>
                                    <div className="form-group"><label>Precio Venta ($) *</label>
                                        <input type="number" name="precioVenta" value={form.precioVenta} onChange={handleChange} min="0.01" step="0.01" required />
                                    </div>
                                    <div className="form-group"><label>% IVA</label>
                                        <input type="number" name="porcentajeIVA" value={form.porcentajeIVA} onChange={handleChange} min="0" max="100" />
                                    </div>
                                    <div className="form-group"><label>% IEPS</label>
                                        <input type="number" name="porcentajeIEPS" value={form.porcentajeIEPS} onChange={handleChange} min="0" max="100" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Identificación y Stock</h4>
                                <div className="form-row">
                                    <div className="form-group"><label>Código de Barras *</label>
                                        <input name="codigoBarras" value={form.codigoBarras} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group"><label>SKU (Código Interno)</label>
                                        <input name="sku" value={form.sku} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Stock Mínimo</label>
                                        <input type="number" name="stockMinimo" value={form.stockMinimo} onChange={handleChange} min="0" />
                                    </div>
                                    <div className="form-group"><label>Stock Óptimo</label>
                                        <input type="number" name="stockOptimo" value={form.stockOptimo} onChange={handleChange} min="0" />
                                    </div>
                                    <div className="form-group"><label>Ubicación Anaquel</label>
                                        <input name="ubicacionAnaquel" value={form.ubicacionAnaquel} onChange={handleChange} placeholder="Ej: Pasillo A - Estante 1" />
                                    </div>
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

            {/* MODAL LOTES */}
            {modalLotes && (
                <div className="modal-overlay" onClick={() => setModalLotes(null)}>
                    <div className="modal-contenido modal-lotes-detalle" onClick={e => e.stopPropagation()}>
                        <h3>Lotes — {modalLotes.nombre}</h3>
                        <table className="tabla-lotes">
                            <thead>
                                <tr><th>Lote</th><th>Vencimiento</th><th>Días</th><th>Disponible</th><th>P. Compra</th><th>Proveedor</th><th>Estado</th></tr>
                            </thead>
                            <tbody>
                                {(modalLotes.lotes || []).map(l => (
                                    <tr key={l.id} className={l.estaCaducado() ? 'lote-caducado' : l.estaPorCaducar() ? 'lote-por-caducar' : ''}>
                                        <td className="lote-numero">{l.numeroLote}</td>
                                        <td>{l.fechaVencimiento}</td>
                                        <td>{l.diasParaVencimiento()}</td>
                                        <td>{l.cantidadDisponible}</td>
                                        <td>${l.precioCompra.toFixed(2)}</td>
                                        <td>{l.proveedor}</td>
                                        <td>
                                            <span className={`semaforo semaforo-${l.getSemaforoEstado().toLowerCase()}`}>
                                                {l.estaCaducado() ? 'Caducado' : l.estaPorCaducar() ? 'Por caducar' : 'OK'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {!formLote && (
                            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setFormLote({
                                numeroLote: '', fechaVencimiento: '', cantidad: '', precioCompra: '', proveedor: '', ubicacion: ''
                            })}>+ Agregar Lote</button>
                        )}

                        {formLote && (
                            <form onSubmit={handleAgregarLote} className="form-lote-inline">
                                <h4>Nuevo Lote</h4>
                                <div className="form-row">
                                    <input placeholder="Número de lote" value={formLote.numeroLote}
                                        onChange={e => setFormLote({ ...formLote, numeroLote: e.target.value })} required />
                                    <input type="date" value={formLote.fechaVencimiento}
                                        onChange={e => setFormLote({ ...formLote, fechaVencimiento: e.target.value })} required />
                                    <input type="number" placeholder="Cantidad" value={formLote.cantidad}
                                        onChange={e => setFormLote({ ...formLote, cantidad: e.target.value })} min="1" required />
                                    <input type="number" placeholder="P. Compra" value={formLote.precioCompra}
                                        onChange={e => setFormLote({ ...formLote, precioCompra: e.target.value })} min="0" step="0.01" />
                                    <input placeholder="Proveedor" value={formLote.proveedor}
                                        onChange={e => setFormLote({ ...formLote, proveedor: e.target.value })} />
                                    <button type="submit" className="btn btn-primary btn-sm">Agregar</button>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFormLote(null)}>✕</button>
                                </div>
                            </form>
                        )}

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalLotes(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductoList;
