package com.example.backend.controller;

import com.example.backend.dto.ProductoDTO;
import com.example.backend.dto.DTOConverter;
import com.example.backend.model.Producto;
import com.example.backend.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<ProductoDTO>> getAllProductos(
            @RequestParam(required = false) String nombre) {
        List<Producto> productos = productoService.findAll();
        return ResponseEntity.ok(DTOConverter.convertList(productos, ProductoDTO.class));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> getProductoById(@PathVariable Long id) {
        Optional<Producto> producto = productoService.findById(id);
        return producto.map(p -> ResponseEntity.ok(DTOConverter.convertToDto(p, ProductoDTO.class)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ProductoDTO> getProductoByCodigo(@PathVariable String codigo) {
        Producto producto = productoService.findByCodigoBarras(codigo);
        return producto != null ? ResponseEntity.ok(DTOConverter.convertToDto(producto, ProductoDTO.class)) 
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<ProductoDTO>> getProductosByCategoria(@PathVariable String categoria) {
        List<Producto> productos = productoService.findByCategoria(categoria);
        return ResponseEntity.ok(DTOConverter.convertList(productos, ProductoDTO.class));
    }

    @PostMapping
    public ResponseEntity<ProductoDTO> createProducto(@RequestBody ProductoDTO productoDto) {
        Producto entity = DTOConverter.convertToEntity(productoDto, Producto.class);
        Producto saved = productoService.save(entity);
        return ResponseEntity.ok(DTOConverter.convertToDto(saved, ProductoDTO.class));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> updateProducto(@PathVariable Long id, @RequestBody ProductoDTO productoDto) {
        if (!productoService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Producto entity = DTOConverter.convertToEntity(productoDto, Producto.class);
        entity.setId(id);
        Producto saved = productoService.save(entity);
        return ResponseEntity.ok(DTOConverter.convertToDto(saved, ProductoDTO.class));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable Long id) {
        if (!productoService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        productoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
