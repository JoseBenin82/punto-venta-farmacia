package com.example.backend.service;

import com.example.backend.model.Lote;
import com.example.backend.model.MovimientoInventario;
import com.example.backend.model.Producto;
import com.example.backend.repository.LoteRepository;
import com.example.backend.repository.MovimientoInventarioRepository;
import com.example.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventarioService {

    @Autowired
    private MovimientoInventarioRepository inventarioRepository;

    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private LoteRepository loteRepository;

    public List<MovimientoInventario> getAllMovimientos() {
        return inventarioRepository.findAll();
    }

    public Optional<MovimientoInventario> getMovimientoById(Long id) {
        return inventarioRepository.findById(id);
    }

    public List<MovimientoInventario> getMovimientosByProductoId(Long productoId) {
        return inventarioRepository.findByProductoIdOrderByFechaCreacionDesc(productoId);
    }

    public MovimientoInventario registrarEntrada(MovimientoInventario movimiento) {
        movimiento.setTipoMovimiento("ENTRADA");
        actualizarStock(movimiento);
        return inventarioRepository.save(movimiento);
    }

    public MovimientoInventario registrarSalida(MovimientoInventario movimiento) {
        movimiento.setTipoMovimiento("SALIDA");
        actualizarStock(movimiento);
        return inventarioRepository.save(movimiento);
    }

    public MovimientoInventario registrarAjuste(MovimientoInventario movimiento) {
        movimiento.setTipoMovimiento("AJUSTE");
        actualizarStock(movimiento);
        return inventarioRepository.save(movimiento);
    }

    private void actualizarStock(MovimientoInventario movimiento) {
        if (movimiento.getProducto() != null) {
            Producto producto = productoRepository.findById(movimiento.getProducto().getId()).orElse(null);
            if (producto != null) {
                movimiento.setStockAnterior(producto.getStockTotal() != null ? producto.getStockTotal() : 0);
                int cantidad = movimiento.getCantidad() != null ? movimiento.getCantidad() : 0;
                
                int nuevoStock = producto.getStockTotal() != null ? producto.getStockTotal() : 0;
                if ("ENTRADA".equals(movimiento.getTipoMovimiento())) {
                    nuevoStock += cantidad;
                } else if ("SALIDA".equals(movimiento.getTipoMovimiento())) {
                    nuevoStock -= cantidad;
                } else if ("AJUSTE".equals(movimiento.getTipoMovimiento())) {
                    nuevoStock += cantidad; // Asumiendo que ajuste puede ser positivo o negativo en cantidad
                }
                
                movimiento.setStockNuevo(nuevoStock);
                
                // Actualizar Producto
                producto.setStockTotal(nuevoStock < 0 ? 0 : nuevoStock);
                productoRepository.save(producto);
                
                // Actualizar stock del Lote, si hay uno asociado
                if (movimiento.getLote() != null && movimiento.getLote().getId() != null) {
                    Lote l = loteRepository.findById(movimiento.getLote().getId()).orElse(null);
                    if (l != null) {
                        int currentLoteStock = l.getCantidadDisponible() != null ? l.getCantidadDisponible() : 0;
                        int newLoteStock = currentLoteStock;
                        if ("ENTRADA".equals(movimiento.getTipoMovimiento())) {
                            newLoteStock += cantidad;
                        } else if ("SALIDA".equals(movimiento.getTipoMovimiento())) {
                            newLoteStock -= cantidad;
                        } else if ("AJUSTE".equals(movimiento.getTipoMovimiento())) {
                            newLoteStock += cantidad; 
                        }
                        l.setCantidadDisponible(newLoteStock < 0 ? 0 : newLoteStock);
                        loteRepository.save(l);
                    }
                }
            }
        }
    }
}
