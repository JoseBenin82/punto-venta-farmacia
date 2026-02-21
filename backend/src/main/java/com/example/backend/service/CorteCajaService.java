package com.example.backend.service;

import com.example.backend.model.CorteCaja;
import com.example.backend.repository.CorteCajaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CorteCajaService {

    @Autowired
    private CorteCajaRepository corteCajaRepository;

    public Optional<CorteCaja> getCorteActual() {
        Optional<CorteCaja> actual = corteCajaRepository.findTopByEstadoOrderByIdDesc("ABIERTO");
        if (!actual.isPresent()) {
            CorteCaja nuevo = new CorteCaja();
            nuevo.setEstado("ABIERTO");
            nuevo.setFechaApertura(LocalDateTime.now());
            nuevo.setFondoInicial(1000.0);
            nuevo.setVentasEfectivo(0.0);
            nuevo.setVentasTarjeta(0.0);
            nuevo.setVentasTransferencia(0.0);
            nuevo.setTotalVentas(0.0);
            nuevo.setTotalDevoluciones(0.0);
            nuevo.setRetirosEfectivo(0.0);
            nuevo.setEfectivoDeclarado(0.0);
            nuevo.setEfectivoEsperado(0.0);
            nuevo.setDiferencia(0.0);
            nuevo.setCantidadVentas(0);
            nuevo.setCantidadCancelaciones(0);
            return Optional.of(corteCajaRepository.save(nuevo));
        }
        return actual;
    }
    
    public CorteCaja getOrCreateActual() {
        return getCorteActual().orElseThrow(() -> new RuntimeException("Error creando corte Caja"));
    }

    public List<CorteCaja> getHistorial() {
        return corteCajaRepository.findAll();
    }

    public CorteCaja cerrarCorte(CorteCaja corte) {
        corte.setEstado("CERRADO");
        corte.setFechaCierre(LocalDateTime.now());
        return corteCajaRepository.save(corte);
    }
    
    public CorteCaja registrarRetiro(CorteCaja corte) {
        return corteCajaRepository.save(corte);
    }

    public void save(CorteCaja corteCaja) {
        corteCajaRepository.save(corteCaja);
    }
}
