package com.example.backend.controller;

import com.example.backend.dto.DTOConverter;
import com.example.backend.dto.MovimientoInventarioDTO;
import com.example.backend.model.MovimientoInventario;
import com.example.backend.service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {

    @Autowired
    private InventarioService inventarioService;

    @GetMapping("/movimientos")
    public ResponseEntity<List<MovimientoInventarioDTO>> getMovimientos() {
        List<MovimientoInventarioDTO> dtos = inventarioService.getAllMovimientos().stream()
            .map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/movimientos/{id}")
    public ResponseEntity<MovimientoInventarioDTO> getMovimientoById(@PathVariable Long id) {
        return inventarioService.getMovimientoById(id)
                .map(m -> ResponseEntity.ok(mapToDto(m)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/producto/{prodId}")
    public ResponseEntity<List<MovimientoInventarioDTO>> getInventarioByProducto(@PathVariable Long prodId) {
        List<MovimientoInventarioDTO> dtos = inventarioService.getMovimientosByProductoId(prodId).stream()
            .map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/entrada")
    public ResponseEntity<MovimientoInventarioDTO> entrada(@RequestBody MovimientoInventarioDTO entradaDto) {
        MovimientoInventario entity = mapToEntity(entradaDto);
        MovimientoInventario saved = inventarioService.registrarEntrada(entity);
        return ResponseEntity.ok(mapToDto(saved));
    }

    @PostMapping("/salida")
    public ResponseEntity<MovimientoInventarioDTO> salida(@RequestBody MovimientoInventarioDTO salidaDto) {
        MovimientoInventario entity = mapToEntity(salidaDto);
        MovimientoInventario saved = inventarioService.registrarSalida(entity);
        return ResponseEntity.ok(mapToDto(saved));
    }

    @PostMapping("/ajuste")
    public ResponseEntity<MovimientoInventarioDTO> ajuste(@RequestBody MovimientoInventarioDTO ajusteDto) {
        MovimientoInventario entity = mapToEntity(ajusteDto);
        MovimientoInventario saved = inventarioService.registrarAjuste(entity);
        return ResponseEntity.ok(mapToDto(saved));
    }

    private MovimientoInventario mapToEntity(MovimientoInventarioDTO dto) {
        MovimientoInventario entity = DTOConverter.convertToEntity(dto, MovimientoInventario.class);
        if (dto.getProductoId() != null) {
            com.example.backend.model.Producto p = new com.example.backend.model.Producto();
            p.setId(dto.getProductoId());
            entity.setProducto(p);
        }
        if (dto.getLoteId() != null) {
            com.example.backend.model.Lote l = new com.example.backend.model.Lote();
            l.setId(dto.getLoteId());
            entity.setLote(l);
        }
        return entity;
    }

    private MovimientoInventarioDTO mapToDto(MovimientoInventario entity) {
        MovimientoInventarioDTO dto = DTOConverter.convertToDto(entity, MovimientoInventarioDTO.class);
        if (entity.getProducto() != null) {
            dto.setProductoId(entity.getProducto().getId());
            dto.setProductoNombre(entity.getProducto().getNombre());
        }
        if (entity.getLote() != null) {
            dto.setLoteId(entity.getLote().getId());
        }
        return dto;
    }
}
