import { useState } from 'react';
import ProductoList from './components/ProductoList';
import ClienteList from './components/ClienteList';
import PuntoVenta from './components/PuntoVenta';
import InventarioList from './components/InventarioList';
import CorteCajaView from './components/CorteCaja';
import './App.css';

/**
 * Componente principal de la aplicación
 * Sistema de Punto de Venta para Farmacia
 */
function App() {
  const [moduloActivo, setModuloActivo] = useState('punto-venta');

  const renderModulo = () => {
    switch (moduloActivo) {
      case 'punto-venta':
        return <PuntoVenta />;
      case 'productos':
        return <ProductoList />;
      case 'clientes':
        return <ClienteList />;
      case 'inventario':
        return <InventarioList />;
      case 'corte-caja':
        return <CorteCajaView />;
      default:
        return <PuntoVenta />;
    }
  };

  return (
    <div className="app-container">
      {/* Barra de navegación */}
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>💊 Farmacia Julius</h1>
          <p className="navbar-subtitle">Sistema de Punto de Venta</p>
        </div>

        <div className="navbar-menu">
          <button
            className={`nav-item ${moduloActivo === 'punto-venta' ? 'active' : ''}`}
            onClick={() => setModuloActivo('punto-venta')}
          >
            <span className="nav-icon">🛒</span>
            Punto de Venta
          </button>

          <button
            className={`nav-item ${moduloActivo === 'productos' ? 'active' : ''}`}
            onClick={() => setModuloActivo('productos')}
          >
            <span className="nav-icon">💊</span>
            Productos
          </button>

          <button
            className={`nav-item ${moduloActivo === 'clientes' ? 'active' : ''}`}
            onClick={() => setModuloActivo('clientes')}
          >
            <span className="nav-icon">👥</span>
            Clientes
          </button>

          <button
            className={`nav-item ${moduloActivo === 'inventario' ? 'active' : ''}`}
            onClick={() => setModuloActivo('inventario')}
          >
            <span className="nav-icon">📦</span>
            Inventario
          </button>

          <button
            className={`nav-item ${moduloActivo === 'corte-caja' ? 'active' : ''}`}
            onClick={() => setModuloActivo('corte-caja')}
          >
            <span className="nav-icon">📊</span>
            Corte de Caja
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="main-content">
        {renderModulo()}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Sistema  Punto de Venta para Farmacia
        </p>
      </footer>
    </div>
  );
}

export default App;
