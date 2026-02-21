package com.example.backend.controller;

import com.example.backend.dto.CorteCajaDTO;
import com.example.backend.dto.DTOConverter;
import com.example.backend.model.CorteCaja;
import com.example.backend.service.CorteCajaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/corte-caja")
@CrossOrigin(origins = "*")
public class CorteCajaController {

    @Autowired
    private CorteCajaService corteCajaService;

    @GetMapping("/actual")
    public ResponseEntity<CorteCajaDTO> getCorteActual() {
        Optional<CorteCaja> actual = corteCajaService.getCorteActual();
        return actual.map(c -> ResponseEntity.ok(DTOConverter.convertToDto(c, CorteCajaDTO.class)))
                     .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/cerrar")
    public ResponseEntity<CorteCajaDTO> cerrarCorte(@RequestBody CorteCajaDTO corteDto) {
        CorteCaja entity = DTOConverter.convertToEntity(corteDto, CorteCaja.class);
        CorteCaja result = corteCajaService.cerrarCorte(entity);
        return ResponseEntity.ok(DTOConverter.convertToDto(result, CorteCajaDTO.class));
    }

    @PostMapping("/retiro")
    public ResponseEntity<CorteCajaDTO> generarRetiro(@RequestBody CorteCajaDTO corteDto) {
        CorteCaja entity = DTOConverter.convertToEntity(corteDto, CorteCaja.class);
        CorteCaja result = corteCajaService.registrarRetiro(entity);
        return ResponseEntity.ok(DTOConverter.convertToDto(result, CorteCajaDTO.class));
    }

    @GetMapping("/historial")
    public ResponseEntity<List<CorteCajaDTO>> getHistorial() {
        return ResponseEntity.ok(DTOConverter.convertList(corteCajaService.getHistorial(), CorteCajaDTO.class));
    }
}
