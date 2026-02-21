package com.example.backend.controller;

import com.example.backend.dto.DTOConverter;
import com.example.backend.dto.RecetaMedicaDTO;
import com.example.backend.model.DetalleVenta;
import com.example.backend.model.RecetaMedica;
import com.example.backend.service.RecetaMedicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recetas")
@CrossOrigin(origins = "*")
public class RecetaMedicaController {

    @Autowired
    private RecetaMedicaService recetaMedicaService;

    private RecetaMedicaDTO mapToDto(RecetaMedica r) {
        RecetaMedicaDTO dto = DTOConverter.convertToDto(r, RecetaMedicaDTO.class);
        if (r.getDetalleVenta() != null) {
            dto.setDetalleVentaId(r.getDetalleVenta().getId());
        }
        return dto;
    }

    private RecetaMedica mapToEntity(RecetaMedicaDTO dto) {
        RecetaMedica entity = DTOConverter.convertToEntity(dto, RecetaMedica.class);
        if (dto.getDetalleVentaId() != null) {
            DetalleVenta dv = new DetalleVenta();
            dv.setId(dto.getDetalleVentaId());
            entity.setDetalleVenta(dv);
        }
        return entity;
    }

    @GetMapping
    public ResponseEntity<List<RecetaMedicaDTO>> getRecetas() {
        return ResponseEntity.ok(
            recetaMedicaService.obtenerTodas().stream().map(this::mapToDto).collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecetaMedicaDTO> getRecetaById(@PathVariable Long id) {
        return recetaMedicaService.obtenerPorId(id)
                .map(this::mapToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RecetaMedicaDTO> createReceta(@RequestBody RecetaMedicaDTO recetaDto) {
        RecetaMedica entity = mapToEntity(recetaDto);
        return ResponseEntity.ok(mapToDto(recetaMedicaService.guardarReceta(entity)));
    }
}
