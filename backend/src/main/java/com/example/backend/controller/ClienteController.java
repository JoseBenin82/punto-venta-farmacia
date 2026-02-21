package com.example.backend.controller;

import java.util.List;
import java.util.Optional;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ClienteDTO;
import com.example.backend.dto.DTOConverter;
import com.example.backend.model.Cliente;
import com.example.backend.service.ClienteService;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping
    public ResponseEntity<List<ClienteDTO>> getAllClientes(
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String nombre) {
        List<Cliente> clientes;
        if (activo != null) {
            clientes = clienteService.findByActivo(activo);
        } else {
            clientes = clienteService.findAll();
        }
        return ResponseEntity.ok(DTOConverter.convertList(clientes, ClienteDTO.class));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteDTO> getClienteById(@PathVariable Long id) {
        Optional<Cliente> cliente = clienteService.findById(id);
        return cliente.map(c -> ResponseEntity.ok(DTOConverter.convertToDto(c, ClienteDTO.class)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<ClienteDTO> getClienteByDni(@PathVariable String dni) {
        Cliente cliente = clienteService.findByDni(dni);
        return cliente != null ? ResponseEntity.ok(DTOConverter.convertToDto(cliente, ClienteDTO.class)) 
                : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<ClienteDTO> createCliente(@RequestBody ClienteDTO clienteDto) {
        Cliente entity = DTOConverter.convertToEntity(clienteDto, Cliente.class);
        Cliente saved = clienteService.save(entity);
        return ResponseEntity.ok(DTOConverter.convertToDto(saved, ClienteDTO.class));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteDTO> updateCliente(@PathVariable Long id, @RequestBody ClienteDTO clienteDto) {
        if (!clienteService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Cliente entity = DTOConverter.convertToEntity(clienteDto, Cliente.class);
        entity.setId(id);
        Cliente saved = clienteService.save(entity);
        return ResponseEntity.ok(DTOConverter.convertToDto(saved, ClienteDTO.class));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCliente(@PathVariable Long id) {
        if (!clienteService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        clienteService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
