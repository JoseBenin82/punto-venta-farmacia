# Documento de Especificación de Requerimientos de Software (SRS) - Farmacia POS

## 1. Requerimientos Funcionales (RF)

### Módulo A: Terminal de Venta (POS / Caja)
**RF-001: Búsqueda Omnicanal**
- Input único que acepta: 
  - Código de Barras (EAN-13/UPC)
  - Texto (Nombre comercial)
  - Sustancia Activa
  - Código Interno (SKU)

**RF-002: Selección de Lote (Batch Enforcement)**
- **FEFO (First Expired, First Out)**: Prioridad automática al lote con vencimiento más próximo.
- Selección manual si es necesario.

**RF-003: Alertas de Farmacovigilancia**
- **Bloqueo de Caducados**: No permitir venta de lotes vencidos.
- **Interacciones**: Alerta visual (ej. Alcohol + Antibiótico).

**RF-004: Medicamentos Controlados**
- Modal obligatorio para Grupos II, III, IV.
- Requiere: Cédula Médico, Nombre Médico, Folio Receta.

**RF-005: Operaciones de Caja**
- **Hold/Park Sale**: Poner en espera.
- **Retiros**: Alerta de monto máximo.

### Módulo B: Catálogo e Inventario
**RF-006: Semáforo de Existencias**
- Rojo (Agotado), Amarillo (Mínimo), Verde (Óptimo).
- Icono "Por Caducar".

**RF-007: Gestión de Productos**
- Validación estricta.
- Categorización (Antibiótico/Controlado).

### Módulo C: Clientes y Facturación
**RF-008: Búsqueda de Clientes**
- Teléfono/RFC.
- Historial de compras.

**RF-009: Facturación**
- CFDI desde ticket.

### Módulo D: Seguridad
**RF-010: Cierre de Turno**
- Pantalla ciega (Blind Count).

**RF-011: Permisos**
- Roles (Cajero vs Supervisor).

## 2. Requerimientos No Funcionales (RNF)
**RNF-001: Rendimiento**: <200ms respuesta, virtualización de listas.
**RNF-002: Offline First**: PWA + Sync Queue.
**RNF-003: Usabilidad (Teclado)**: Zero-Mouse Policy (F1, F2, F5, ESC).
**RNF-004: Feedback Visual**: Toasts (Sonner), Sonidos.

## 3. Stack Tecnológico
- **Estado**: Zustand
- **Data**: TanStack Query
- **Formularios**: React Hook Form + Zod
- **Tablas**: TanStack Table
- **Teclado**: React-Hotkeys-Hook
- **UI**: Shadcn/UI + Tailwind
