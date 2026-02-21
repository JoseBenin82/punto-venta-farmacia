package com.example.backend.controller;

import com.example.backend.dto.DTOConverter;
import com.example.backend.dto.FacturaDTO;
import com.example.backend.model.Factura;
import com.example.backend.model.Venta;
import com.example.backend.service.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = "*")
public class FacturaController {

    @Autowired
    private FacturaService facturaService;

    private FacturaDTO mapToDto(Factura f) {
        FacturaDTO dto = DTOConverter.convertToDto(f, FacturaDTO.class);
        if (f.getVenta() != null) {
            dto.setVentaId(f.getVenta().getId());
        }
        return dto;
    }

    private Factura mapToEntity(FacturaDTO dto) {
        Factura entity = DTOConverter.convertToEntity(dto, Factura.class);
        if (dto.getVentaId() != null) {
            Venta v = new Venta();
            v.setId(dto.getVentaId());
            entity.setVenta(v);
        }
        return entity;
    }

    @GetMapping
    public ResponseEntity<List<FacturaDTO>> getFacturas() {
        return ResponseEntity.ok(
            facturaService.obtenerTodas().stream().map(this::mapToDto).collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacturaDTO> getFacturaById(@PathVariable Long id) {
        return facturaService.obtenerPorId(id)
                .map(this::mapToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/venta/{ventaId}")
    public ResponseEntity<FacturaDTO> getFacturaByVenta(@PathVariable Long ventaId) {
        return facturaService.obtenerPorVentaId(ventaId)
                .map(this::mapToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FacturaDTO> createFactura(@RequestBody FacturaDTO facturaDto) {
        Factura entity = mapToEntity(facturaDto);
        entity.setEstatus("PENDIENTE");
        return ResponseEntity.ok(mapToDto(facturaService.guardarFactura(entity)));
    }

    @PostMapping("/{id}/timbrar")
    public ResponseEntity<FacturaDTO> timbrarFactura(@PathVariable Long id) {
        return facturaService.obtenerPorId(id).map(factura -> {
            factura.setEstatus("TIMBRADA");
            factura.setFechaTimbrado(LocalDateTime.now());
            return ResponseEntity.ok(mapToDto(facturaService.guardarFactura(factura)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<FacturaDTO> cancelarFactura(@PathVariable Long id) {
        return facturaService.obtenerPorId(id).map(factura -> {
            factura.setEstatus("CANCELADA");
            return ResponseEntity.ok(mapToDto(facturaService.guardarFactura(factura)));
        }).orElse(ResponseEntity.notFound().build());
    }
}
