# 🗺️ MAPEO FRONTEND → BACKEND (Spring Boot + H2 + JPA)

> Documento de referencia: mapea cada campo del modelo JavaScript del frontend
> con su correspondiente columna, tipo Java y anotación JPA.  
> Fecha de actualización: 2026-02-19

---

## 📋 RESUMEN DE ENTIDADES

| Modelo Frontend (JS)  | Entidad Java (JPA)      | Tabla H2                  | Paquete                    |
|-----------------------|-------------------------|---------------------------|----------------------------|
| `Producto.js`         | `Producto`              | `productos`               | `com.farmacia.pos.model`   |
| `Lote.js`             | `Lote`                  | `lotes`                   | `com.farmacia.pos.model`   |
| `Cliente.js`          | `Cliente`               | `clientes`                | `com.farmacia.pos.model`   |
| `Venta.js`            | `Venta`                 | `ventas`                  | `com.farmacia.pos.model`   |
| `Venta.js (detalle)`  | `DetalleVenta`          | `detalles_venta`          | `com.farmacia.pos.model`   |
| `RecetaMedica.js`     | `RecetaMedica`          | `recetas_medicas`         | `com.farmacia.pos.model`   |
| `Inventario.js`       | `MovimientoInventario`  | `movimientos_inventario`  | `com.farmacia.pos.model`   |
| `CorteCaja.js`        | `CorteCaja`             | `cortes_caja`             | `com.farmacia.pos.model`   |
| `CorteCaja.js`        | `RetiroEfectivo`        | `retiros_efectivo`        | `com.farmacia.pos.model`   |
| `Factura.js`          | `Factura`               | `facturas`                | *(implementación futura)*  |

---

## 🔗 DIAGRAMA DE RELACIONES (ER)

```
Producto (1) ─────────────── (N) Lote
    │                               
    │ (1)                           
    ├──────────────── (N) DetalleVenta ──── (0..1) RecetaMedica
    │                       │
    │                       │ (N)
    │                    Venta (1) ──────────────── (0..1) Factura
    │                       │
    │                    Cliente (N..1)
    │
    └──────────────── (N) MovimientoInventario

CorteCaja (1) ──────────── (N) RetiroEfectivo
```

### Cardinalidades
| Relación | Tipo | Estrategia |
|----------|------|------------|
| `Producto` → `Lote` | `@OneToMany` | `CascadeType.ALL`, `LAZY` |
| `Lote` → `Producto` | `@ManyToOne` | `LAZY`, FK `producto_id` |
| `Venta` → `DetalleVenta` | `@OneToMany` | `CascadeType.ALL`, `EAGER` |
| `DetalleVenta` → `Venta` | `@ManyToOne` | `LAZY`, FK `venta_id` |
| `DetalleVenta` → `RecetaMedica` | `@OneToOne` | `CascadeType.ALL`, `LAZY` |
| `DetalleVenta` → `Producto` | `@ManyToOne` | `LAZY`, FK `producto_id` |
| `DetalleVenta` → `Lote` | `@ManyToOne` | `LAZY`, FK `lote_id` |
| `Venta` → `Cliente` | `@ManyToOne` | `LAZY`, FK `cliente_id` |
| `CorteCaja` → `RetiroEfectivo` | `@OneToMany` | `CascadeType.ALL`, `LAZY` |

---

## 1️⃣ ENTIDAD: `Producto`

**Fuente JS:** `src/models/Producto.js`

### Mapeo de campos

| Campo JS (frontend)   | Campo Java (backend) | Tipo Java       | Columna H2             | Anotaciones JPA / Validación             |
|-----------------------|----------------------|-----------------|------------------------|------------------------------------------|
| `id`                  | `id`                 | `Long`          | `id` (PK, AUTO)        | `@Id @GeneratedValue(IDENTITY)`          |
| `nombre`              | `nombre`             | `String`        | `nombre`               | `@NotBlank`, `length=200`                |
| `descripcion`         | `descripcion`        | `String`        | `descripcion`          | `length=500`                             |
| `categoria`           | `categoria`          | `String`        | `categoria`            | `@NotBlank`                              |
| `precioVenta`         | `precioVenta`        | `BigDecimal`    | `precio_venta`         | `@NotNull @DecimalMin("0.01")`           |
| `precioCompra`        | `precioCompra`       | `BigDecimal`    | `precio_compra`        | default `0`                              |
| `porcentajeIVA`       | `porcentajeIva`      | `BigDecimal`    | `porcentaje_iva`       | default `16.00`                          |
| `porcentajeIEPS`      | `porcentajeIeps`     | `BigDecimal`    | `porcentaje_ieps`      | default `0`                              |
| `stockTotal`          | `stockTotal`         | `Integer`       | `stock_total`          | `@Min(0)`                                |
| `stockMinimo`         | `stockMinimo`        | `Integer`       | `stock_minimo`         | `@Min(0)`, default `10`                  |
| `stockOptimo`         | `stockOptimo`        | `Integer`       | `stock_optimo`         | `@Min(0)`, default `50`                  |
| `codigoBarras`        | `codigoBarras`       | `String`        | `codigo_barras`        | `@NotBlank @Column(unique=true)`         |
| `sku`                 | `sku`                | `String`        | `sku`                  | `@Column(unique=true)`                   |
| `laboratorio`         | `laboratorio`        | `String`        | `laboratorio`          | `length=200`                             |
| `sustanciaActiva`     | `sustanciaActiva`    | `String`        | `sustancia_activa`     | `@NotBlank`                              |
| `presentacion`        | `presentacion`       | `String`        | `presentacion`         | `length=200`                             |
| `tipoRegulacion`      | `tipoRegulacion`     | `TipoRegulacion`| `tipo_regulacion`      | `@Enumerated(STRING)`                    |
| `grupoInteraccion`    | `grupoInteraccion`   | `GrupoInteraccion`| `grupo_interaccion`  | `@Enumerated(STRING)`                    |
| `ubicacionAnaquel`    | `ubicacionAnaquel`   | `String`        | `ubicacion_anaquel`    | `length=100`                             |
| `activo`              | `activo`             | `Boolean`       | `activo`               | default `true` (soft-delete)             |
| `fechaCreacion`       | `fechaCreacion`      | `LocalDateTime` | `fecha_creacion`       | `@CreationTimestamp`, no actualizable    |
| `fechaActualizacion`  | `fechaActualizacion` | `LocalDateTime` | `fecha_actualizacion`  | `@UpdateTimestamp`                       |
| *(lotes)*             | `lotes`              | `List<Lote>`    | *(relación)*           | `@OneToMany(mappedBy="producto")`        |

### Enum `TipoRegulacion`
```java
public enum TipoRegulacion {
    VENTA_LIBRE,     // Sin receta
    ANTIBIOTICO,     // Requiere receta (RF-004)
    CONTROLADO_II,   // Narcótico grado II
    CONTROLADO_III,  // Narcótico grado III
    CONTROLADO_IV    // Narcótico grado IV
}
```

### Enum `GrupoInteraccion`
```java
public enum GrupoInteraccion {
    ANTICOAGULANTES, AINES, ANTIBIOTICOS, ANTIDEPRESIVOS,
    ANTIHIPERTENSIVOS, OPIOIDES, BENZODIACEPINAS,
    ALCOHOL_INTERACCION, NINGUNO
}
```

### Endpoint REST `/api/productos`

| Verbo    | URL                              | Acción                            | Response     |
|----------|----------------------------------|-----------------------------------|--------------|
| `GET`    | `/api/productos`                 | Listar activos                    | `200 OK`     |
| `GET`    | `/api/productos?nombre=amox`     | Buscar por nombre/sustancia       | `200 OK`     |
| `GET`    | `/api/productos/{id}`            | Obtener por ID                    | `200 / 404`  |
| `GET`    | `/api/productos/codigo/{codigo}` | Buscar por código de barras       | `200 / 404`  |
| `GET`    | `/api/productos/stock-bajo`      | Productos con stock ≤ mínimo      | `200 OK`     |
| `POST`   | `/api/productos`                 | Crear producto                    | `201 Created`|
| `PUT`    | `/api/productos/{id}`            | Actualizar producto               | `200 OK`     |
| `DELETE` | `/api/productos/{id}`            | Soft-delete (activo=false)        | `204 No Content` |

---

## 2️⃣ ENTIDAD: `Lote`

**Fuente JS:** `src/models/Lote.js`

### Mapeo de campos

| Campo JS              | Campo Java           | Tipo Java       | Columna H2             | Anotaciones                              |
|-----------------------|----------------------|-----------------|------------------------|------------------------------------------|
| `id`                  | `id`                 | `Long`          | `id` (PK)              | `@Id @GeneratedValue(IDENTITY)`          |
| `productoId`          | `producto`           | `Producto`      | `producto_id` (FK)     | `@ManyToOne @JoinColumn(nullable=false)` |
| `numeroLote`          | `numeroLote`         | `String`        | `numero_lote`          | `@NotBlank`                              |
| `fechaVencimiento`    | `fechaVencimiento`   | `LocalDate`     | `fecha_vencimiento`    | `@NotNull`                               |
| `fechaIngreso`        | `fechaIngreso`       | `LocalDate`     | `fecha_ingreso`        |                                          |
| `cantidadInicial`     | `cantidadInicial`    | `Integer`       | `cantidad_inicial`     | `@Min(1)`                                |
| `cantidadDisponible`  | `cantidadDisponible` | `Integer`       | `cantidad_disponible`  | `@Min(0)`, default `0`                   |
| `precioCompra`        | `precioCompra`       | `BigDecimal`    | `precio_compra`        | default `0`                              |
| `proveedor`           | `proveedor`          | `String`        | `proveedor`            | `length=200`                             |
| `ubicacionAnaquel`    | `ubicacionAnaquel`   | `String`        | `ubicacion_anaquel`    | `length=100`                             |
| `activo`              | `activo`             | `Boolean`       | `activo`               | default `true`                           |
| `fechaCreacion`       | `fechaCreacion`      | `LocalDateTime` | `fecha_creacion`       | `@CreationTimestamp`                     |

> ⚠️ **FEFO**: al recuperar lotes para una venta, usar `ORDER BY fecha_vencimiento ASC`
> y considerar sólo lotes con `cantidad_disponible > 0` y `activo = true`.

### Endpoint REST `/api/lotes`

| Verbo    | URL                                    | Acción                          |
|----------|----------------------------------------|---------------------------------|
| `GET`    | `/api/lotes`                           | Listar todos                    |
| `GET`    | `/api/lotes/{id}`                      | Obtener por ID                  |
| `GET`    | `/api/lotes/producto/{productoId}`     | Lotes de un producto (FEFO)     |
| `GET`    | `/api/lotes/vencidos`                  | Lotes con fecha < hoy           |
| `GET`    | `/api/lotes/proximos-vencer?dias=90`   | Lotes próximos a vencer         |
| `POST`   | `/api/lotes`                           | Crear lote                      |
| `PUT`    | `/api/lotes/{id}`                      | Actualizar lote                 |
| `DELETE` | `/api/lotes/{id}`                      | Eliminar lote                   |

---

## 3️⃣ ENTIDAD: `Cliente`

**Fuente JS:** `src/models/Cliente.js`

### Mapeo de campos

| Campo JS                 | Campo Java        | Tipo Java       | Columna H2          | Anotaciones                    |
|--------------------------|-------------------|-----------------|---------------------|--------------------------------|
| `id`                     | `id`              | `Long`          | `id` (PK)           | `@Id @GeneratedValue`          |
| `nombre`                 | `nombre`          | `String`        | `nombre`            | `@NotBlank length=100`         |
| `apellido`               | `apellido`        | `String`        | `apellido`          | `@NotBlank length=100`         |
| `email`                  | `email`           | `String`        | `email`             | `@Email length=150`            |
| `telefono`               | `telefono`        | `String`        | `telefono`          | `length=20`                    |
| `direccion`              | `direccion`       | `String`        | `direccion`         | `length=300`                   |
| `dni`                    | `dni`             | `String`        | `dni`               | `@NotBlank unique=true`        |
| `rfc`                    | `rfc`             | `String`        | `rfc`               | `length=15`                    |
| `fechaNacimiento`        | `fechaNacimiento` | `LocalDate`     | `fecha_nacimiento`  |                                |
| `tipoCliente`            | `tipoCliente`     | `TipoCliente`   | `tipo_cliente`      | `@Enumerated(STRING)`          |
| `descuento`              | `descuento`       | `BigDecimal`    | `descuento`         | `@Min(0) @Max(100)`            |
| `datosFiscales.razonSocial`    | `razonSocial`    | `String`  | `razon_social`      | `length=200`                   |
| `datosFiscales.regimenFiscal`  | `regimenFiscal`  | `String`  | `regimen_fiscal`    | `length=10` (clave SAT)        |
| `datosFiscales.domicilioFiscal`| `domicilioFiscal`| `String` | `domicilio_fiscal`  | `length=10` (código postal)    |
| `datosFiscales.usoCfdi`        | `usoCfdi`        | `String`  | `uso_cfdi`          | `length=10` (clave SAT)        |
| `activo`                 | `activo`          | `Boolean`       | `activo`            | default `true`                 |
| `fechaCreacion`          | `fechaCreacion`   | `LocalDateTime` | `fecha_creacion`    | `@CreationTimestamp`           |
| `fechaActualizacion`     | `fechaActualizacion`| `LocalDateTime`| `fecha_actualizacion`| `@UpdateTimestamp`            |

### Enum `TipoCliente`
```java
public enum TipoCliente {
    REGULAR,     // Sin descuento especial
    VIP,         // Descuento preferencial
    MAYORISTA    // Precios de mayoreo
}
```

### Endpoint REST `/api/clientes`

| Verbo    | URL                          | Acción                       |
|----------|------------------------------|------------------------------|
| `GET`    | `/api/clientes`              | Listar activos               |
| `GET`    | `/api/clientes?nombre=juan`  | Buscar por nombre/DNI        |
| `GET`    | `/api/clientes/{id}`         | Obtener por ID               |
| `GET`    | `/api/clientes/dni/{dni}`    | Buscar por DNI               |
| `POST`   | `/api/clientes`              | Crear cliente                |
| `PUT`    | `/api/clientes/{id}`         | Actualizar cliente           |
| `DELETE` | `/api/clientes/{id}`         | Soft-delete                  |

---

## 4️⃣ ENTIDADES: `Venta` + `DetalleVenta`

**Fuente JS:** `src/models/Venta.js`

### Mapeo `Venta`

| Campo JS          | Campo Java        | Tipo Java       | Columna H2         | Anotaciones                         |
|-------------------|-------------------|-----------------|--------------------|-------------------------------------|
| `id`              | `id`              | `Long`          | `id` (PK)          | `@Id @GeneratedValue`               |
| `clienteId`       | `cliente`         | `Cliente`       | `cliente_id` (FK)  | `@ManyToOne @JoinColumn`            |
| `clienteNombre`   | `clienteNombre`   | `String`        | `cliente_nombre`   | Desnormalizado para histórico        |
| `fecha`           | `fecha`           | `LocalDateTime` | `fecha`            |                                     |
| `detalles`        | `detalles`        | `List<DetalleVenta>` | *(relación)*  | `@OneToMany(cascade=ALL, EAGER)`    |
| `subtotal`        | `subtotal`        | `BigDecimal`    | `subtotal`         |                                     |
| `descuentoTotal`  | `descuentoTotal`  | `BigDecimal`    | `descuento_total`  |                                     |
| `impuesto`        | `impuesto`        | `BigDecimal`    | `impuesto`         |                                     |
| `total`           | `total`           | `BigDecimal`    | `total`            |                                     |
| `metodoPago`      | `metodoPago`      | `String`        | `metodo_pago`      | `EFECTIVO\|TARJETA\|TRANSFERENCIA`  |
| `montoPagado`     | `montoPagado`     | `BigDecimal`    | `monto_pagado`     |                                     |
| `cambio`          | `cambio`          | `BigDecimal`    | `cambio`           |                                     |
| `estado`          | `estado`          | `EstadoVenta`   | `estado`           | `@Enumerated(STRING)`               |
| `observaciones`   | `observaciones`   | `String`        | `observaciones`    | `length=500`                        |
| `usuarioId`       | `usuarioId`       | `Long`          | `usuario_id`       |                                     |

### Enum `EstadoVenta`
```java
public enum EstadoVenta {
    PENDIENTE,    // En proceso
    COMPLETADA,   // Cobrada
    CANCELADA,    // Devuelta
    EN_ESPERA     // Park/Hold (RF-005)
}
```

### Mapeo `DetalleVenta`

| Campo JS               | Campo Java            | Tipo Java         | Columna H2               | Anotaciones           |
|------------------------|-----------------------|-------------------|--------------------------|-----------------------|
| `productoId`           | `producto`            | `Producto`        | `producto_id` (FK)       | `@ManyToOne LAZY`     |
| `productoNombre`       | `productoNombre`      | `String`          | `producto_nombre`        | Desnormalizado        |
| `sustanciaActiva`      | `sustanciaActiva`     | `String`          | `sustancia_activa`       |                       |
| `loteId`               | `lote`                | `Lote`            | `lote_id` (FK)           | `@ManyToOne LAZY`     |
| `numeroLote`           | `numeroLote`          | `String`          | `numero_lote`            | Desnormalizado        |
| `fechaVencimientoLote` | `fechaVencimientoLote`| `String`          | `fecha_vencimiento_lote` | Desnormalizado        |
| `cantidad`             | `cantidad`            | `Integer`         | `cantidad`               |                       |
| `precioUnitario`       | `precioUnitario`      | `BigDecimal`      | `precio_unitario`        |                       |
| `descuento`            | `descuento`           | `BigDecimal`      | `descuento`              | default `0`           |
| `subtotal`             | `subtotal`            | `BigDecimal`      | `subtotal`               |                       |
| `tipoRegulacion`       | `tipoRegulacion`      | `TipoRegulacion`  | `tipo_regulacion`        | `@Enumerated(STRING)` |
| `recetaMedica`         | `recetaMedica`        | `RecetaMedica`    | *(relación)*             | `@OneToOne cascade`   |

### Endpoint REST `/api/ventas`

| Verbo  | URL                                             | Acción                           |
|--------|-------------------------------------------------|----------------------------------|
| `GET`  | `/api/ventas`                                   | Listar todas                     |
| `GET`  | `/api/ventas/{id}`                              | Obtener por ID                   |
| `GET`  | `/api/ventas/cliente/{clienteId}`               | Ventas de un cliente             |
| `GET`  | `/api/ventas/fecha?inicio=...&fin=...`          | Por rango de fechas (ISO 8601)   |
| `GET`  | `/api/ventas/reporte?inicio=...&fin=...`        | Reporte resumido de ventas       |
| `POST` | `/api/ventas`                                   | Crear venta (descuenta lotes)    |
| `PUT`  | `/api/ventas/{id}`                              | Actualizar (solo pendientes)     |
| `PUT`  | `/api/ventas/{id}/cancelar`                     | Cancelar venta                   |

> ✅ **Nota importante:** Al crear una venta, el backend debe:
> 1. Descontar `cantidadDisponible` del `Lote` correcto.
> 2. Actualizar `stockTotal` del `Producto`.
> 3. Registrar un `MovimientoInventario` de tipo `SALIDA`.

---

## 5️⃣ ENTIDAD: `RecetaMedica`

**Fuente JS:** `src/models/RecetaMedica.js`

### Mapeo de campos

| Campo JS           | Campo Java        | Tipo Java       | Columna H2           | Anotaciones                    |
|--------------------|-------------------|-----------------|----------------------|--------------------------------|
| `id`               | `id`              | `Long`          | `id` (PK)            | `@Id @GeneratedValue`          |
| *(detalleVentaId)* | `detalleVenta`    | `DetalleVenta`  | `detalle_venta_id`   | `@OneToOne @JoinColumn`        |
| `cedulaMedico`     | `cedulaMedico`    | `String`        | `cedula_medico`      | `length=20`                    |
| `nombreMedico`     | `nombreMedico`    | `String`        | `nombre_medico`      | `length=200`                   |
| `folioReceta`      | `folioReceta`     | `String`        | `folio_receta`       | `length=100`                   |
| `fechaReceta`      | `fechaReceta`     | `LocalDate`     | `fecha_receta`       |                                |
| `institucion`      | `institucion`     | `String`        | `institucion`        | `length=200`                   |
| `diagnostico`      | `diagnostico`     | `String`        | `diagnostico`        | `length=500`                   |
| `tipoRegulacion`   | `tipoRegulacion`  | `String`        | `tipo_regulacion`    |                                |
| `verificada`       | `verificada`      | `Boolean`       | `verificada`         | default `false`                |
| `observaciones`    | `observaciones`   | `String`        | `observaciones`      | `length=500`                   |
| `fechaCreacion`    | `fechaCreacion`   | `LocalDateTime` | `fecha_creacion`     | `@CreationTimestamp`           |

> ⚠️ **Regla de negocio (RF-004):** La receta es válida si `fechaReceta` no es
> anterior a 7 días. Verificar en el servicio antes de persistir la venta.

---

## 6️⃣ ENTIDAD: `MovimientoInventario`

**Fuente JS:** `src/models/Inventario.js`

### Mapeo de campos

| Campo JS          | Campo Java        | Tipo Java          | Columna H2           | Anotaciones                    |
|-------------------|-------------------|--------------------|----------------------|--------------------------------|
| `id`              | `id`              | `Long`             | `id` (PK)            | `@Id @GeneratedValue`          |
| `productoId`      | `producto`        | `Producto`         | `producto_id` (FK)   | `@ManyToOne LAZY`              |
| `productoNombre`  | `productoNombre`  | `String`           | `producto_nombre`    | Desnormalizado                 |
| `loteId`          | `lote`            | `Lote`             | `lote_id` (FK)       | `@ManyToOne LAZY` (opcional)   |
| `tipoMovimiento`  | `tipoMovimiento`  | `TipoMovimiento`   | `tipo_movimiento`    | `@Enumerated(STRING)` @NotNull |
| `cantidad`        | `cantidad`        | `Integer`          | `cantidad`           | `@NotNull`                     |
| `stockAnterior`   | `stockAnterior`   | `Integer`          | `stock_anterior`     |                                |
| `stockNuevo`      | `stockNuevo`      | `Integer`          | `stock_nuevo`        |                                |
| `motivo`          | `motivo`          | `String`           | `motivo`             | `length=300`                   |
| `referencia`      | `referencia`      | `String`           | `referencia`         | `length=100`                   |
| `usuario`         | `usuario`         | `String`           | `usuario`            | `length=100`                   |
| `observaciones`   | `observaciones`   | `String`           | `observaciones`      | `length=500`                   |
| `fechaCreacion`   | `fechaCreacion`   | `LocalDateTime`    | `fecha_creacion`     | `@CreationTimestamp`           |

### Enum `TipoMovimiento`
```java
public enum TipoMovimiento {
    ENTRADA,    // Recepción de mercancía
    SALIDA,     // Venta / despacho
    AJUSTE      // Corrección manual (puede ser + o -)
}
```

### Endpoint REST `/api/inventario`

| Verbo  | URL                                    | Acción                        |
|--------|----------------------------------------|-------------------------------|
| `GET`  | `/api/inventario/movimientos`          | Todos los movimientos         |
| `GET`  | `/api/inventario/movimientos/{id}`     | Movimiento por ID             |
| `GET`  | `/api/inventario/producto/{id}`        | Movimientos de un producto    |
| `POST` | `/api/inventario/entrada`              | Registrar entrada de stock    |
| `POST` | `/api/inventario/salida`               | Registrar salida manual       |
| `POST` | `/api/inventario/ajuste`               | Registrar ajuste de inventario|

---

## 7️⃣ ENTIDADES: `CorteCaja` + `RetiroEfectivo`

**Fuente JS:** `src/models/CorteCaja.js`

### Mapeo `CorteCaja`

| Campo JS               | Campo Java            | Tipo Java           | Columna H2               | Anotaciones              |
|------------------------|-----------------------|---------------------|--------------------------|--------------------------|
| `id`                   | `id`                  | `Long`              | `id` (PK)                | `@Id @GeneratedValue`    |
| `numeroCaja`           | `numeroCaja`          | `Integer`           | `numero_caja`            | default `1`              |
| `cajeroNombre`         | `cajeroNombre`        | `String`            | `cajero_nombre`          | `length=100`             |
| `fechaApertura`        | `fechaApertura`       | `LocalDateTime`     | `fecha_apertura`         |                          |
| `fechaCierre`          | `fechaCierre`         | `LocalDateTime`     | `fecha_cierre`           | nullable                 |
| `ventasEfectivo`       | `ventasEfectivo`      | `BigDecimal`        | `ventas_efectivo`        | default `0`              |
| `ventasTarjeta`        | `ventasTarjeta`       | `BigDecimal`        | `ventas_tarjeta`         | default `0`              |
| `ventasTransferencia`  | `ventasTransferencia` | `BigDecimal`        | `ventas_transferencia`   | default `0`              |
| `totalVentas`          | `totalVentas`         | `BigDecimal`        | `total_ventas`           | default `0`              |
| `fondoInicial`         | `fondoInicial`        | `BigDecimal`        | `fondo_inicial`          | default `0`              |
| `efectivoDeclarado`    | `efectivoDeclarado`   | `BigDecimal`        | `efectivo_declarado`     | default `0`              |
| `efectivoEsperado`     | `efectivoEsperado`    | `BigDecimal`        | `efectivo_esperado`      | default `0`              |
| `diferencia`           | `diferencia`          | `BigDecimal`        | `diferencia`             | default `0`              |
| `estado`               | `estado`              | `EstadoCorteCaja`   | `estado`                 | `@Enumerated(STRING)`    |
| `observaciones`        | `observaciones`       | `String`            | `observaciones`          | `length=500`             |
| `cantidadVentas`       | `cantidadVentas`      | `Integer`           | `cantidad_ventas`        | default `0`              |
| *(retiros)*            | `retiros`             | `List<RetiroEfectivo>` | *(relación)*          | `@OneToMany cascade=ALL` |

### Mapeo `RetiroEfectivo`

| Campo JS           | Campo Java     | Tipo Java       | Columna H2           | Anotaciones                    |
|--------------------|----------------|-----------------|----------------------|--------------------------------|
| `id`               | `id`           | `Long`          | `id` (PK)            | `@Id @GeneratedValue`          |
| *(corteCajaId)*    | `corteCaja`    | `CorteCaja`     | `corte_caja_id` (FK) | `@ManyToOne @JoinColumn`       |
| `monto`            | `monto`        | `BigDecimal`    | `monto`              |                                |
| `motivo`           | `motivo`       | `String`        | `motivo`             | `length=300`                   |
| `autorizadoPor`    | `autorizadoPor`| `String`        | `autorizado_por`     | `length=100`                   |
| `observaciones`    | `observaciones`| `String`        | `observaciones`      | `length=500`                   |
| `fecha`            | `fechaCreacion`| `LocalDateTime` | `fecha_creacion`     | `@CreationTimestamp`           |

### Endpoint REST `/api/corte-caja`

| Verbo  | URL                        | Acción                          |
|--------|----------------------------|---------------------------------|
| `GET`  | `/api/corte-caja/actual`   | Corte del turno actual (ABIERTO)|
| `POST` | `/api/corte-caja/cerrar`   | Cerrar turno (estado=CERRADO)   |
| `POST` | `/api/corte-caja/retiro`   | Registrar retiro de efectivo    |
| `GET`  | `/api/corte-caja/historial`| Historial de cortes             |

---

## 8️⃣ ESQUEMA SQL GENERADO POR H2

El esquema se genera automáticamente por Hibernate con `ddl-auto=create-drop`.
Si necesitas verlo manualmente, ejecuta este SQL en la consola H2:

```sql
-- Ver todas las tablas creadas
SHOW TABLES;

-- Ver estructura de una tabla
SHOW COLUMNS FROM productos;
SHOW COLUMNS FROM lotes;
SHOW COLUMNS FROM ventas;
SHOW COLUMNS FROM detalles_venta;
SHOW COLUMNS FROM clientes;
SHOW COLUMNS FROM recetas_medicas;
SHOW COLUMNS FROM movimientos_inventario;
SHOW COLUMNS FROM cortes_caja;
SHOW COLUMNS FROM retiros_efectivo;

-- Ver contenido de tablas
SELECT * FROM productos;
SELECT * FROM lotes WHERE activo = true ORDER BY fecha_vencimiento;
SELECT * FROM ventas ORDER BY fecha DESC;
SELECT dv.*, v.total
FROM detalles_venta dv JOIN ventas v ON dv.venta_id = v.id;
```

---

## 9️⃣ FLUJO COMPLETO: CREAR UNA VENTA

```
Frontend ──POST /api/ventas──▶ VentaController
                                     │
                                     ▼
                               VentaService.crear()
                                     │
                              ┌──────┴───────┐
                              │              │
                         Para cada DetalleVenta:
                              │
                        ┌─────▼──────┐
                        │ LoteRepository
                        │ .findById(loteId)
                        │ → validar cantidad
                        │ → lote.cantidadDisponible -= cantidad
                        │ → loteRepository.save()
                        └─────┬──────┘
                              │
                        ┌─────▼──────┐
                        │ ProductoRepository
                        │ → producto.stockTotal -= cantidad
                        │ → productoRepository.save()
                        └─────┬──────┘
                              │
                        ┌─────▼──────┐
                        │ MovimientoInventario
                        │ → tipo = SALIDA
                        │ → movimientoRepository.save()
                        └─────┬──────┘
                              │
                         VentaRepository.save()
                              │
                              ▼
                     ◀──── 201 Created (Venta)
```

---

## 🔟 NOTAS FINALES DE INTEGRACIÓN

### ✅ Convenciones obligatorias

| Aspecto | Convención |
|---------|-----------|
| Nombres de columnas | `snake_case` (Hibernate lo hace automático con `ddl-auto`) |
| Nombres de campos Java | `camelCase` (igual que en el frontend JS) |
| Fechas en JSON | ISO 8601: `"2026-02-19T12:00:00"` |
| Soft-delete | Usar campo `activo = false`, nunca `DELETE` físico |
| Decimales | `BigDecimal` en Java, `number` en JS (`parseFloat` antes de enviar) |
| Enums en JSON | Enviados como `String` (`@Enumerated(EnumType.STRING)`) |

### ⚠️ Errores comunes a evitar

| Error | Solución |
|-------|----------|
| `LazyInitializationException` | Agregar `@Transactional` en el servicio |
| `StackOverflowError` en serialización JSON | Agregar `@ToString.Exclude` en el lado "muchos" de la relación |
| No coinciden los nombres de campo JSON ↔ Java | Usar `@JsonProperty("nombreCampoJS")` o renombrar el campo Java |
| CORS bloqueado en el navegador | Configurar `WebConfig.java` o usar el proxy de Vite |
| H2 se reinicia entre reinicios | Es `in-memory`: cambia a `jdbc:h2:file:./datos/farmaciapos` para persistencia |

### 📌 Para persistencia entre reinicios (H2 en fichero)
```properties
# En application.properties, reemplaza la URL de H2:
spring.datasource.url=jdbc:h2:file:./datos/farmaciapos;DB_CLOSE_ON_EXIT=FALSE
spring.jpa.hibernate.ddl-auto=update
```

---

*Ver `SPRING_BOOT_INTEGRATION.md` para el código Java completo de todas las clases.*
