package com.example.backend.controller;

import com.example.backend.dto.DTOConverter;
import com.example.backend.dto.LoteDTO;
import com.example.backend.model.Lote;
import com.example.backend.service.LoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lotes")
@CrossOrigin(origins = "*")
public class LoteController {

    @Autowired
    private LoteService loteService;

    @GetMapping
    public ResponseEntity<List<LoteDTO>> getAllLotes() {
        return ResponseEntity.ok(DTOConverter.convertList(loteService.findAll(), LoteDTO.class));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoteDTO> getLoteById(@PathVariable Long id) {
        Optional<Lote> lote = loteService.findById(id);
        return lote.map(l -> ResponseEntity.ok(DTOConverter.convertToDto(l, LoteDTO.class)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<LoteDTO>> getLotesByProductoId(@PathVariable Long productoId) {
        return ResponseEntity.ok(DTOConverter.convertList(loteService.findByProductoId(productoId), LoteDTO.class));
    }

    @PostMapping
    public ResponseEntity<LoteDTO> createLote(@RequestBody LoteDTO loteDto) {
        Lote entity = DTOConverter.convertToEntity(loteDto, Lote.class);
        Lote saved = loteService.save(entity);
        return ResponseEntity.ok(DTOConverter.convertToDto(saved, LoteDTO.class));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoteDTO> updateLote(@PathVariable Long id, @RequestBody LoteDTO loteDto) {
        if (!loteService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Lote entity = DTOConverter.convertToEntity(loteDto, Lote.class);
        entity.setId(id);
        Lote saved = loteService.save(entity);
        return ResponseEntity.ok(DTOConverter.convertToDto(saved, LoteDTO.class));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLote(@PathVariable Long id) {
        if (!loteService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        loteService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
