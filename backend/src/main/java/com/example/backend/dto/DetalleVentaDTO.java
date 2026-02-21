package com.example.backend.dto;

public class DetalleVentaDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private String sustanciaActiva;
    private Long loteId;
    private String numeroLote;
    private String fechaVencimientoLote;
    private Integer cantidad;
    private Double precioUnitario;
    private Double descuento;
    private Double subtotal;
    private String tipoRegulacion;
    private RecetaMedicaDTO recetaMedica;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public String getProductoNombre() {
        return productoNombre;
    }

    public void setProductoNombre(String productoNombre) {
        this.productoNombre = productoNombre;
    }

    public String getSustanciaActiva() {
        return sustanciaActiva;
    }

    public void setSustanciaActiva(String sustanciaActiva) {
        this.sustanciaActiva = sustanciaActiva;
    }

    public Long getLoteId() {
        return loteId;
    }

    public void setLoteId(Long loteId) {
        this.loteId = loteId;
    }

    public String getNumeroLote() {
        return numeroLote;
    }

    public void setNumeroLote(String numeroLote) {
        this.numeroLote = numeroLote;
    }

    public String getFechaVencimientoLote() {
        return fechaVencimientoLote;
    }

    public void setFechaVencimientoLote(String fechaVencimientoLote) {
        this.fechaVencimientoLote = fechaVencimientoLote;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(Double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public Double getDescuento() {
        return descuento;
    }

    public void setDescuento(Double descuento) {
        this.descuento = descuento;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public String getTipoRegulacion() {
        return tipoRegulacion;
    }

    public void setTipoRegulacion(String tipoRegulacion) {
        this.tipoRegulacion = tipoRegulacion;
    }

    public RecetaMedicaDTO getRecetaMedica() {
        return recetaMedica;
    }

    public void setRecetaMedica(RecetaMedicaDTO recetaMedica) {
        this.recetaMedica = recetaMedica;
    }
}
