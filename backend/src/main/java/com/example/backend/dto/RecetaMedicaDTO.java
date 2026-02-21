package com.example.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class RecetaMedicaDTO {
    private Long id;
    private Long detalleVentaId;
    private String cedulaMedico;
    private String nombreMedico;
    private String folioReceta;
    private LocalDate fechaReceta;
    private String institucion;
    private String diagnostico;
    private String tipoRegulacion;
    private Boolean verificada;
    private String observaciones;
    private LocalDateTime fechaCreacion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDetalleVentaId() {
        return detalleVentaId;
    }

    public void setDetalleVentaId(Long detalleVentaId) {
        this.detalleVentaId = detalleVentaId;
    }

    public String getCedulaMedico() {
        return cedulaMedico;
    }

    public void setCedulaMedico(String cedulaMedico) {
        this.cedulaMedico = cedulaMedico;
    }

    public String getNombreMedico() {
        return nombreMedico;
    }

    public void setNombreMedico(String nombreMedico) {
        this.nombreMedico = nombreMedico;
    }

    public String getFolioReceta() {
        return folioReceta;
    }

    public void setFolioReceta(String folioReceta) {
        this.folioReceta = folioReceta;
    }

    public LocalDate getFechaReceta() {
        return fechaReceta;
    }

    public void setFechaReceta(LocalDate fechaReceta) {
        this.fechaReceta = fechaReceta;
    }

    public String getInstitucion() {
        return institucion;
    }

    public void setInstitucion(String institucion) {
        this.institucion = institucion;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getTipoRegulacion() {
        return tipoRegulacion;
    }

    public void setTipoRegulacion(String tipoRegulacion) {
        this.tipoRegulacion = tipoRegulacion;
    }

    public Boolean getVerificada() {
        return verificada;
    }

    public void setVerificada(Boolean verificada) {
        this.verificada = verificada;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
