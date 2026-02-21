import { useState, useEffect } from 'react';
import CorteCaja from '../models/CorteCaja';
import CorteCajaService from '../services/CorteCajaService';
import './CorteCaja.css';

function CorteCajaView() {
    const [corte, setCorte] = useState(null);
    const [fase, setFase] = useState('conteo'); // conteo | resultado
    const [denominaciones, setDenominaciones] = useState(new CorteCaja().crearDesgloseVacio());
    const [pinSupervisor, setPinSupervisor] = useState('');
    const [historialCortes, setHistorialCortes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const corteActual = await CorteCajaService.obtenerActual();
            setCorte(corteActual);
            // Si ya está cerrado, mostrar resultado
            if (corteActual && corteActual.estado === 'CERRADO') {
                setFase('resultado');
            } else if (corteActual) {
                setFase('conteo');
                setDenominaciones(corteActual.crearDesgloseVacio());
            }

            const historial = await CorteCajaService.obtenerHistorial();
            setHistorialCortes(historial || []);
        } catch (error) {
            console.error("Error al cargar corte:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDenominacion = (tipo, valor, cantidad) => {
        setDenominaciones(prev => ({
            ...prev,
            [tipo]: { ...prev[tipo], [valor]: parseInt(cantidad) || 0 }
        }));
    };

    const calcularTotalDenominaciones = () => {
        let total = 0;
        for (const [d, c] of Object.entries(denominaciones.billetes)) total += parseFloat(d) * c;
        for (const [d, c] of Object.entries(denominaciones.monedas)) total += parseFloat(d) * c;
        return total;
    };

    const handleRealizarCorte = async () => {
        if (!pinSupervisor.trim()) { alert('Ingrese el PIN del supervisor'); return; }

        const nuevoCorte = Object.assign(new CorteCaja(), corte);
        nuevoCorte.desgloseDenominaciones = denominaciones;
        nuevoCorte.observaciones = corte.observaciones; // Asegurar observaciones
        // Calcular valores finales
        nuevoCorte.calcularEfectivoDeclarado();
        nuevoCorte.calcularDiferencia();
        nuevoCorte.cerrar(); // Marca fecha cierre y estado

        try {
            const corteCerrado = await CorteCajaService.cerrarCorte(nuevoCorte);
            setCorte(corteCerrado);
            setFase('resultado');
            cargarDatos(); // Refresh historial
        } catch (error) {
            alert('Error al cerrar el corte: ' + error.message);
        }
    };

    const handleNuevoCorte = () => {
        // En un flujo real, esto probablemente implicaría una acción de "Abrir Caja" en el backend
        // Por ahora, recargamos el "corte actual" que el backend nos dé (si es nuevo)
        window.location.reload();
    };

    if (loading) return <div className="loading">Cargando corte de caja...</div>;
    if (!corte) return <div className="error">No se pudo cargar la información del corte.</div>;

    const totalDeclarado = calcularTotalDenominaciones();

    return (
        <div className="corte-container">
            <div className="corte-header">
                <h2>📊 Corte de Caja — Cierre de Turno</h2>
                <span className="corte-fecha">
                    {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>

            {/* RESUMEN DE TURNO */}
            <div className="corte-resumen">
                <div className="resumen-card"><span className="resumen-label">Fondo Inicial</span><span className="resumen-valor">${corte.fondoInicial.toFixed(2)}</span></div>
                <div className="resumen-card"><span className="resumen-label">Ventas Efectivo</span><span className="resumen-valor verde">${corte.ventasEfectivo.toFixed(2)}</span></div>
                <div className="resumen-card"><span className="resumen-label">Ventas Tarjeta</span><span className="resumen-valor azul">${corte.ventasTarjeta.toFixed(2)}</span></div>
                <div className="resumen-card"><span className="resumen-label">Ventas Transferencia</span><span className="resumen-valor morado">${corte.ventasTransferencia.toFixed(2)}</span></div>
                <div className="resumen-card highlight"><span className="resumen-label">Total Ventas</span><span className="resumen-valor">${corte.totalVentas.toFixed(2)}</span></div>
                <div className="resumen-card"><span className="resumen-label">Retiros</span><span className="resumen-valor rojo">-${corte.retirosEfectivo.toFixed(2)}</span></div>
            </div>

            {fase === 'conteo' && (
                <div className="corte-body">
                    <div className="corte-panel-izq">
                        {/* RF-010: PANTALLA CIEGA — Conteo de denominaciones */}
                        <div className="conteo-ciego">
                            <h3>💰 Conteo Ciego (Blind Count)</h3>
                            <p className="conteo-info">Ingrese la cantidad de cada denominación que tiene en la caja. El sistema NO le muestra el esperado hasta completar el conteo.</p>

                            <div className="denominaciones-section">
                                <h4>💵 Billetes</h4>
                                <div className="denominaciones-grid">
                                    {Object.entries(denominaciones.billetes).reverse().map(([valor, cantidad]) => (
                                        <div key={`b-${valor}`} className="denominacion-item">
                                            <span className="denominacion-valor">${valor}</span>
                                            <input type="number" value={cantidad} onChange={(e) => handleDenominacion('billetes', valor, e.target.value)}
                                                min="0" className="denominacion-input" />
                                            <span className="denominacion-subtotal">${(parseFloat(valor) * cantidad).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="denominaciones-section">
                                <h4>🪙 Monedas</h4>
                                <div className="denominaciones-grid">
                                    {Object.entries(denominaciones.monedas).reverse().map(([valor, cantidad]) => (
                                        <div key={`m-${valor}`} className="denominacion-item">
                                            <span className="denominacion-valor">${valor}</span>
                                            <input type="number" value={cantidad} onChange={(e) => handleDenominacion('monedas', valor, e.target.value)}
                                                min="0" className="denominacion-input" />
                                            <span className="denominacion-subtotal">${(parseFloat(valor) * cantidad).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="conteo-total">
                                <span>Efectivo declarado:</span>
                                <span className="conteo-total-valor">${totalDeclarado.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="corte-panel-der">
                        <div className="corte-confirmar">
                            <h3>Confirmar Corte</h3>
                            <p className="conteo-info">Al confirmar el corte, se revelará la diferencia entre lo declarado y lo registrado.</p>

                            <div className="form-group">
                                <label>PIN de Supervisor *</label>
                                <input type="password" value={pinSupervisor} onChange={(e) => setPinSupervisor(e.target.value)}
                                    placeholder="Ingrese PIN para autorizar" className="pin-input" />
                            </div>

                            <div className="form-group">
                                <label>Observaciones</label>
                                <textarea value={corte.observaciones} rows="3" className="obs-textarea"
                                    onChange={(e) => setCorte(prev => {
                                        const c = Object.assign(new CorteCaja(), prev);
                                        c.observaciones = e.target.value;
                                        return c;
                                    })} placeholder="Notas del turno..." />
                            </div>

                            <button className="btn btn-primary btn-corte-final" onClick={handleRealizarCorte}>
                                🔒 Realizar Corte de Caja
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {fase === 'resultado' && (
                <div className="corte-resultado">
                    <h3>📋 Resultado del Corte</h3>

                    <div className="resultado-grid">
                        <div className="resultado-item">
                            <span className="resultado-label">Efectivo Esperado</span>
                            <span className="resultado-valor">${corte.efectivoEsperado.toFixed(2)}</span>
                        </div>
                        <div className="resultado-item">
                            <span className="resultado-label">Efectivo Declarado</span>
                            <span className="resultado-valor">${corte.efectivoDeclarado.toFixed(2)}</span>
                        </div>
                        <div className={`resultado-item resultado-diferencia ${corte.getEstadoDiferencia().toLowerCase()}`}>
                            <span className="resultado-label">Diferencia</span>
                            <span className="resultado-valor-diferencia">
                                {corte.diferencia >= 0 ? '+' : ''}${corte.diferencia.toFixed(2)}
                            </span>
                            <span className={`badge-diferencia badge-${corte.getEstadoDiferencia().toLowerCase()}`}>
                                {corte.getEstadoDiferencia() === 'CUADRADO' ? '✓ Cuadrado' :
                                    corte.getEstadoDiferencia() === 'SOBRANTE' ? '↑ Sobrante' : '↓ Faltante'}
                            </span>
                        </div>
                    </div>

                    <div className="resultado-detalles">
                        <div className="detalle-linea"><span>Fondo inicial:</span><span>${corte.fondoInicial.toFixed(2)}</span></div>
                        <div className="detalle-linea"><span>+ Ventas en efectivo:</span><span>${corte.ventasEfectivo.toFixed(2)}</span></div>
                        <div className="detalle-linea"><span>- Retiros:</span><span>-${corte.retirosEfectivo.toFixed(2)}</span></div>
                        <div className="detalle-linea"><span>- Devoluciones:</span><span>-${corte.totalDevoluciones.toFixed(2)}</span></div>
                        <div className="detalle-linea total"><span>= Esperado en caja:</span><span>${corte.efectivoEsperado.toFixed(2)}</span></div>
                    </div>

                    <div className="resultado-acciones">
                        <button className="btn btn-primary" onClick={handleNuevoCorte}>Iniciar Nuevo Turno</button>
                        <button className="btn btn-secondary" onClick={() => window.print()}>🖨 Imprimir Corte</button>
                    </div>
                </div>
            )}

            {/* HISTORIAL DE CORTES */}
            {historialCortes.length > 0 && (
                <div className="historial-cortes">
                    <h4>📜 Historial de Cortes</h4>
                    <table className="tabla-historial">
                        <thead><tr><th>Fecha</th><th>Cajero</th><th>Total Ventas</th><th>Esperado</th><th>Declarado</th><th>Diferencia</th><th>Estado</th></tr></thead>
                        <tbody>
                            {historialCortes.map((c, i) => (
                                <tr key={i}>
                                    <td>{new Date(c.fechaCierre).toLocaleString('es-MX')}</td>
                                    <td>{c.cajeroNombre}</td>
                                    <td>${c.totalVentas.toFixed(2)}</td>
                                    <td>${c.efectivoEsperado.toFixed(2)}</td>
                                    <td>${c.efectivoDeclarado.toFixed(2)}</td>
                                    <td className={c.diferencia === 0 ? 'text-ok' : c.diferencia > 0 ? 'text-sobrante' : 'text-faltante'}>
                                        {c.diferencia >= 0 ? '+' : ''}${c.diferencia.toFixed(2)}
                                    </td>
                                    <td><span className={`badge-diferencia badge-${c.getEstadoDiferencia().toLowerCase()}`}>{c.getEstadoDiferencia()}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CorteCajaView;
