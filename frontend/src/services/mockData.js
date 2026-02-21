/**
 * Datos de prueba actualizados para SRS completo
 * Incluye lotes, controlados, interacciones, datos fiscales
 */
import Producto, { TIPO_REGULACION, GRUPO_INTERACCION } from '../models/Producto';
import Lote from '../models/Lote';
import Cliente from '../models/Cliente';

// ============================================
// PRODUCTOS FARMACÉUTICOS DE PRUEBA
// ============================================
export const productosMock = [
    (() => {
        const p = new Producto(1, 'Paracetamol 500mg', 'Analgésico y antipirético', 'Analgésicos',
            45.50, 28.00, 0, 0, 150, 20, 100, '7501234567890', 'SKU-PAR-500',
            'Laboratorios Pisa', 'Paracetamol', 'Caja con 20 tabletas',
            TIPO_REGULACION.VENTA_LIBRE, GRUPO_INTERACCION.NINGUNO, 'Pasillo A - Estante 1');
        p.lotes = [
            new Lote(1, 1, 'LOT-A-001', '2025-08-15', '2024-09-01', 100, 60, 28.00, 'Pisa S.A.', 'A1'),
            new Lote(2, 1, 'LOT-A-002', '2026-03-20', '2024-12-15', 100, 90, 28.00, 'Pisa S.A.', 'A1')
        ];
        return p;
    })(),
    (() => {
        const p = new Producto(2, 'Amoxicilina 500mg', 'Antibiótico de amplio espectro', 'Antibióticos',
            120.00, 72.00, 0, 0, 80, 15, 60, '7501234567891', 'SKU-AMX-500',
            'Laboratorios Sophia', 'Amoxicilina', 'Caja con 12 cápsulas',
            TIPO_REGULACION.ANTIBIOTICO, GRUPO_INTERACCION.ANTIBIOTICOS, 'Pasillo B - Estante 2');
        p.lotes = [
            new Lote(3, 2, 'LOT-B-001', '2025-06-30', '2024-08-01', 50, 35, 72.00, 'Sophia Labs', 'B2'),
            new Lote(4, 2, 'LOT-B-002', '2026-01-15', '2024-11-10', 50, 45, 72.00, 'Sophia Labs', 'B2')
        ];
        return p;
    })(),
    (() => {
        const p = new Producto(3, 'Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo', 'Antiinflamatorios',
            65.00, 38.00, 0, 0, 200, 25, 120, '7501234567892', 'SKU-IBU-400',
            'Laboratorios Pisa', 'Ibuprofeno', 'Caja con 20 tabletas',
            TIPO_REGULACION.VENTA_LIBRE, GRUPO_INTERACCION.AINES, 'Pasillo A - Estante 2');
        p.lotes = [
            new Lote(5, 3, 'LOT-C-001', '2026-06-15', '2024-10-01', 120, 100, 38.00, 'Pisa S.A.', 'A2'),
            new Lote(6, 3, 'LOT-C-002', '2027-01-20', '2025-01-05', 120, 100, 38.00, 'Pisa S.A.', 'A2')
        ];
        return p;
    })(),
    (() => {
        const p = new Producto(4, 'Clonazepam 2mg', 'Ansiolítico benzodiazepínico', 'Controlados',
            180.00, 95.00, 0, 0, 30, 5, 20, '7501234567893', 'SKU-CLZ-002',
            'Laboratorios Senosiain', 'Clonazepam', 'Caja con 30 tabletas',
            TIPO_REGULACION.CONTROLADO_IV, GRUPO_INTERACCION.BENZODIACEPINAS, 'Vitrina Controlados');
        p.lotes = [
            new Lote(7, 4, 'LOT-D-001', '2026-09-30', '2024-11-01', 30, 30, 95.00, 'Senosiain S.A.', 'VC')
        ];
        return p;
    })(),
    (() => {
        const p = new Producto(5, 'Omeprazol 20mg', 'Inhibidor de la bomba de protones', 'Digestivos',
            95.00, 52.00, 0, 0, 120, 20, 80, '7501234567894', 'SKU-OMP-020',
            'Laboratorios Pisa', 'Omeprazol', 'Caja con 14 cápsulas',
            TIPO_REGULACION.VENTA_LIBRE, GRUPO_INTERACCION.NINGUNO, 'Pasillo C - Estante 1');
        p.lotes = [
            new Lote(8, 5, 'LOT-E-001', '2025-11-30', '2024-07-15', 80, 60, 52.00, 'Pisa S.A.', 'C1'),
            new Lote(9, 5, 'LOT-E-002', '2026-08-20', '2025-01-10', 80, 60, 52.00, 'Pisa S.A.', 'C1')
        ];
        return p;
    })(),
    (() => {
        const p = new Producto(6, 'Tramadol 50mg', 'Analgésico opioide', 'Controlados',
            250.00, 140.00, 0, 0, 15, 5, 20, '7501234567895', 'SKU-TRM-050',
            'Laboratorios Pisa', 'Tramadol', 'Caja con 20 cápsulas',
            TIPO_REGULACION.CONTROLADO_III, GRUPO_INTERACCION.OPIOIDES, 'Vitrina Controlados');
        p.lotes = [
            new Lote(10, 6, 'LOT-F-001', '2026-04-15', '2024-10-20', 20, 15, 140.00, 'Pisa S.A.', 'VC')
        ];
        return p;
    })(),
    (() => {
        const p = new Producto(7, 'Warfarina 5mg', 'Anticoagulante oral', 'Cardiovasculares',
            85.00, 48.00, 0, 0, 40, 10, 30, '7501234567896', 'SKU-WRF-005',
            'Laboratorios Pisa', 'Warfarina', 'Caja con 30 tabletas',
            TIPO_REGULACION.VENTA_LIBRE, GRUPO_INTERACCION.ANTICOAGULANTES, 'Pasillo D - Estante 1');
        p.lotes = [
            new Lote(11, 7, 'LOT-G-001', '2026-07-30', '2024-12-01', 40, 40, 48.00, 'Pisa S.A.', 'D1')
        ];
        return p;
    })(),
    (() => {
        const p = new Producto(8, 'Paracetamol 1g (Genérico)', 'Analgésico genérico', 'Analgésicos',
            32.00, 18.00, 0, 0, 300, 30, 150, '7501234567897', 'SKU-PAR-1G',
            'Laboratorios Amsa', 'Paracetamol', 'Caja con 10 tabletas',
            TIPO_REGULACION.VENTA_LIBRE, GRUPO_INTERACCION.NINGUNO, 'Pasillo A - Estante 1');
        p.lotes = [
            new Lote(12, 8, 'LOT-H-001', '2026-12-31', '2025-01-15', 300, 300, 18.00, 'Amsa Labs', 'A1')
        ];
        return p;
    })(),
    (() => {
        const p = new Producto(9, 'Metronidazol 500mg', 'Antiprotozoario y antibacteriano', 'Antibióticos',
            75.00, 42.00, 0, 0, 60, 10, 40, '7501234567898', 'SKU-MTZ-500',
            'Laboratorios Sophia', 'Metronidazol', 'Caja con 30 tabletas',
            TIPO_REGULACION.ANTIBIOTICO, GRUPO_INTERACCION.ANTIBIOTICOS, 'Pasillo B - Estante 3');
        p.lotes = [
            new Lote(13, 9, 'LOT-I-001', '2026-05-10', '2024-11-20', 60, 60, 42.00, 'Sophia Labs', 'B3')
        ];
        return p;
    })(),
    (() => {
        const p = new Producto(10, 'Vitamina C 1000mg', 'Suplemento vitamínico', 'Vitaminas y Suplementos',
            85.00, 45.00, 0, 0, 5, 10, 50, '7501234567899', 'SKU-VTC-1K',
            'Laboratorios GNC', 'Ácido Ascórbico', 'Frasco con 60 tabletas',
            TIPO_REGULACION.VENTA_LIBRE, GRUPO_INTERACCION.NINGUNO, 'Pasillo E - Estante 1');
        p.lotes = [
            new Lote(14, 10, 'LOT-J-001', '2026-09-20', '2025-01-10', 10, 5, 45.00, 'GNC Labs', 'E1')
        ];
        return p;
    })(),
    (() => {
        // Producto con lote ya caducado para probar RF-003
        const p = new Producto(11, 'Aspirina 100mg', 'Ácido acetilsalicílico', 'Analgésicos',
            38.00, 22.00, 0, 0, 20, 10, 40, '7501234567900', 'SKU-ASP-100',
            'Bayer', 'Ácido Acetilsalicílico', 'Caja con 28 tabletas',
            TIPO_REGULACION.VENTA_LIBRE, GRUPO_INTERACCION.AINES, 'Pasillo A - Estante 3');
        p.lotes = [
            new Lote(15, 11, 'LOT-K-001', '2024-01-15', '2023-06-01', 30, 20, 22.00, 'Bayer SA', 'A3'), // CADUCADO
            new Lote(16, 11, 'LOT-K-002', '2026-11-30', '2025-01-15', 30, 0, 22.00, 'Bayer SA', 'A3')   // Sin stock
        ];
        return p;
    })()
];

// ============================================
// CLIENTES DE PRUEBA (con datos fiscales)
// ============================================
export const clientesMock = [
    (() => {
        const c = new Cliente(1, 'Juan', 'Pérez García', 'juan.perez@email.com',
            '5551234567', 'Av. Insurgentes 123', '12345678901', 'PEGJ850315AB1',
            '06600', '612', 'Juan Pérez García', '1985-03-15', 'REGULAR', 0, true);
        c.historialCompras = [
            { fecha: '2024-02-10', productos: ['Paracetamol 500mg', 'Omeprazol 20mg'], total: 140.50 },
            { fecha: '2024-01-25', productos: ['Vitamina C 1000mg'], total: 85.00 }
        ];
        return c;
    })(),
    (() => {
        const c = new Cliente(2, 'María', 'González López', 'maria.gonzalez@email.com',
            '5559876543', 'Calle Reforma 456', '98765432109', 'GOLM900722KL5',
            '03100', '626', 'María González López', '1990-07-22', 'VIP', 10, true);
        c.historialCompras = [
            { fecha: '2024-02-12', productos: ['Amoxicilina 500mg', 'Ibuprofeno 400mg'], total: 185.00 },
            { fecha: '2024-02-01', productos: ['Paracetamol 500mg x2'], total: 91.00 }
        ];
        return c;
    })(),
    (() => {
        const c = new Cliente(3, 'Farmacia', 'Del Centro S.A.', 'compras@farmaciacentro.com',
            '5555555555', 'Av. Universidad 789', '', 'FCE200101AB3',
            '04510', '601', 'Farmacia Del Centro S.A. de C.V.', '', 'MAYORISTA', 15, true);
        return c;
    })(),
    new Cliente(4, 'Ana', 'Hernández Sánchez', 'ana.hernandez@email.com',
        '5552223344', 'Calle Juárez 321', '66778899001', '',
        '', '616', '', '1995-05-10', 'REGULAR', 0, true),
    new Cliente(5, 'Luis', 'Martínez Flores', 'luis.martinez@email.com',
        '5554445566', 'Av. Revolución 654', '55443322110', 'MAFL821018QR9',
        '06700', '612', 'Luis Martínez Flores', '1982-10-18', 'VIP', 10, true)
];

// Simulación de delay de red
export const simulateNetworkDelay = (ms = 300) =>
    new Promise(resolve => setTimeout(resolve, ms));

// Generador de IDs
let nextId = 100;
export const generateId = () => nextId++;

// Helpers de búsqueda
export const buscarProductos = (texto) =>
    productosMock.filter(p => p.coincideBusqueda(texto));

export const buscarClientes = (texto) =>
    clientesMock.filter(c => c.coincideBusqueda(texto));

export const obtenerProductosStockBajo = () =>
    productosMock.filter(p => p.getSemaforoStock() !== 'VERDE');

export default {
    productosMock,
    clientesMock,
    simulateNetworkDelay,
    generateId,
    buscarProductos,
    buscarClientes,
    obtenerProductosStockBajo
};
