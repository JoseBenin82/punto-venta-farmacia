package com.example.backend.dto;

import java.time.LocalDateTime;

public class FacturaDTO {
    private Long id;
    private Long ventaId;
    private String rfc;
    private String razonSocial;
    private String usoCfdi;
    private String regimenFiscal;
    private String codigoPostal;
    private String folioCfdi;
    private String estatus; // PENDIENTE, TIMBRADA, CANCELADA
    private String urlXml;
    private String urlPdf;
    private LocalDateTime fechaTimbrado;
    private LocalDateTime fechaCreacion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVentaId() {
        return ventaId;
    }

    public void setVentaId(Long ventaId) {
        this.ventaId = ventaId;
    }

    public String getRfc() {
        return rfc;
    }

    public void setRfc(String rfc) {
        this.rfc = rfc;
    }

    public String getRazonSocial() {
        return razonSocial;
    }

    public void setRazonSocial(String razonSocial) {
        this.razonSocial = razonSocial;
    }

    public String getUsoCfdi() {
        return usoCfdi;
    }

    public void setUsoCfdi(String usoCfdi) {
        this.usoCfdi = usoCfdi;
    }

    public String getRegimenFiscal() {
        return regimenFiscal;
    }

    public void setRegimenFiscal(String regimenFiscal) {
        this.regimenFiscal = regimenFiscal;
    }

    public String getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
    }

    public String getFolioCfdi() {
        return folioCfdi;
    }

    public void setFolioCfdi(String folioCfdi) {
        this.folioCfdi = folioCfdi;
    }

    public String getEstatus() {
        return estatus;
    }

    public void setEstatus(String estatus) {
        this.estatus = estatus;
    }

    public String getUrlXml() {
        return urlXml;
    }

    public void setUrlXml(String urlXml) {
        this.urlXml = urlXml;
    }

    public String getUrlPdf() {
        return urlPdf;
    }

    public void setUrlPdf(String urlPdf) {
        this.urlPdf = urlPdf;
    }

    public LocalDateTime getFechaTimbrado() {
        return fechaTimbrado;
    }

    public void setFechaTimbrado(LocalDateTime fechaTimbrado) {
        this.fechaTimbrado = fechaTimbrado;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
