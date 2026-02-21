import { useState, useEffect } from 'react';
import InventarioService from '../services/InventarioService';
import ProductoService from '../services/ProductoService';
import MovimientoInventario from '../models/Inventario';
import './InventarioList.css';

/**
 * Componente para gestión de inventario
 */
function InventarioList() {
    const [movimientos, setMovimientos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tipoFiltro, setTipoFiltro] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [tipoMovimiento, setTipoMovimiento] = useState('ENTRADA');

    const tiposMovimiento = ['ENTRADA', 'SALIDA', 'AJUSTE'];

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        setError(null);
        try {
            const [movimientosData, productosData] = await Promise.all([
                InventarioService.obtenerMovimientos(),
                ProductoService.obtenerTodos()
            ]);
            setMovimientos(movimientosData);
            setProductos(productosData);
        } catch (err) {
            setError('Error al cargar datos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const movimientosFiltrados = tipoFiltro
        ? movimientos.filter(m => m.tipoMovimiento === tipoFiltro)
        : movimientos;

    const handleNuevoMovimiento = (tipo) => {
        setTipoMovimiento(tipo);
        setMostrarFormulario(true);
    };

    const handleGuardarMovimiento = async (movimiento) => {
        try {
            if (movimiento.tipoMovimiento === 'ENTRADA') {
                await InventarioService.registrarEntrada(movimiento);
            } else if (movimiento.tipoMovimiento === 'SALIDA') {
                await InventarioService.registrarSalida(movimiento);
            } else if (movimiento.tipoMovimiento === 'AJUSTE') {
                await InventarioService.registrarAjuste(movimiento);
            }

            alert('Movimiento registrado correctamente');
            setMostrarFormulario(false);
            await cargarDatos();
        } catch (err) {
            alert('Error al registrar movimiento: ' + err.message);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
    };

    if (mostrarFormulario) {
        return (
            <MovimientoForm
                tipo={tipoMovimiento}
                productos={productos}
                onGuardar={handleGuardarMovimiento}
                onCancelar={handleCancelar}
            />
        );
    }

    return (
        <div className="inventario-container">
            <div className="inventario-header">
                <h2>Gestión de Inventario</h2>
                <div className="header-actions">
                    <button
                        className="btn btn-entrada"
                        onClick={() => handleNuevoMovimiento('ENTRADA')}
                    >
                        + Entrada
                    </button>
                    <button
                        className="btn btn-salida"
                        onClick={() => handleNuevoMovimiento('SALIDA')}
                    >
                        - Salida
                    </button>
                    <button
                        className="btn btn-ajuste"
                        onClick={() => handleNuevoMovimiento('AJUSTE')}
                    >
                        ⚙ Ajuste
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Resumen de stock */}
            <div className="stock-summary">
                <div className="summary-card">
                    <h3>Total Productos</h3>
                    <div className="summary-value">{productos.length}</div>
                </div>
                <div className="summary-card">
                    <h3>Stock Total</h3>
                    <div className="summary-value">
                        {productos.reduce((sum, p) => sum + (p.stockTotal || 0), 0)}
                    </div>
                </div>
                <div className="summary-card warning">
                    <h3>Stock Bajo</h3>
                    <div className="summary-value">
                        {productos.filter(p => (p.stockTotal || 0) < (p.stockMinimo || 10)).length}
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="inventario-filters">
                <select
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todos los movimientos</option>
                    {tiposMovimiento.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                </select>
            </div>

            {/* Tabla de movimientos */}
            {loading ? (
                <div className="loading">Cargando movimientos...</div>
            ) : (
                <div className="movimientos-table-container">
                    <table className="movimientos-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Stock Anterior</th>
                                <th>Stock Nuevo</th>
                                <th>Motivo</th>
                                <th>Referencia</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientosFiltrados.map(mov => (
                                <tr key={mov.id}>
                                    <td>{new Date(mov.fecha).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge badge-${mov.tipoMovimiento.toLowerCase()}`}>
                                            {mov.tipoMovimiento}
                                        </span>
                                    </td>
                                    <td>{mov.productoNombre}</td>
                                    <td className={`cantidad-${mov.tipoMovimiento.toLowerCase()}`}>
                                        {mov.tipoMovimiento === 'ENTRADA' ? '+' : '-'}
                                        {mov.cantidad}
                                    </td>
                                    <td>{mov.stockAnterior}</td>
                                    <td className="stock-nuevo">{mov.stockNuevo}</td>
                                    <td>{mov.motivo}</td>
                                    <td>{mov.referencia}</td>
                                    <td>{mov.usuarioNombre || 'Sistema'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {movimientosFiltrados.length === 0 && (
                        <div className="no-results">
                            No se encontraron movimientos
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Formulario para registrar movimientos de inventario
 */
function MovimientoForm({ tipo, productos, onGuardar, onCancelar }) {
    const [formData, setFormData] = useState({
        productoId: '',
        cantidad: 0,
        motivo: '',
        referencia: '',
        observaciones: ''
    });
    const [errores, setErrores] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (name === 'productoId') {
            const producto = productos.find(p => String(p.id) === String(value));
            setProductoSeleccionado(producto || null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!productoSeleccionado) {
            setErrores(['Debe seleccionar un producto']);
            return;
        }

        const movimiento = new MovimientoInventario(
            null,
            productoSeleccionado.id,
            productoSeleccionado.nombre,
            tipo,
            parseInt(formData.cantidad),
            productoSeleccionado.stockTotal || 0,
            0,
            formData.motivo,
            formData.referencia,
            null,
            '',
            new Date().toISOString(),
            formData.observaciones
        );

        movimiento.calcularStockNuevo();

        const validationErrors = movimiento.validar();
        if (validationErrors.length > 0) {
            setErrores(validationErrors);
            return;
        }

        setErrores([]);
        onGuardar(movimiento);
    };

    const getTitulo = () => {
        switch (tipo) {
            case 'ENTRADA':
                return 'Registrar Entrada de Inventario';
            case 'SALIDA':
                return 'Registrar Salida de Inventario';
            case 'AJUSTE':
                return 'Ajustar Inventario';
            default:
                return 'Movimiento de Inventario';
        }
    };

    return (
        <div className="movimiento-form-container">
            <h2>{getTitulo()}</h2>

            {errores.length > 0 && (
                <div className="alert alert-error">
                    <ul>
                        {errores.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit} className="movimiento-form">
                <div className="form-group">
                    <label>Producto *</label>
                    <select
                        name="productoId"
                        value={formData.productoId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un producto...</option>
                        {productos.map(prod => (
                            <option key={prod.id} value={prod.id}>
                                {prod.nombre} - Stock actual: {prod.stockTotal || 0}
                            </option>
                        ))}
                    </select>
                </div>

                {productoSeleccionado && (
                    <div className="producto-info-box">
                        <p><strong>Stock actual:</strong> {productoSeleccionado.stockTotal || 0} unidades</p>
                        <p><strong>Categoría:</strong> {productoSeleccionado.categoria}</p>
                        <p><strong>Código:</strong> {productoSeleccionado.codigoBarras}</p>
                    </div>
                )}

                <div className="form-group">
                    <label>
                        {tipo === 'AJUSTE' ? 'Nuevo Stock *' : 'Cantidad *'}
                    </label>
                    <input
                        type="number"
                        name="cantidad"
                        value={formData.cantidad}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Motivo *</label>
                    <input
                        type="text"
                        name="motivo"
                        value={formData.motivo}
                        onChange={handleChange}
                        placeholder="Ej: Compra, Venta, Devolución, etc."
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Referencia</label>
                    <input
                        type="text"
                        name="referencia"
                        value={formData.referencia}
                        onChange={handleChange}
                        placeholder="Número de factura, orden, etc."
                    />
                </div>

                <div className="form-group">
                    <label>Observaciones</label>
                    <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Notas adicionales..."
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        Guardar
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancelar}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default InventarioList;
