package com.example.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.DTOConverter;
import com.example.backend.dto.DetalleVentaDTO;
import com.example.backend.dto.VentaDTO;
import com.example.backend.model.DetalleVenta;
import com.example.backend.model.Venta;
import com.example.backend.service.VentaService;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    private VentaDTO mapToDto(Venta v) {
        VentaDTO dto = DTOConverter.convertToDto(v, VentaDTO.class);
        if (v.getDetalles() != null) {
            dto.setDetalles(v.getDetalles().stream()
                    .map(d -> DTOConverter.convertToDto(d, DetalleVentaDTO.class))
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private Venta mapToEntity(VentaDTO dto) {
        Venta entity = DTOConverter.convertToEntity(dto, Venta.class);
        if (dto.getDetalles() != null) {
            entity.setDetalles(dto.getDetalles().stream()
                    .map(d -> DTOConverter.convertToEntity(d, DetalleVenta.class))
                    .collect(Collectors.toList()));
        }
        return entity;
    }

    @GetMapping
    public ResponseEntity<List<VentaDTO>> getAllVentas() {
        List<VentaDTO> dtos = ventaService.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaDTO> getVentaById(@PathVariable Long id) {
        return ventaService.findById(id)
                .map(this::mapToDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<VentaDTO>> getVentasByClienteId(@PathVariable Long clienteId) {
        List<VentaDTO> dtos = ventaService.findByClienteId(clienteId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<VentaDTO> createVenta(@RequestBody VentaDTO ventaDto) {
        Venta entity = mapToEntity(ventaDto);
        Venta saved = ventaService.save(entity);
        return ResponseEntity.ok(mapToDto(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VentaDTO> updateVenta(@PathVariable Long id, @RequestBody VentaDTO ventaDto) {
        if (!ventaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Venta entity = mapToEntity(ventaDto);
        entity.setId(id);
        Venta saved = ventaService.save(entity);
        return ResponseEntity.ok(mapToDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenta(@PathVariable Long id) {

        if (!ventaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        ventaService.deleteById(id);
        return ResponseEntity.noContent().build();

    }

}
