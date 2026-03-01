## 💊 Sistema de Punto de Venta para Farmacia

Plataforma completa de **punto de venta (POS) para farmacias**, diseñada con un **frontend moderno en React 19 + Vite 7** y un **backend robusto en Spring Boot 4 + Spring Data JPA + H2**.  

Este repositorio está pensado para demostrar **arquitectura de software, buenas prácticas y dominio de ecosistema Java / JavaScript** ante entornos empresariales, incluyendo separación clara por capas, DTOs, manejo de errores y una integración frontend–backend bien definida.

---

## 🧱 Arquitectura General

El proyecto está organizado en dos aplicaciones principales:

```text
punto-venta-farmacia/
├── frontend/    # Aplicación React + Vite (UI del POS)
└── backend/     # API REST con Spring Boot + JPA + H2
```

- **Comunicación**: el frontend consume el backend vía HTTP sobre una API REST JSON.
- **Convención de rutas**: todas las operaciones de negocio se exponen bajo el prefijo `/api/**`.
- **Entidades compartidas**: el modelo de dominio es consistente entre frontend (`src/models`) y backend (`model` + `dto`), lo que facilita la evolución funcional.

---

## 🖥️ Frontend – React 19 + Vite 7

- **Framework**: `React 19.2` con componentes funcionales y hooks.
- **Bundler / Dev Server**: `Vite 7.3` con hot reload y proxy nativo al backend.
- **Gestión de estado**:
  - `Zustand` para el estado global del carrito y lógica de negocio del POS.
  - `@tanstack/react-query` para cacheo y sincronización de datos con la API.
- **Formularios y validación**:
  - `react-hook-form` para manejo eficiente de formularios.
  - `zod` para validaciones declarativas de esquemas.
- **Experiencia de usuario**:
  - `react-hotkeys-hook` para una política **Zero-Mouse** (atajos de teclado).
  - `sonner` para notificaciones tipo toast.
  - `lucide-react` para iconografía moderna.
- **Herramientas de calidad**:
  - `eslint` + `@eslint/js` + plugins específicos para React.

### Módulos funcionales principales (UI)

Implementados como componentes React en `frontend/src/components` y stores en `frontend/src/stores`:

- **Punto de Venta** (`PuntoVenta.jsx` + `useCarritoStore.js`):
  - Búsqueda omnicanal de medicamentos (nombre, sustancia activa, código de barras, SKU).
  - Selección de lotes con estrategia FEFO (First Expired, First Out).
  - Cálculo de totales, impuestos, descuentos y cambio.
  - Manejo de ventas en espera y reanudación de tickets.
- **Catálogo de Productos** (`ProductoList.jsx`):
  - CRUD completo de medicamentos/productos.
  - Semáforo de stock (verde/amarillo/rojo) según umbrales configurados.
  - Asociación con lotes, laboratorio, regulaciones y grupos de interacción.
- **Gestión de Clientes** (`ClienteList.jsx`):
  - CRUD de clientes, tipos de cliente y descuentos.
  - Datos fiscales para facturación (RFC, régimen, uso CFDI).
- **Inventario** (`InventarioList.jsx` + modelos de inventario):
  - Registro de movimientos de inventario (entrada, salida, ajuste).
  - Trazabilidad a nivel de lote y producto.
- **Corte de Caja** (`CorteCaja.jsx`):
  - Corte del turno, cálculo de efectivo esperado vs. real.
  - Registro de retiros de efectivo y generación de historial.

### Capa de comunicación con el backend

Ubicada en `frontend/src/services`:

- Archivo central `apiConfig.js`:
  - Define `API_BASE_URL = '/api'` y el catálogo de rutas en `API_ENDPOINTS`.
  - Construye headers HTTP (`getHeaders`) con soporte preparado para **JWT** (header `Authorization` pendiente de activación).
  - Implementa `handleResponse` para manejo de errores HTTP y propagación a la UI mediante eventos globales (`CustomEvent 'api-error'`).
  - Implementa `fetchConTimeout` (timeout de 30s) para robustez ante servicios lentos.
  - Flag `USE_MOCK` para alternar entre **modo mock** (datos locales) y **modo real** (Spring Boot).
- Servicios especializados:
  - `ProductoService.js`, `ClienteService.js`, `VentaService.js`, `InventarioService.js`, `CorteCajaService.js`, `LoteService.js`, `FacturaService.js`.
  - Cada servicio compone URLs usando `API_ENDPOINTS` y centraliza las operaciones CRUD de cada agregado.

### Proxy de Vite

El archivo `frontend/vite.config.js` define un **proxy de desarrollo**:

- Puerto frontend: `5173`.
- Cualquier petición que inicie con `/api` se redirige a `http://localhost:8080`.
- Beneficio: evita problemas de CORS durante el desarrollo y mantiene URLs consistentes entre entornos.

---

## ⚙️ Backend – Spring Boot 4 + JPA + H2

El backend es una API REST construida con:

- **Spring Boot 4.0.3**
- **Java 25** (configurado vía toolchain en `build.gradle.kts`)
- **Spring Web MVC** para exponer controladores REST.
- **Spring Data JPA** como capa de persistencia.
- **Base de datos H2 en memoria** para desarrollo y pruebas (`farmaciadb`).

### Configuración de proyecto (Gradle)

Archivo `backend/build.gradle.kts`:

- Plugins:
  - `org.springframework.boot`
  - `io.spring.dependency-management`
  - Plugin `java` con **toolchain Java 25**.
- Dependencias principales:
  - `spring-boot-starter-data-jpa`
  - `spring-boot-starter-webmvc`
  - `spring-boot-h2console`
  - `com.h2database:h2`
  - Dependencias de test para JPA y Web MVC.

### Configuración de entorno (H2 y JPA)

En `backend/src/main/resources/application.properties`:

- **Servidor**:
  - `server.port=8080`
- **Base de datos H2 en memoria**:
  - URL: `jdbc:h2:mem:farmaciadb`
  - Usuario: `sa`
  - Configuración de dialecto: `org.hibernate.dialect.H2Dialect`
  - `spring.jpa.hibernate.ddl-auto=update` para mantener el esquema en desarrollo.
- **Consola H2**:
  - Habilitada en `/h2-console` para inspección rápida de datos.

### Punto de entrada

`BackendApplication.java`:

- Anotado con `@SpringBootApplication`.
- Exposición estándar de una aplicación Spring Boot, preparada para despliegue como **servicio REST**.

---

## 🏛️ Diseño por Capas en el Backend

El backend implementa una arquitectura clásica en capas:

- **Capa de Controladores (`controller`)**:
  - Expone endpoints REST bajo `/api/**`.
  - Anotaciones: `@RestController`, `@RequestMapping`, `@CrossOrigin`.
  - Se apoya en servicios para la lógica de negocio y en DTOs para desacoplar la API del modelo de persistencia.
- **Capa de Servicios (`service`)**:
  - Orquesta reglas de negocio y delega operaciones de persistencia a los repositorios.
  - Encapsula transacciones y la lógica específica de cada módulo (ventas, inventario, corte de caja, facturación, etc.).
- **Capa de Repositorios (`repository`)**:
  - Interfaces que extienden `JpaRepository` (por ejemplo, `ProductoRepository`, `ClienteRepository`, `VentaRepository`, etc.).
  - Aprovechan el query derivation de Spring Data (métodos como `findByCategoria`, `findByDni`, etc.).
- **Capa de Modelo (`model`)**:
  - Entidades JPA anotadas con `@Entity` y `@Table`, con relaciones entre agregados (por ejemplo, `Venta` ↔ `DetalleVenta`, `Producto` ↔ `Lote`, `Venta` ↔ `Cliente`, `Venta` ↔ `Factura`).
  - Uso de callbacks `@PrePersist` y `@PreUpdate` para gestionar campos de auditoría (fechas de creación/actualización).
- **Capa de DTOs (`dto`)**:
  - Objetos de transferencia que representan la vista expuesta por la API.
  - Clase helper `DTOConverter` para mapear de entidad a DTO y viceversa.

Este enfoque facilita la **evolución del modelo de dominio** sin romper contratos REST, y es alineado con prácticas de proyectos empresariales.

---

## 🌐 Principales Endpoints REST y Casos de Uso

Los controladores del backend implementan la API esperada por el frontend (ver también `frontend/src/services/apiConfig.js`):

- **Productos** (`ProductoController` – `/api/productos`):
  - `GET /api/productos` → listado general (con soporte para filtros por nombre en la capa de servicio).
  - `GET /api/productos/{id}` → detalle de un producto.
  - `GET /api/productos/codigo/{codigo}` → búsqueda por código de barras.
  - `GET /api/productos/categoria/{categoria}` → filtrado por categoría.
  - `POST /api/productos` → alta de producto.
  - `PUT /api/productos/{id}` → actualización.
  - `DELETE /api/productos/{id}` → borrado (lógico o físico según la capa de repositorio).

- **Clientes** (`ClienteController` – `/api/clientes`):
  - `GET /api/clientes?activo=true` → clientes activos.
  - `GET /api/clientes/{id}` → detalle.
  - `GET /api/clientes/dni/{dni}` → búsqueda por DNI.
  - `POST`, `PUT`, `DELETE` para CRUD completo.

- **Ventas** (`VentaController` – `/api/ventas`):
  - `GET /api/ventas` → listado de ventas.
  - `GET /api/ventas/{id}` → detalle incluyendo `DetalleVenta`.
  - `GET /api/ventas/cliente/{clienteId}` → ventas por cliente.
  - `POST /api/ventas` → creación de venta con sus detalles.
  - `PUT /api/ventas/{id}` y `DELETE /api/ventas/{id}` → actualización y eliminación.
  - La capa de DTOs asegura que se serializan correctamente ventas con su colección de detalles.

- **Inventario** (`InventarioController` – `/api/inventario`):
  - `GET /api/inventario/movimientos` → historial de movimientos de inventario.
  - `GET /api/inventario/movimientos/{id}` → detalle de un movimiento.
  - `GET /api/inventario/producto/{prodId}` → movimientos por producto.
  - `POST /api/inventario/entrada` → registrar entrada.
  - `POST /api/inventario/salida` → registrar salida.
  - `POST /api/inventario/ajuste` → registrar ajuste.
  - El controlador traduce entre `MovimientoInventarioDTO` y la entidad, asociando producto y lote cuando corresponda.

- **Lotes** (`LoteController` – `/api/lotes`):
  - Operaciones CRUD estándar.
  - Endpoints específicos por `productoId` para soportar la lógica FEFO del frontend.

- **Corte de caja** (`CorteCajaController` – `/api/corte-caja`):
  - `GET /api/corte-caja/actual` → estado del corte abierto.
  - `POST /api/corte-caja/cerrar` → cierre del corte de caja.
  - `POST /api/corte-caja/retiro` → registro de retiros de efectivo.
  - `GET /api/corte-caja/historial` → historial de cortes.

- **Facturas (CFDI)** (`FacturaController` – `/api/facturas`):
  - `GET /api/facturas`, `GET /api/facturas/{id}` → consulta de facturas.
  - `GET /api/facturas/venta/{ventaId}` → facturas asociadas a una venta.
  - `POST /api/facturas` → creación de factura en estado `PENDIENTE`.
  - `POST /api/facturas/{id}/timbrar` → transición a estado `TIMBRADA` con marca de tiempo.
  - `POST /api/facturas/{id}/cancelar` → transición a estado `CANCELADA`.

Esta API soporta todos los requerimientos funcionales descritos en el README del `frontend` (búsqueda omnicanal, FEFO, corte de caja, facturación, etc.).

---

## 🗃️ Modelo de Datos en el Backend (Resumen)

Las entidades JPA modelan el dominio de una farmacia:

- **Producto**:
  - Campos clave: nombre, descripción, categoría, precios de compra/venta, impuestos (IVA/IEPS), stock total, stock mínimo y óptimo, código de barras, SKU, laboratorio, sustancia activa, tipo de regulación, grupo de interacción, ubicación en anaquel.
  - Auditoría: `fechaCreacion`, `fechaActualizacion` administradas con `@PrePersist` y `@PreUpdate`.
- **Cliente**, **Venta**, **DetalleVenta**, **Lote**, **MovimientoInventario**, **CorteCaja**, **RetiroEfectivo**, **RecetaMedica**, **Factura**:
  - Representan los agregados descritos en el frontend (`src/models`), manteniendo consistencia de campos entre capa de presentación y de persistencia.
  - Las relaciones permiten navegar desde ventas a sus detalles, cliente y facturas asociadas.

Este diseño permite cubrir:

- Trazabilidad de inventario a nivel de lote.
- Control de medicamentos regulados mediante recetas médicas.
- Consolidación de información para facturación e integración futura con timbrado real ante el SAT.

---

## 🔄 Flujo Frontend–Backend

1. **El usuario opera en la UI React** (POS, catálogo, inventario, corte de caja).
2. La UI dispara acciones sobre **stores de Zustand** y hooks de React Query.
3. Los servicios del frontend llaman a `fetchConTimeout` con URLs construidas desde `API_ENDPOINTS` y `API_BASE_URL` (`/api/...`).
4. Vite intercepta las llamadas y, mediante el proxy, las redirige al backend Spring Boot (`http://localhost:8080`).
5. Los **controladores Spring** reciben la petición, delegan a la capa de servicios, que a su vez interactúa con los repositorios JPA/H2.
6. El resultado se mapea a **DTOs**, que se serializan como JSON y se devuelven al frontend.
7. `handleResponse` procesa las respuestas, lanza eventos de error cuando es necesario y los datos se reflejan en la UI a través de React Query/Zustand.

---

## 🧪 Pruebas y Calidad

- El backend incluye configuración de pruebas con:
  - `spring-boot-starter-data-jpa-test`
  - `spring-boot-starter-webmvc-test`
  - `JUnit Platform` configurado en Gradle.
- El frontend se valida con:
  - `eslint` y reglas específicas para React Hooks y React Refresh.
- El diseño del código favorece:
  - Separación de responsabilidades por capas.
  - Uso de DTOs para evitar exponer entidades directamente.
  - Centralización del manejo de errores en `apiConfig.js`.

---

## 🚀 Cómo Ejecutar el Proyecto (Vista General)

> Nota: los comandos se describen para referencia, pero **no es necesario ejecutarlos** para entender la arquitectura.

- **Requisitos generales**:
  - Node.js 18+ y npm 9+.
  - JDK 21+ (compatibilidad hacia arriba con toolchain Java 25) y Gradle/Maven wrapper.

1. **Backend (Spring Boot)**  
   Desde la carpeta `backend`:
   - Construir/ejecutar la aplicación Spring Boot (por ejemplo, usando el wrapper Gradle).
   - El servicio quedará expuesto en `http://localhost:8080`.

2. **Frontend (React + Vite)**  
   Desde la carpeta `frontend`:
   - Instalar dependencias con npm.
   - Levantar el servidor de desarrollo de Vite.
   - Acceder a `http://localhost:5173` en el navegador.

3. **Modo mock vs. modo real**:
   - `USE_MOCK = true` en `frontend/src/services/apiConfig.js` → sin dependencia de backend, usando datos locales.
   - `USE_MOCK = false` → el frontend consume el backend Spring Boot real.

---

## 🎯 Enfoque y Alcance Profesional

Este proyecto demuestra:

- **Dominio de stack completo**:
  - Frontend moderno en React 19 con tooling actual (Vite 7, React Query, Zustand, validación con Zod).
  - Backend empresarial en Spring Boot 4 con arquitectura en capas, JPA, H2 y DTOs.
- **Buenas prácticas de diseño**:
  - Separación clara entre modelos de dominio, DTOs, servicios y controladores.
  - Manejo centralizado de errores y timeouts en el cliente.
  - Uso de flags de configuración (`USE_MOCK`) para facilitar ambientes de desarrollo/pruebas.
- **Modelo de dominio realista** para una farmacia:
  - Inventario por lotes con FEFO.
  - Medicamentos controlados y recetas médicas.
  - Corte de caja, retiros y facturación CFDI.

Está preparado para ser extendido con:

- Autenticación y autorización con Spring Security + JWT.
- Integración con proveedores de timbrado CFDI reales.
- Persistencia en bases de datos relacionales productivas (PostgreSQL, MySQL, etc.) reemplazando H2.

