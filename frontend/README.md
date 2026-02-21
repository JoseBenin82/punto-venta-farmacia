# 💊 Sistema de Punto de Venta para Farmacia

Sistema completo de punto de venta (POS) para farmacias, desarrollado con **React 19 + Vite 7**, diseñado para integrarse con un backend **Spring Boot + JPA + H2**.

---

## 🚀 Características Implementadas

### Módulos del Sistema

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| 🛒 **Punto de Venta** | Terminal de venta completa con búsqueda omnicanal | ✅ Completo |
| 💊 **Catálogo de Productos** | CRUD con control de lotes y semáforo de stock | ✅ Completo |
| 👥 **Gestión de Clientes** | CRUD con búsqueda rápida y tipo de cliente | ✅ Completo |
| 📦 **Inventario** | Registro de movimientos (entrada, salida, ajuste) | ✅ Completo |
| 📊 **Corte de Caja** | Cierre de turno con control de efectivo | ✅ Completo |

### Funcionalidades Avanzadas (SRS)

- **RF-001 Búsqueda Omnicanal**: por nombre, sustancia activa, código de barras (EAN/UPC), SKU. Auto-selección en escaneo de código de barras.
- **RF-002 Selección FEFO**: los lotes se ordenan por vencimiento más próximo. Modal de selección manual disponible.
- **RF-003 Farmacovigilancia**: alerta de interacciones medicamentosas con clasificación de severidad, semáforo de stock (VERDE/AMARILLO/ROJO).
- **RF-004 Medicamentos Controlados**: captura obligatoria de receta médica (cédula, folio, fecha, validez 7 días) para antibióticos y controlados.
- **RF-005 Operaciones de Caja**: poner en espera / recuperar ventas (Park/Hold), retiro de efectivo con PIN de supervisor, alerta configurable de límite de efectivo.
- **RF-009 Facturación CFDI**: modelo `Factura.js` con catálogos de régimen fiscal y uso CFDI del SAT.
- **Zero-Mouse Policy**: atajos de teclado F1 (cobrar), F2 (búsqueda), F5 (espera), ESC (cancelar/cerrar).

---

## 🏗️ Arquitectura del Proyecto

```
frontend/
├── public/
├── src/
│   ├── models/                    # Clases de dominio
│   │   ├── Producto.js            # Producto/Medicamento con semáforo de stock
│   │   ├── Lote.js                # Lote con lógica FEFO (vencimiento, caducidad)
│   │   ├── Cliente.js             # Cliente con tipo y descuento
│   │   ├── Venta.js               # Venta y DetalleVenta
│   │   ├── Inventario.js          # MovimientoInventario
│   │   ├── CorteCaja.js           # CorteCaja y RetiroEfectivo
│   │   ├── Factura.js             # Factura CFDI con catálogos SAT
│   │   └── RecetaMedica.js        # Receta médica (RF-004)
│   │
│   ├── services/                  # Capa de comunicación con la API REST
│   │   ├── apiConfig.js           # URL base, endpoints, headers, timeout, USE_MOCK
│   │   ├── mockData.js            # Datos de prueba para modo sin backend
│   │   ├── ProductoService.js     # CRUD productos + búsquedas
│   │   ├── ClienteService.js      # CRUD clientes + búsquedas
│   │   ├── VentaService.js        # CRUD ventas + reportes
│   │   ├── InventarioService.js   # Movimientos de inventario
│   │   ├── CorteCajaService.js    # Corte de caja y retiros
│   │   ├── LoteService.js         # CRUD lotes + consultas de vencimiento
│   │   └── FacturaService.js      # Facturas CFDI (timbrado y cancelación)
│   │
│   ├── stores/                    # Estado global (Zustand)
│   │   └── useCarritoStore.js     # Store del carrito: FEFO, interacciones, efectivo
│   │
│   ├── utils/                     # Utilidades
│   │   ├── interaccionesMedicamentosas.js  # Matriz de interacciones por grupo
│   │   └── sonidos.js             # Feedback de audio en operaciones
│   │
│   ├── components/                # Componentes React
│   │   ├── PuntoVenta.jsx         # Terminal de venta (componente principal)
│   │   ├── PuntoVenta.css
│   │   ├── ProductoList.jsx       # Catálogo con modal de lotes
│   │   ├── ProductoList.css
│   │   ├── ClienteList.jsx        # Gestión de clientes
│   │   ├── ClienteList.css
│   │   ├── InventarioList.jsx     # Registro de movimientos
│   │   ├── InventarioList.css
│   │   ├── CorteCaja.jsx          # Módulo de cierre de turno
│   │   └── CorteCaja.css
│   │
│   ├── App.jsx                    # Navegación principal entre módulos
│   ├── App.css
│   ├── index.css                  # Estilos globales y tokens CSS
│   └── main.jsx                   # Punto de entrada React
│
├── MAPEO_BACKEND_SPRINGBOOT.md    # Mapeo Frontend ↔ Entidades JPA
├── SPRING_BOOT_INTEGRATION.md     # Guía de implementación del backend
├── vite.config.js                 # Config de Vite con proxy al backend
├── package.json
└── README.md
```

---

## 📋 Modelos de Datos

### Producto
```javascript
{
  id: number,
  nombre: string,               // Nombre comercial
  descripcion: string,
  categoria: string,            // Ej: "Antibióticos", "Analgésicos"
  precioVenta: number,
  precioCompra: number,
  porcentajeIVA: number,        // Ej: 16
  porcentajeIEPS: number,       // Ej: 0 (medicamentos exentos)
  stockTotal: number,           // Suma de cantidadDisponible en lotes
  stockMinimo: number,
  stockOptimo: number,
  codigoBarras: string,         // EAN-13
  sku: string,
  laboratorio: string,
  sustanciaActiva: string,      // Principio activo (DCI)
  presentacion: string,         // "Cápsulas 500mg", "Jarabe 120ml"
  tipoRegulacion: string,       // VENTA_LIBRE | ANTIBIOTICO | CONTROLADO_IV | CONTROLADO_II | CONTROLADO_III
  grupoInteraccion: string,     // Para farmacovigilancia
  ubicacionAnaquel: string,
  activo: boolean,
  lotes: Lote[]
}
```

### Lote
```javascript
{
  id: number,
  productoId: number,
  numeroLote: string,
  fechaVencimiento: string,     // YYYY-MM-DD
  fechaEntrada: string,
  cantidadOriginal: number,
  cantidadDisponible: number,
  precioCompra: number,
  proveedor: string,
  ubicacionAnaquel: string,
  activo: boolean
}
```

### Venta
```javascript
{
  id: number,
  clienteId: number,
  clienteNombre: string,
  fecha: string,                // ISO 8601
  detalles: DetalleVenta[],
  subtotal: number,
  descuentoTotal: number,
  impuesto: number,
  total: number,
  metodoPago: string,           // EFECTIVO | TARJETA | TRANSFERENCIA
  montoPagado: number,
  cambio: number,
  estado: string,               // COMPLETADA | CANCELADA | PENDIENTE | EN_ESPERA
  observaciones: string,
  usuarioId: number
}
```

### DetalleVenta
```javascript
{
  productoId: number,
  productoNombre: string,
  sustanciaActiva: string,
  loteId: number,
  numeroLote: string,
  fechaVencimientoLote: string,
  cantidad: number,
  precioUnitario: number,
  descuento: number,
  subtotal: number,
  tipoRegulacion: string,
  recetaMedica: RecetaMedica | null
}
```

### Cliente
```javascript
{
  id: number,
  nombre: string,
  apellido: string,
  email: string,
  telefono: string,
  direccion: string,
  dni: string,
  rfc: string,
  fechaNacimiento: string,
  tipoCliente: string,          // REGULAR | VIP | MAYORISTA
  descuento: number,            // 0-100
  activo: boolean,
  datosFiscales: {
    razonSocial: string,
    regimenFiscal: string,
    domicilioFiscal: string,
    usoCfdi: string
  }
}
```

### MovimientoInventario
```javascript
{
  id: number,
  productoId: number,
  productoNombre: string,
  loteId: number,
  tipoMovimiento: string,       // ENTRADA | SALIDA | AJUSTE
  cantidad: number,
  stockAnterior: number,
  stockNuevo: number,
  motivo: string,
  referencia: string,
  usuario: string,
  fecha: string,
  observaciones: string
}
```

---

## 🔌 Integración con Spring Boot

### Prerrequisitos
- Backend Spring Boot corriendo en `http://localhost:8080`
- CORS habilitado en el backend para `http://localhost:5173` (o usar el proxy de Vite)

### Modo de operación

| Flag | Valor | Comportamiento |
|------|-------|----------------|
| `USE_MOCK` en `apiConfig.js` | `true` | Datos locales de prueba (mockData.js) |
| `USE_MOCK` en `apiConfig.js` | `false` | Llamadas reales al backend Spring Boot |

> **Actualmente:** `USE_MOCK = false` → el frontend intentará conectarse al backend.

### Proxy de Vite (sin CORS)

`vite.config.js` está configurado para redirigir automáticamente todas las peticiones `/api/*` al backend:

```
Frontend (localhost:5173) → Vite proxy → Backend (localhost:8080)
```

No necesitas habilitar CORS en el backend si usas el proxy durante el desarrollo.

### Endpoints REST esperados

#### Productos
| Método | Endpoint | Acción |
|--------|----------|--------|
| GET | `/api/productos` | Listar todos |
| GET | `/api/productos/{id}` | Obtener por ID |
| GET | `/api/productos/codigo/{codigo}` | Buscar por código de barras |
| GET | `/api/productos/categoria/{cat}` | Filtrar por categoría |
| GET | `/api/productos/stock-bajo` | Productos con stock bajo |
| GET | `/api/productos?nombre={q}` | Buscar por nombre/sustancia |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/{id}` | Actualizar producto |
| DELETE | `/api/productos/{id}` | Eliminar (soft-delete) |

#### Lotes
| Método | Endpoint | Acción |
|--------|----------|--------|
| GET | `/api/lotes` | Listar todos |
| GET | `/api/lotes/{id}` | Obtener por ID |
| GET | `/api/lotes/producto/{productoId}` | Lotes de un producto |
| GET | `/api/lotes/vencidos` | Lotes caducados |
| GET | `/api/lotes/proximos-vencer?dias=90` | Próximos a vencer |
| POST | `/api/lotes` | Crear lote |
| PUT | `/api/lotes/{id}` | Actualizar lote |
| DELETE | `/api/lotes/{id}` | Eliminar lote |

#### Clientes
| Método | Endpoint | Acción |
|--------|----------|--------|
| GET | `/api/clientes` | Listar todos |
| GET | `/api/clientes/{id}` | Obtener por ID |
| GET | `/api/clientes/dni/{dni}` | Buscar por DNI |
| GET | `/api/clientes?nombre={q}` | Buscar por nombre |
| GET | `/api/clientes?activo=true` | Solo activos |
| POST | `/api/clientes` | Crear cliente |
| PUT | `/api/clientes/{id}` | Actualizar cliente |
| DELETE | `/api/clientes/{id}` | Eliminar (soft-delete) |

#### Ventas
| Método | Endpoint | Acción |
|--------|----------|--------|
| GET | `/api/ventas` | Listar todas |
| GET | `/api/ventas/{id}` | Obtener por ID |
| GET | `/api/ventas/cliente/{clienteId}` | Ventas de un cliente |
| GET | `/api/ventas/fecha?inicio=&fin=` | Ventas en rango de fecha |
| GET | `/api/ventas/reporte?inicio=&fin=` | Reporte de ventas |
| POST | `/api/ventas` | Crear venta |
| PUT | `/api/ventas/{id}` | Actualizar venta |
| PUT | `/api/ventas/{id}/cancelar` | Cancelar venta |

#### Inventario
| Método | Endpoint | Acción |
|--------|----------|--------|
| GET | `/api/inventario/movimientos` | Todos los movimientos |
| GET | `/api/inventario/movimientos/{id}` | Movimiento por ID |
| GET | `/api/inventario/producto/{productoId}` | Movimientos de un producto |
| POST | `/api/inventario/entrada` | Registrar entrada |
| POST | `/api/inventario/salida` | Registrar salida |
| POST | `/api/inventario/ajuste` | Registrar ajuste |

#### Corte de Caja
| Método | Endpoint | Acción |
|--------|----------|--------|
| GET | `/api/corte-caja/actual` | Corte activo del turno |
| POST | `/api/corte-caja/cerrar` | Cerrar turno |
| POST | `/api/corte-caja/retiro` | Registrar retiro de efectivo |
| GET | `/api/corte-caja/historial` | Historial de cortes |

#### Facturas (CFDI)
| Método | Endpoint | Acción |
|--------|----------|--------|
| GET | `/api/facturas` | Listar todas |
| GET | `/api/facturas/{id}` | Obtener por ID |
| GET | `/api/facturas/venta/{ventaId}` | Facturas de una venta |
| POST | `/api/facturas` | Solicitar factura |
| PUT | `/api/facturas/{id}/timbrar` | Timbrar ante SAT |
| PUT | `/api/facturas/{id}/cancelar` | Cancelar factura |

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 19.2.0 | UI framework |
| Vite | 7.3.1 | Build tool + dev server con proxy |
| Zustand | 5.x | Estado global del carrito |
| TanStack React Query | 5.x | Cache y sincronización de datos |
| React Hook Form | 7.x | Formularios con validación |
| Zod | 4.x | Validación de esquemas |
| react-hotkeys-hook | 4.x | Atajos de teclado (Zero-Mouse) |
| lucide-react | 0.263 | Iconografía |
| sonner | 2.x | Notificaciones toast |
| Fetch API (nativa) | - | Comunicación HTTP con backend |

---

## 📦 Instalación y Uso

### Prerrequisitos
- Node.js 18+ (recomendado 20+)
- npm 9+

### Instalación
```bash
# Clonar e instalar dependencias
npm install
```

### Desarrollo (con backend)
```bash
# Asegúrate de que el backend Spring Boot esté corriendo en puerto 8080
# Luego inicia el frontend:
npm run dev
```
El servidor de desarrollo estará en `http://localhost:5173`.

Las peticiones `/api/*` se redirigen automáticamente a `http://localhost:8080` gracias al proxy de Vite.

### Desarrollo (sin backend — modo mock)
```bash
# En src/services/apiConfig.js, cambia:
export const USE_MOCK = true;

# Luego inicia el frontend:
npm run dev
```

### Compilar para producción
```bash
npm run build
npm run preview
```

> ⚠️ En producción, configura `API_BASE_URL` apuntando al servidor real y desactiva el proxy de Vite.

---

## 🏛️ Entidades JPA Sugeridas (Spring Boot)

```java
// Archivo: SPRING_BOOT_INTEGRATION.md
// Contiene ejemplos completos de entidades, repositorios y controladores
```

Ver el archivo **`SPRING_BOOT_INTEGRATION.md`** para el código completo del backend.

### Dependencias Maven necesarias
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### application.properties
```properties
server.port=8080
spring.datasource.url=jdbc:h2:mem:farmacias_pos;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# CORS — permite peticiones desde el frontend en desarrollo
# Alternativa: usar @CrossOrigin(origins = "*") en los controladores
```

---

## 🔐 Validaciones Implementadas

### Producto
- Nombre comercial obligatorio
- Sustancia activa obligatoria
- Categoría obligatoria
- Precio de venta > 0
- Stock mínimo ≥ 0, Óptimo ≥ Mínimo
- Código de barras obligatorio

### Lote
- Número de lote obligatorio
- Fecha de vencimiento obligatoria y futura
- Cantidad > 0

### Cliente
- Nombre y apellido obligatorios
- DNI obligatorio (formato válido)
- Email con formato válido
- Teléfono con 10 dígitos

### Venta
- Al menos un producto en el carrito
- Total > 0
- Productos con receta: receta completada y válida (≤ 7 días)
- Productos con lote caducado: bloqueados

### Receta Médica
- Cédula profesional obligatoria
- Nombre del médico obligatorio
- Folio de receta obligatorio
- Fecha de receta: no futura, no mayor a 7 días

### Factura
- RFC del receptor obligatorio y válido
- Razón social obligatoria
- Régimen fiscal obligatorio
- Domicilio fiscal (código postal) obligatorio
- Total > 0

---

## 📝 Notas de Integración

### Estado actual
| Aspecto | Estado |
|---------|--------|
| `USE_MOCK` | `false` — listo para backend |
| Proxy Vite → Backend | Configurado en `vite.config.js` |
| Endpoints definidos | Completos en `apiConfig.js` |
| Servicios | Todos reescritos con `fetchConTimeout` |
| Modelos + DTOs | Implementados en `src/models/` |
| Autenticación JWT | **Pendiente** — ver comentario en `apiConfig.js` |
| Impresión de tickets | **Pendiente** — requiere `react-to-print` |

### Para conectar el backend
1. Implementar los controladores REST con los endpoints listados arriba.
2. Arrancar el backend: `mvn spring-boot:run` (puerto 8080).
3. Arrancar el frontend: `npm run dev` (puerto 5173).
4. El proxy de Vite redirige `/api/*` → `localhost:8080` sin CORS.

### Para volver a modo mock
```js
// src/services/apiConfig.js
export const USE_MOCK = true;
```

---

## 🚀 Próximos Pasos

1. **Backend Spring Boot**: implementar controladores y repositorios de todos los módulos.
2. **Autenticación JWT**: agregar `spring-security` en backend y descomenta el header `Authorization` en `apiConfig.js`.
3. **Reportes visuales**: gráficas de ventas por período (recharts o chart.js).
4. **Impresión de tickets**: integrar `react-to-print`.
5. **Notificaciones en tiempo real**: WebSocket con SockJS + STOMP para alertas de stock bajo.
6. **PWA / Offline-first**: service worker con workbox para operar sin conexión.

---

## 📄 Licencia

Proyecto educativo desarrollado como sistema de punto de venta para farmacias.

## 👨‍💻 Proyecto

Desarrollado como parte del Módulo 5 — BEDU. Sistema de Punto de Venta para Farmacias con integración Spring Boot.
