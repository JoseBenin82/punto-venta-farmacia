# 🍃 SPRING BOOT BACKEND — Guía Completa de Implementación

> Basado en el análisis del frontend React (modelos, servicios y endpoints).
> Stack: **Spring Boot 3.x · Spring Data JPA · H2 · Lombok · Validation · Arquitectura DTO**

---

## 🏗️ ARQUITECTURA DE DATOS (DTOs) IMPLEMENTADA
Para dotar al Backend de un grado "Enterprise", evitar la Recursividad por Relaciones y mantener una separación estricta de responsabilidades entre la Base de datos (Entities) y la API REST que consume React, se ha optado por implementar el patrón **Data Transfer Object (DTO)** apoyado del conversor `DTOConverter`.
- **`ProductoDTO`, `ClienteDTO`, `VentaDTO`, `DetalleVentaDTO`**: Todos coinciden exactamente en tipos y nombres omitiendo lógicas internas y anotaciones `@Id` extra, acoplandose al método `fromDTO` alojado en los `service` de React.
- **Controladores**: Como `VentaController` ya devuelven `ResponseEntity<List<VentaDTO>>` en vez de variables genéricas u optimistas.

---

## 1. ESTRUCTURA DE PAQUETES

```text
src/main/java/com/farmacia/pos/
├── FarmaciaPosApplication.java
├── config/
│   └── WebConfig.java              ← CORS
├── model/                          ← Entidades JPA
│   ├── enums/
│   │   ├── TipoRegulacion.java
│   │   ├── GrupoInteraccion.java
│   │   ├── TipoMovimiento.java
│   │   └── EstadoVenta.java
│   ├── Producto.java
│   ├── Lote.java
│   ├── Cliente.java
│   ├── Venta.java
│   ├── DetalleVenta.java
│   ├── RecetaMedica.java
│   ├── MovimientoInventario.java
│   ├── CorteCaja.java
│   └── RetiroEfectivo.java
├── repository/
│   ├── ProductoRepository.java
│   ├── LoteRepository.java
│   ├── ClienteRepository.java
│   ├── VentaRepository.java
│   ├── MovimientoInventarioRepository.java
│   └── CorteCajaRepository.java
├── service/
│   ├── ProductoService.java
│   ├── LoteService.java
│   ├── ClienteService.java
│   ├── VentaService.java
│   ├── InventarioService.java
│   └── CorteCajaService.java
└── controller/
    ├── ProductoController.java
    ├── LoteController.java
    ├── ClienteController.java
    ├── VentaController.java
    ├── InventarioController.java
    └── CorteCajaController.java

src/main/resources/
├── application.properties
└── data.sql                        ← Datos iniciales (opcional)
```

---

## 2. DEPENDENCIAS — `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <groupId>com.farmacia</groupId>
    <artifactId>pos</artifactId>
    <version>1.0.0</version>
    <name>Farmacia POS Backend</name>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Web REST -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!-- JPA + Hibernate -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <!-- H2 Base de datos en memoria -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <!-- Validaciones (@NotBlank, @NotNull, etc.) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <!-- Lombok (reduce boilerplate) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <!-- Tests -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

---

## 3. CONFIGURACIÓN — `application.properties`

```properties
# ── Servidor ──────────────────────────────────────────
server.port=8080

# ── H2 Base de datos en memoria ───────────────────────
spring.datasource.url=jdbc:h2:mem:farmaciapos;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# ── JPA / Hibernate ───────────────────────────────────
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# ── Consola web H2 (ver tablas en el navegador) ───────
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# ── Serialización JSON ────────────────────────────────
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.date-format=yyyy-MM-dd'T'HH:mm:ss
```

> 🌐 Consola H2: `http://localhost:8080/h2-console`  
> JDBC URL: `jdbc:h2:mem:farmaciapos`

---

## 4. CLASE PRINCIPAL

```java
// FarmaciaPosApplication.java
package com.farmacia.pos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FarmaciaPosApplication {
    public static void main(String[] args) {
        SpringApplication.run(FarmaciaPosApplication.class, args);
    }
}
```

---

## 5. CORS — `WebConfig.java`

```java
package com.farmacia.pos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:5173",  // Vite dev server
                    "http://localhost:3000"   // alternativo
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
```

---

## 6. ENUMS

```java
// TipoRegulacion.java
package com.farmacia.pos.model.enums;

public enum TipoRegulacion {
    VENTA_LIBRE,
    ANTIBIOTICO,
    CONTROLADO_II,
    CONTROLADO_III,
    CONTROLADO_IV
}
```

```java
// GrupoInteraccion.java
package com.farmacia.pos.model.enums;

public enum GrupoInteraccion {
    ANTICOAGULANTES, AINES, ANTIBIOTICOS, ANTIDEPRESIVOS,
    ANTIHIPERTENSIVOS, OPIOIDES, BENZODIACEPINAS,
    ALCOHOL_INTERACCION, NINGUNO
}
```

```java
// TipoMovimiento.java
package com.farmacia.pos.model.enums;

public enum TipoMovimiento {
    ENTRADA, SALIDA, AJUSTE
}
```

```java
// EstadoVenta.java
package com.farmacia.pos.model.enums;

public enum EstadoVenta {
    PENDIENTE, COMPLETADA, CANCELADA, EN_ESPERA
}
```

```java
// TipoCliente.java
package com.farmacia.pos.model.enums;

public enum TipoCliente {
    REGULAR, VIP, MAYORISTA
}
```

```java
// EstadoCorteCaja.java
package com.farmacia.pos.model.enums;

public enum EstadoCorteCaja {
    ABIERTO, CERRADO
}
```

---

## 7. ENTIDADES JPA

### `Producto.java`

```java
package com.farmacia.pos.model;

import com.farmacia.pos.model.enums.GrupoInteraccion;
import com.farmacia.pos.model.enums.TipoRegulacion;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre comercial es obligatorio")
    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @NotBlank(message = "La categoría es obligatoria")
    @Column(nullable = false)
    private String categoria;

    @NotNull
    @DecimalMin(value = "0.01", message = "El precio de venta debe ser mayor a 0")
    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @DecimalMin(value = "0.0")
    @Column(name = "precio_compra", precision = 10, scale = 2)
    private BigDecimal precioCompra = BigDecimal.ZERO;

    @Column(name = "porcentaje_iva", precision = 5, scale = 2)
    private BigDecimal porcentajeIva = new BigDecimal("16.00");

    @Column(name = "porcentaje_ieps", precision = 5, scale = 2)
    private BigDecimal porcentajeIeps = BigDecimal.ZERO;

    @Min(value = 0)
    @Column(name = "stock_total")
    private Integer stockTotal = 0;

    @Min(value = 0)
    @Column(name = "stock_minimo")
    private Integer stockMinimo = 10;

    @Min(value = 0)
    @Column(name = "stock_optimo")
    private Integer stockOptimo = 50;

    @NotBlank(message = "El código de barras es obligatorio")
    @Column(name = "codigo_barras", nullable = false, unique = true, length = 50)
    private String codigoBarras;

    @Column(unique = true, length = 50)
    private String sku;

    @Column(length = 200)
    private String laboratorio;

    @NotBlank(message = "La sustancia activa es obligatoria")
    @Column(name = "sustancia_activa", nullable = false)
    private String sustanciaActiva;

    @Column(length = 200)
    private String presentacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_regulacion")
    private TipoRegulacion tipoRegulacion = TipoRegulacion.VENTA_LIBRE;

    @Enumerated(EnumType.STRING)
    @Column(name = "grupo_interaccion")
    private GrupoInteraccion grupoInteraccion = GrupoInteraccion.NINGUNO;

    @Column(name = "ubicacion_anaquel", length = 100)
    private String ubicacionAnaquel;

    @Column(nullable = false)
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // RELACIÓN: un producto tiene muchos lotes
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Lote> lotes = new ArrayList<>();
}
```

### `Lote.java`

```java
package com.farmacia.pos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lotes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @ToString.Exclude
    private Producto producto;

    @NotBlank
    @Column(name = "numero_lote", nullable = false, length = 100)
    private String numeroLote;

    @NotNull
    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    @Min(1)
    @Column(name = "cantidad_inicial")
    private Integer cantidadInicial;

    @Min(0)
    @Column(name = "cantidad_disponible")
    private Integer cantidadDisponible = 0;

    @Column(name = "precio_compra", precision = 10, scale = 2)
    private BigDecimal precioCompra = BigDecimal.ZERO;

    @Column(length = 200)
    private String proveedor;

    @Column(name = "ubicacion_anaquel", length = 100)
    private String ubicacionAnaquel;

    @Column(nullable = false)
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
```

### `Cliente.java`

```java
package com.farmacia.pos.model;

import com.farmacia.pos.model.enums.TipoCliente;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String apellido;

    @Email
    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(length = 300)
    private String direccion;

    @NotBlank
    @Column(nullable = false, unique = true, length = 20)
    private String dni;

    @Column(length = 15)
    private String rfc;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cliente")
    private TipoCliente tipoCliente = TipoCliente.REGULAR;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    @Column(precision = 5, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    // Datos fiscales para facturación CFDI
    @Column(name = "razon_social", length = 200)
    private String razonSocial;

    @Column(name = "regimen_fiscal", length = 10)
    private String regimenFiscal;

    @Column(name = "domicilio_fiscal", length = 10)
    private String domicilioFiscal;

    @Column(name = "uso_cfdi", length = 10)
    private String usoCfdi;

    @Column(nullable = false)
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}
```

### `Venta.java` y `DetalleVenta.java`

```java
package com.farmacia.pos.model;

import com.farmacia.pos.model.enums.EstadoVenta;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    @ToString.Exclude
    private Cliente cliente;

    @Column(name = "cliente_nombre", length = 200)
    private String clienteNombre;

    @Column(name = "fecha")
    private LocalDateTime fecha;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<DetalleVenta> detalles = new ArrayList<>();

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "descuento_total", precision = 5, scale = 2)
    private BigDecimal descuentoTotal = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal impuesto = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "metodo_pago", length = 30)
    private String metodoPago;

    @Column(name = "monto_pagado", precision = 10, scale = 2)
    private BigDecimal montoPagado = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal cambio = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private EstadoVenta estado = EstadoVenta.COMPLETADA;

    @Column(length = 500)
    private String observaciones;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
```

```java
package com.farmacia.pos.model;

import com.farmacia.pos.model.enums.TipoRegulacion;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "detalles_venta")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    @ToString.Exclude
    private Venta venta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    @ToString.Exclude
    private Producto producto;

    @Column(name = "producto_nombre", length = 200)
    private String productoNombre;

    @Column(name = "sustancia_activa", length = 200)
    private String sustanciaActiva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id")
    @ToString.Exclude
    private Lote lote;

    @Column(name = "numero_lote", length = 100)
    private String numeroLote;

    @Column(name = "fecha_vencimiento_lote")
    private String fechaVencimientoLote;

    private Integer cantidad;

    @Column(name = "precio_unitario", precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(precision = 5, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_regulacion")
    private TipoRegulacion tipoRegulacion;

    // Relación con receta médica
    @OneToOne(mappedBy = "detalleVenta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private RecetaMedica recetaMedica;
}
```

### `RecetaMedica.java`

```java
package com.farmacia.pos.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recetas_medicas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecetaMedica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "detalle_venta_id")
    @ToString.Exclude
    private DetalleVenta detalleVenta;

    @Column(name = "cedula_medico", length = 20)
    private String cedulaMedico;

    @Column(name = "nombre_medico", length = 200)
    private String nombreMedico;

    @Column(name = "folio_receta", length = 100)
    private String folioReceta;

    @Column(name = "fecha_receta")
    private LocalDate fechaReceta;

    @Column(length = 200)
    private String institucion;

    @Column(length = 500)
    private String diagnostico;

    @Column(name = "tipo_regulacion", length = 30)
    private String tipoRegulacion;

    private Boolean verificada = false;

    @Column(length = 500)
    private String observaciones;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
```

### `MovimientoInventario.java`

```java
package com.farmacia.pos.model;

import com.farmacia.pos.model.enums.TipoMovimiento;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @ToString.Exclude
    private Producto producto;

    @Column(name = "producto_nombre", length = 200)
    private String productoNombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id")
    @ToString.Exclude
    private Lote lote;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false)
    private TipoMovimiento tipoMovimiento;

    @NotNull
    private Integer cantidad;

    @Column(name = "stock_anterior")
    private Integer stockAnterior;

    @Column(name = "stock_nuevo")
    private Integer stockNuevo;

    @Column(length = 300)
    private String motivo;

    @Column(length = 100)
    private String referencia;

    @Column(length = 100)
    private String usuario;

    @Column(length = 500)
    private String observaciones;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
```

### `CorteCaja.java`

```java
package com.farmacia.pos.model;

import com.farmacia.pos.model.enums.EstadoCorteCaja;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cortes_caja")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorteCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_caja")
    private Integer numeroCaja = 1;

    @Column(name = "cajero_nombre", length = 100)
    private String cajeroNombre;

    @Column(name = "fecha_apertura")
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "ventas_efectivo", precision = 10, scale = 2)
    private BigDecimal ventasEfectivo = BigDecimal.ZERO;

    @Column(name = "ventas_tarjeta", precision = 10, scale = 2)
    private BigDecimal ventasTarjeta = BigDecimal.ZERO;

    @Column(name = "ventas_transferencia", precision = 10, scale = 2)
    private BigDecimal ventasTransferencia = BigDecimal.ZERO;

    @Column(name = "total_ventas", precision = 10, scale = 2)
    private BigDecimal totalVentas = BigDecimal.ZERO;

    @Column(name = "fondo_inicial", precision = 10, scale = 2)
    private BigDecimal fondoInicial = BigDecimal.ZERO;

    @Column(name = "efectivo_declarado", precision = 10, scale = 2)
    private BigDecimal efectivoDeclarado = BigDecimal.ZERO;

    @Column(name = "efectivo_esperado", precision = 10, scale = 2)
    private BigDecimal efectivoEsperado = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal diferencia = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private EstadoCorteCaja estado = EstadoCorteCaja.ABIERTO;

    @Column(length = 500)
    private String observaciones;

    @Column(name = "cantidad_ventas")
    private Integer cantidadVentas = 0;

    @OneToMany(mappedBy = "corteCaja", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<RetiroEfectivo> retiros = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
```

### `RetiroEfectivo.java`

```java
package com.farmacia.pos.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "retiros_efectivo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetiroEfectivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "corte_caja_id")
    @ToString.Exclude
    private CorteCaja corteCaja;

    @Column(precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(length = 300)
    private String motivo;

    @Column(name = "autorizado_por", length = 100)
    private String autorizadoPor;

    @Column(length = 500)
    private String observaciones;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
```

---

## 8. REPOSITORIOS

```java
// ProductoRepository.java
package com.farmacia.pos.repository;

import com.farmacia.pos.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigoBarras(String codigoBarras);

    List<Producto> findByCategoria(String categoria);

    List<Producto> findByActivoTrue();

    // Búsqueda por nombre o sustancia activa (LIKE insensible a mayúsculas)
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND " +
           "(LOWER(p.nombre) LIKE LOWER(CONCAT('%',:nombre,'%')) OR " +
           "LOWER(p.sustanciaActiva) LIKE LOWER(CONCAT('%',:nombre,'%')) OR " +
           "LOWER(p.laboratorio) LIKE LOWER(CONCAT('%',:nombre,'%')))")
    List<Producto> buscarPorNombre(String nombre);

    // Productos con stock menor al mínimo (stock bajo)
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND p.stockTotal <= p.stockMinimo")
    List<Producto> findStockBajo();
}
```

```java
// LoteRepository.java
package com.farmacia.pos.repository;

import com.farmacia.pos.model.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface LoteRepository extends JpaRepository<Lote, Long> {

    List<Lote> findByProductoId(Long productoId);

    // Lotes caducados
    List<Lote> findByFechaVencimientoBeforeAndActivoTrue(LocalDate fecha);

    // Lotes próximos a vencer (antes de fecha límite)
    @Query("SELECT l FROM Lote l WHERE l.activo = true AND " +
           "l.fechaVencimiento > :hoy AND l.fechaVencimiento <= :limite " +
           "ORDER BY l.fechaVencimiento ASC")
    List<Lote> findProximosVencer(LocalDate hoy, LocalDate limite);

    // Lotes de un producto ordenados por vencimiento (FEFO)
    @Query("SELECT l FROM Lote l WHERE l.producto.id = :productoId AND " +
           "l.activo = true AND l.cantidadDisponible > 0 " +
           "ORDER BY l.fechaVencimiento ASC")
    List<Lote> findByProductoIdFefo(Long productoId);
}
```

```java
// ClienteRepository.java
package com.farmacia.pos.repository;

import com.farmacia.pos.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByDni(String dni);

    List<Produto> findByActivoTrue();

    @Query("SELECT c FROM Cliente c WHERE c.activo = true AND " +
           "(LOWER(c.nombre) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(c.apellido) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "c.telefono LIKE CONCAT('%',:q,'%') OR " +
           "c.dni LIKE CONCAT('%',:q,'%'))")
    List<Cliente> buscarPorNombre(String q);
}
```

```java
// VentaRepository.java
package com.farmacia.pos.repository;

import com.farmacia.pos.model.Venta;
import com.farmacia.pos.model.enums.EstadoVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findByClienteId(Long clienteId);

    List<Venta> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Venta> findByEstado(EstadoVenta estado);
}
```

```java
// MovimientoInventarioRepository.java
package com.farmacia.pos.repository;

import com.farmacia.pos.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
    List<MovimientoInventario> findByProductoId(Long productoId);
    List<MovimientoInventario> findAllByOrderByFechaCreacionDesc();
}
```

```java
// CorteCajaRepository.java
package com.farmacia.pos.repository;

import com.farmacia.pos.model.CorteCaja;
import com.farmacia.pos.model.enums.EstadoCorteCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CorteCajaRepository extends JpaRepository<CorteCaja, Long> {
    Optional<CorteCaja> findFirstByEstadoOrderByFechaAperturaDesc(EstadoCorteCaja estado);
    List<CorteCaja> findAllByOrderByFechaAperturaDesc();
}
```

---

## 9. SERVICIOS

### `ProductoService.java`

```java
package com.farmacia.pos.service;

import com.farmacia.pos.model.Producto;
import com.farmacia.pos.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepository;

    public List<Producto> obtenerTodos() {
        return productoRepository.findByActivoTrue();
    }

    public Producto obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));
    }

    public Producto buscarPorCodigo(String codigo) {
        return productoRepository.findByCodigoBarras(codigo)
                .orElse(null);
    }

    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.buscarPorNombre(nombre);
    }

    public List<Producto> obtenerPorCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }

    public List<Producto> obtenerStockBajo() {
        return productoRepository.findStockBajo();
    }

    public Producto crear(Producto producto) {
        producto.setId(null);
        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, Producto producto) {
        Producto existente = obtenerPorId(id);
        producto.setId(existente.getId());
        producto.setFechaCreacion(existente.getFechaCreacion());
        return productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        Producto producto = obtenerPorId(id);
        producto.setActivo(false); // Soft delete
        productoRepository.save(producto);
    }
}
```

### `VentaService.java`

```java
package com.farmacia.pos.service;

import com.farmacia.pos.model.*;
import com.farmacia.pos.model.enums.EstadoVenta;
import com.farmacia.pos.model.enums.TipoMovimiento;
import com.farmacia.pos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final LoteRepository loteRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public List<Venta> obtenerTodas() {
        return ventaRepository.findAll();
    }

    public Venta obtenerPorId(Long id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada: " + id));
    }

    public List<Venta> obtenerPorCliente(Long clienteId) {
        return ventaRepository.findByClienteId(clienteId);
    }

    public List<Venta> obtenerPorFecha(LocalDateTime inicio, LocalDateTime fin) {
        return ventaRepository.findByFechaBetween(inicio, fin);
    }

    public Venta crear(Venta venta) {
        venta.setId(null);
        venta.setFecha(LocalDateTime.now());
        venta.setEstado(EstadoVenta.COMPLETADA);

        // Asignar referencia a cada detalle y descontar stock
        for (DetalleVenta detalle : venta.getDetalles()) {
            detalle.setVenta(venta);

            // Descontar del lote seleccionado
            if (detalle.getLote() != null && detalle.getLote().getId() != null) {
                Lote lote = loteRepository.findById(detalle.getLote().getId())
                        .orElseThrow(() -> new RuntimeException("Lote no encontrado"));

                int nuevaCantidad = lote.getCantidadDisponible() - detalle.getCantidad();
                if (nuevaCantidad < 0) {
                    throw new RuntimeException("Stock insuficiente en lote " + lote.getNumeroLote());
                }
                lote.setCantidadDisponible(nuevaCantidad);
                loteRepository.save(lote);

                // Actualizar stockTotal del producto
                Producto prod = lote.getProducto();
                prod.setStockTotal(prod.getStockTotal() - detalle.getCantidad());
                productoRepository.save(prod);

                // Registrar movimiento de inventario
                MovimientoInventario mov = MovimientoInventario.builder()
                        .producto(prod)
                        .productoNombre(prod.getNombre())
                        .lote(lote)
                        .tipoMovimiento(TipoMovimiento.SALIDA)
                        .cantidad(detalle.getCantidad())
                        .stockAnterior(prod.getStockTotal() + detalle.getCantidad())
                        .stockNuevo(prod.getStockTotal())
                        .motivo("VENTA")
                        .referencia("VENTA-AUTO")
                        .build();
                movimientoRepository.save(mov);
            }
        }

        return ventaRepository.save(venta);
    }

    public Venta cancelar(Long id, String motivo) {
        Venta venta = obtenerPorId(id);
        venta.setEstado(EstadoVenta.CANCELADA);
        venta.setObservaciones(motivo);
        return ventaRepository.save(venta);
    }
}
```

### `InventarioService.java`

```java
package com.farmacia.pos.service;

import com.farmacia.pos.model.*;
import com.farmacia.pos.model.enums.TipoMovimiento;
import com.farmacia.pos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventarioService {

    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;
    private final LoteRepository loteRepository;

    public List<MovimientoInventario> obtenerTodos() {
        return movimientoRepository.findAllByOrderByFechaCreacionDesc();
    }

    public List<MovimientoInventario> obtenerPorProducto(Long productoId) {
        return movimientoRepository.findByProductoId(productoId);
    }

    public MovimientoInventario registrarEntrada(MovimientoInventario mov) {
        Producto prod = productoRepository.findById(mov.getProducto().getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        int stockAnterior = prod.getStockTotal();
        prod.setStockTotal(stockAnterior + mov.getCantidad());
        productoRepository.save(prod);

        mov.setTipoMovimiento(TipoMovimiento.ENTRADA);
        mov.setProductoNombre(prod.getNombre());
        mov.setStockAnterior(stockAnterior);
        mov.setStockNuevo(prod.getStockTotal());

        return movimientoRepository.save(mov);
    }

    public MovimientoInventario registrarSalida(MovimientoInventario mov) {
        Producto prod = productoRepository.findById(mov.getProducto().getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (prod.getStockTotal() < mov.getCantidad()) {
            throw new RuntimeException("Stock insuficiente");
        }

        int stockAnterior = prod.getStockTotal();
        prod.setStockTotal(stockAnterior - mov.getCantidad());
        productoRepository.save(prod);

        mov.setTipoMovimiento(TipoMovimiento.SALIDA);
        mov.setProductoNombre(prod.getNombre());
        mov.setStockAnterior(stockAnterior);
        mov.setStockNuevo(prod.getStockTotal());

        return movimientoRepository.save(mov);
    }

    public MovimientoInventario registrarAjuste(MovimientoInventario mov) {
        Producto prod = productoRepository.findById(mov.getProducto().getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        int stockAnterior = prod.getStockTotal();
        // cantidad puede ser positiva o negativa en un ajuste
        prod.setStockTotal(stockAnterior + mov.getCantidad());
        productoRepository.save(prod);

        mov.setTipoMovimiento(TipoMovimiento.AJUSTE);
        mov.setProductoNombre(prod.getNombre());
        mov.setStockAnterior(stockAnterior);
        mov.setStockNuevo(prod.getStockTotal());

        return movimientoRepository.save(mov);
    }
}
```

---

## 10. CONTROLADORES REST

### `ProductoController.java`

```java
package com.farmacia.pos.controller;

import com.farmacia.pos.model.Producto;
import com.farmacia.pos.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    // GET /api/productos  o  GET /api/productos?nombre=amox
    @GetMapping
    public List<Producto> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String categoria) {
        if (nombre != null && !nombre.isEmpty()) {
            return productoService.buscarPorNombre(nombre);
        }
        if (categoria != null && !categoria.isEmpty()) {
            return productoService.obtenerPorCategoria(categoria);
        }
        return productoService.obtenerTodos();
    }

    // GET /api/productos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    // GET /api/productos/codigo/{codigo}
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<Producto> obtenerPorCodigo(@PathVariable String codigo) {
        Producto p = productoService.buscarPorCodigo(codigo);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }

    // GET /api/productos/stock-bajo
    @GetMapping("/stock-bajo")
    public List<Producto> stockBajo() {
        return productoService.obtenerStockBajo();
    }

    // POST /api/productos
    @PostMapping
    public ResponseEntity<Producto> crear(@Valid @RequestBody Producto producto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(producto));
    }

    // PUT /api/productos/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Producto producto) {
        return ResponseEntity.ok(productoService.actualizar(id, producto));
    }

    // DELETE /api/productos/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

### `ClienteController.java`

```java
package com.farmacia.pos.controller;

import com.farmacia.pos.model.Cliente;
import com.farmacia.pos.repository.ClienteRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> listar(@RequestParam(required = false) String nombre) {
        if (nombre != null && !nombre.isEmpty()) {
            return clienteRepository.buscarPorNombre(nombre);
        }
        return clienteRepository.findByActivoTrue();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> obtener(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<Cliente> porDni(@PathVariable String dni) {
        return clienteRepository.findByDni(dni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cliente> crear(@Valid @RequestBody Cliente cliente) {
        cliente.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteRepository.save(cliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizar(
            @PathVariable Long id, @Valid @RequestBody Cliente cliente) {
        if (!clienteRepository.existsById(id)) return ResponseEntity.notFound().build();
        cliente.setId(id);
        return ResponseEntity.ok(clienteRepository.save(cliente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        clienteRepository.findById(id).ifPresent(c -> {
            c.setActivo(false);
            clienteRepository.save(c);
        });
        return ResponseEntity.noContent().build();
    }
}
```

### `VentaController.java`

```java
package com.farmacia.pos.controller;

import com.farmacia.pos.model.Venta;
import com.farmacia.pos.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @GetMapping
    public List<Venta> listar() {
        return ventaService.obtenerTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venta> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.obtenerPorId(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public List<Venta> porCliente(@PathVariable Long clienteId) {
        return ventaService.obtenerPorCliente(clienteId);
    }

    @GetMapping("/fecha")
    public List<Venta> porFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ventaService.obtenerPorFecha(inicio, fin);
    }

    @PostMapping
    public ResponseEntity<Venta> crear(@RequestBody Venta venta) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaService.crear(venta));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Venta> cancelar(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ventaService.cancelar(id, body.get("motivo")));
    }
}
```

### `InventarioController.java`

```java
package com.farmacia.pos.controller;

import com.farmacia.pos.model.MovimientoInventario;
import com.farmacia.pos.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping("/movimientos")
    public List<MovimientoInventario> listar() {
        return inventarioService.obtenerTodos();
    }

    @GetMapping("/producto/{productoId}")
    public List<MovimientoInventario> porProducto(@PathVariable Long productoId) {
        return inventarioService.obtenerPorProducto(productoId);
    }

    @PostMapping("/entrada")
    public ResponseEntity<MovimientoInventario> entrada(@RequestBody MovimientoInventario mov) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventarioService.registrarEntrada(mov));
    }

    @PostMapping("/salida")
    public ResponseEntity<MovimientoInventario> salida(@RequestBody MovimientoInventario mov) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventarioService.registrarSalida(mov));
    }

    @PostMapping("/ajuste")
    public ResponseEntity<MovimientoInventario> ajuste(@RequestBody MovimientoInventario mov) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventarioService.registrarAjuste(mov));
    }
}
```

### `CorteCajaController.java`

```java
package com.farmacia.pos.controller;

import com.farmacia.pos.model.CorteCaja;
import com.farmacia.pos.model.RetiroEfectivo;
import com.farmacia.pos.model.enums.EstadoCorteCaja;
import com.farmacia.pos.repository.CorteCajaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/corte-caja")
@RequiredArgsConstructor
public class CorteCajaController {

    private final CorteCajaRepository corteCajaRepository;

    @GetMapping("/actual")
    public ResponseEntity<CorteCaja> actual() {
        return corteCajaRepository
                .findFirstByEstadoOrderByFechaAperturaDesc(EstadoCorteCaja.ABIERTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/cerrar")
    public ResponseEntity<CorteCaja> cerrar(@RequestBody CorteCaja corte) {
        corte.setEstado(EstadoCorteCaja.CERRADO);
        corte.setFechaCierre(LocalDateTime.now());
        return ResponseEntity.ok(corteCajaRepository.save(corte));
    }

    @PostMapping("/retiro")
    public ResponseEntity<RetiroEfectivo> retiro(
            @RequestBody RetiroEfectivo retiro) {
        // Lógica de retiro — asociar al corte actual
        corteCajaRepository
                .findFirstByEstadoOrderByFechaAperturaDesc(EstadoCorteCaja.ABIERTO)
                .ifPresent(corte -> {
                    retiro.setCorteCaja(corte);
                    corte.getRetiros().add(retiro);
                    corteCajaRepository.save(corte);
                });
        return ResponseEntity.status(HttpStatus.CREATED).body(retiro);
    }

    @GetMapping("/historial")
    public List<CorteCaja> historial() {
        return corteCajaRepository.findAllByOrderByFechaAperturaDesc();
    }
}
```

---

## 11. MANEJO GLOBAL DE ERRORES

```java
package com.farmacia.pos.config;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Error de validación (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {
        List<String> errores = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .toList();

        Map<String, Object> body = new HashMap<>();
        body.put("error", "Error de validación");
        body.put("errores", errores);
        return ResponseEntity.badRequest().body(body);
    }

    // Error de negocio (RuntimeException)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", ex.getMessage()));
    }
}
```

---

## 12. DATOS INICIALES — `data.sql` (opcional)

```sql
-- Crear un producto de prueba
INSERT INTO productos (nombre, descripcion, categoria, precio_venta, precio_compra,
    porcentaje_iva, porcentaje_ieps, stock_total, stock_minimo, stock_optimo,
    codigo_barras, sku, laboratorio, sustancia_activa, presentacion,
    tipo_regulacion, grupo_interaccion, ubicacion_anaquel, activo)
VALUES
('Amoxicilina 500mg', 'Antibiótico de amplio espectro', 'Antibióticos',
 85.50, 42.00, 0, 0, 100, 20, 80,
 '7501234567890', 'SKU-001', 'PISA', 'Amoxicilina', 'Cápsulas 500mg x 12',
 'ANTIBIOTICO', 'ANTIBIOTICOS', 'Pasillo A-Estante 1', true);

-- Crear un lote para el producto anterior
INSERT INTO lotes (producto_id, numero_lote, fecha_vencimiento, fecha_ingreso,
    cantidad_inicial, cantidad_disponible, precio_compra, proveedor, activo)
VALUES
(1, 'LOT-2024-001', '2026-12-31', '2024-01-15',
 100, 100, 42.00, 'Distribuidora Farmacéutica SA', true);

-- Crear un cliente de prueba
INSERT INTO clientes (nombre, apellido, email, telefono, dni,
    tipo_cliente, descuento, activo)
VALUES
('Juan', 'García López', 'juan@email.com', '5551234567',
 'GAJL800101', 'REGULAR', 0, true);
```

---

## 13. CÓMO EJECUTAR

```bash
# 1. Entrar al directorio del proyecto backend
cd farmacia-pos-backend

# 2. Compilar y ejecutar
mvn spring-boot:run

# 3. El backend estará disponible en:
#    API:     http://localhost:8080/api
#    H2 UI:   http://localhost:8080/h2-console
```

```bash
# En paralelo, ejecutar el frontend (en otra terminal):
cd frontend
npm run dev
# Frontend: http://localhost:5173
# El Vite proxy enviará /api/* → http://localhost:8080/api
```

---

## 14. PRUEBA RÁPIDA DE ENDPOINTS
Manage Agent Skills
```bash
# Listar productos
curl http://localhost:8080/api/productos

# Buscar por código de barras
curl http://localhost:8080/api/productos/codigo/7501234567890

# Crear producto
curl -X POST http://localhost:8080/api/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Paracetamol 500mg","categoria":"Analgésicos",
       "precioVenta":25.00,"codigoBarras":"7509876543210",
       "sustanciaActiva":"Paracetamol","tipoRegulacion":"VENTA_LIBRE",
       "grupoInteraccion":"NINGUNO"}'

# Crear venta
curl -X POST http://localhost:8080/api/ventas \
  -H "Content-Type: application/json" \
  -d '{"fechaCreacion":"", "estado":"COMPLETADA", "total":85.50,
       "metodoPago":"EFECTIVO", "detalles":[]}'

# Ver consola H2
# Abrir en el navegador: http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:farmaciapos
# Usuario: sa | Contraseña: (vacío)
```
