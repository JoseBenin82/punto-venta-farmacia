package com.example.backend.dto;

import java.time.LocalDateTime;

public class ProductoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private String categoria;
    private Double precioVenta;
    private Double precioCompra;
    private Double porcentajeIVA;
    private Double porcentajeIEPS;
    private Integer stockTotal;
    private Integer stockMinimo;
    private Integer stockOptimo;
    private String codigoBarras;
    private String sku;
    private String laboratorio;
    private String sustanciaActiva;
    private String presentacion;
    private String tipoRegulacion;
    private String grupoInteraccion;
    private String ubicacionAnaquel;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Double getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(Double precioVenta) {
        this.precioVenta = precioVenta;
    }

    public Double getPrecioCompra() {
        return precioCompra;
    }

    public void setPrecioCompra(Double precioCompra) {
        this.precioCompra = precioCompra;
    }

    public Double getPorcentajeIVA() {
        return porcentajeIVA;
    }

    public void setPorcentajeIVA(Double porcentajeIVA) {
        this.porcentajeIVA = porcentajeIVA;
    }

    public Double getPorcentajeIEPS() {
        return porcentajeIEPS;
    }

    public void setPorcentajeIEPS(Double porcentajeIEPS) {
        this.porcentajeIEPS = porcentajeIEPS;
    }

    public Integer getStockTotal() {
        return stockTotal;
    }

    public void setStockTotal(Integer stockTotal) {
        this.stockTotal = stockTotal;
    }

    public Integer getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(Integer stockMinimo) {
        this.stockMinimo = stockMinimo;
    }

    public Integer getStockOptimo() {
        return stockOptimo;
    }

    public void setStockOptimo(Integer stockOptimo) {
        this.stockOptimo = stockOptimo;
    }

    public String getCodigoBarras() {
        return codigoBarras;
    }

    public void setCodigoBarras(String codigoBarras) {
        this.codigoBarras = codigoBarras;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getLaboratorio() {
        return laboratorio;
    }

    public void setLaboratorio(String laboratorio) {
        this.laboratorio = laboratorio;
    }

    public String getSustanciaActiva() {
        return sustanciaActiva;
    }

    public void setSustanciaActiva(String sustanciaActiva) {
        this.sustanciaActiva = sustanciaActiva;
    }

    public String getPresentacion() {
        return presentacion;
    }

    public void setPresentacion(String presentacion) {
        this.presentacion = presentacion;
    }

    public String getTipoRegulacion() {
        return tipoRegulacion;
    }

    public void setTipoRegulacion(String tipoRegulacion) {
        this.tipoRegulacion = tipoRegulacion;
    }

    public String getGrupoInteraccion() {
        return grupoInteraccion;
    }

    public void setGrupoInteraccion(String grupoInteraccion) {
        this.grupoInteraccion = grupoInteraccion;
    }

    public String getUbicacionAnaquel() {
        return ubicacionAnaquel;
    }

    public void setUbicacionAnaquel(String ubicacionAnaquel) {
        this.ubicacionAnaquel = ubicacionAnaquel;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
