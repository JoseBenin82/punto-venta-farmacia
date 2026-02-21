package com.example.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "cortes_caja")
public class CorteCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer numeroCaja;
    private Long cajeroId;
    private String cajeroNombre;
    private Long supervisorId;
    private String supervisorNombre;

    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;

    private Double ventasEfectivo;
    private Double ventasTarjeta;
    private Double ventasTransferencia;
    private Double totalVentas;
    private Double totalDevoluciones;
    private Double retirosEfectivo;
    private Double fondoInicial;

    private Double efectivoDeclarado;
    private Double efectivoEsperado;
    private Double diferencia;
    private String estado; // ABIERTO, CERRADO
    private String observaciones;

    private Integer cantidadVentas;
    private Integer cantidadCancelaciones;

    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.fechaApertura == null) {
            this.fechaApertura = LocalDateTime.now();
        }
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumeroCaja() {
        return numeroCaja;
    }

    public void setNumeroCaja(Integer numeroCaja) {
        this.numeroCaja = numeroCaja;
    }

    public Long getCajeroId() {
        return cajeroId;
    }

    public void setCajeroId(Long cajeroId) {
        this.cajeroId = cajeroId;
    }

    public String getCajeroNombre() {
        return cajeroNombre;
    }

    public void setCajeroNombre(String cajeroNombre) {
        this.cajeroNombre = cajeroNombre;
    }

    public Long getSupervisorId() {
        return supervisorId;
    }

    public void setSupervisorId(Long supervisorId) {
        this.supervisorId = supervisorId;
    }

    public String getSupervisorNombre() {
        return supervisorNombre;
    }

    public void setSupervisorNombre(String supervisorNombre) {
        this.supervisorNombre = supervisorNombre;
    }

    public LocalDateTime getFechaApertura() {
        return fechaApertura;
    }

    public void setFechaApertura(LocalDateTime fechaApertura) {
        this.fechaApertura = fechaApertura;
    }

    public LocalDateTime getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDateTime fechaCierre) {
        this.fechaCierre = fechaCierre;
    }

    public Double getVentasEfectivo() {
        return ventasEfectivo;
    }

    public void setVentasEfectivo(Double ventasEfectivo) {
        this.ventasEfectivo = ventasEfectivo;
    }

    public Double getVentasTarjeta() {
        return ventasTarjeta;
    }

    public void setVentasTarjeta(Double ventasTarjeta) {
        this.ventasTarjeta = ventasTarjeta;
    }

    public Double getVentasTransferencia() {
        return ventasTransferencia;
    }

    public void setVentasTransferencia(Double ventasTransferencia) {
        this.ventasTransferencia = ventasTransferencia;
    }

    public Double getTotalVentas() {
        return totalVentas;
    }

    public void setTotalVentas(Double totalVentas) {
        this.totalVentas = totalVentas;
    }

    public Double getTotalDevoluciones() {
        return totalDevoluciones;
    }

    public void setTotalDevoluciones(Double totalDevoluciones) {
        this.totalDevoluciones = totalDevoluciones;
    }

    public Double getRetirosEfectivo() {
        return retirosEfectivo;
    }

    public void setRetirosEfectivo(Double retirosEfectivo) {
        this.retirosEfectivo = retirosEfectivo;
    }

    public Double getFondoInicial() {
        return fondoInicial;
    }

    public void setFondoInicial(Double fondoInicial) {
        this.fondoInicial = fondoInicial;
    }

    public Double getEfectivoDeclarado() {
        return efectivoDeclarado;
    }

    public void setEfectivoDeclarado(Double efectivoDeclarado) {
        this.efectivoDeclarado = efectivoDeclarado;
    }

    public Double getEfectivoEsperado() {
        return efectivoEsperado;
    }

    public void setEfectivoEsperado(Double efectivoEsperado) {
        this.efectivoEsperado = efectivoEsperado;
    }

    public Double getDiferencia() {
        return diferencia;
    }

    public void setDiferencia(Double diferencia) {
        this.diferencia = diferencia;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Integer getCantidadVentas() {
        return cantidadVentas;
    }

    public void setCantidadVentas(Integer cantidadVentas) {
        this.cantidadVentas = cantidadVentas;
    }

    public Integer getCantidadCancelaciones() {
        return cantidadCancelaciones;
    }

    public void setCantidadCancelaciones(Integer cantidadCancelaciones) {
        this.cantidadCancelaciones = cantidadCancelaciones;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
