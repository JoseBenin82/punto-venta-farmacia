package com.example.backend.service;

import com.example.backend.model.CorteCaja;
import com.example.backend.model.DetalleVenta;
import com.example.backend.model.Lote;
import com.example.backend.model.Producto;
import com.example.backend.model.Venta;
import com.example.backend.model.MovimientoInventario;
import com.example.backend.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;
    
    @Autowired
    private InventarioService inventarioService;
    
    @Autowired
    private CorteCajaService corteCajaService;

    public List<Venta> findAll() {
        return ventaRepository.findAll();
    }

    public Optional<Venta> findById(Long id) {
        return ventaRepository.findById(id);
    }

    public List<Venta> findByClienteId(Long clienteId) {
        return ventaRepository.findByClienteId(clienteId);
    }

    @Transactional
    public Venta save(Venta venta) {
        boolean isNew = (venta.getId() == null);
        
        Venta savedVenta = ventaRepository.save(venta);
        
        // Solo para ventas NUEVAS realizamos los descuentos de inventario y actualizar el corte
        if (isNew && savedVenta.getDetalles() != null) {
            
            // Generar salidas de inventario por cada artículo vendido
            for (DetalleVenta detalle : savedVenta.getDetalles()) {
                if (detalle.getProductoId() != null) {
                    MovimientoInventario mov = new MovimientoInventario();
                    
                    Producto p = new Producto();
                    p.setId(detalle.getProductoId());
                    mov.setProducto(p);
                    mov.setProductoNombre(detalle.getProductoNombre());
                    
                    if (detalle.getLoteId() != null) {
                        Lote l = new Lote();
                        l.setId(detalle.getLoteId());
                        mov.setLote(l);
                    }
                    
                    mov.setCantidad(detalle.getCantidad() != null ? detalle.getCantidad() : 0);
                    mov.setMotivo("Venta");
                    mov.setReferencia("Venta ID: " + savedVenta.getId());
                    mov.setUsuario(savedVenta.getUsuarioNombre());
                    
                    inventarioService.registrarSalida(mov);
                }
            }
            
            // Actualizar corte de caja
            if (!"EN_ESPERA".equals(savedVenta.getEstado()) && !"CANCELADA".equals(savedVenta.getEstado())) {
                CorteCaja corte = corteCajaService.getOrCreateActual();
                Double total = (savedVenta.getTotal() != null ? savedVenta.getTotal() : 0.0);
                
                corte.setTotalVentas((corte.getTotalVentas() != null ? corte.getTotalVentas() : 0.0) + total);
                corte.setCantidadVentas((corte.getCantidadVentas() != null ? corte.getCantidadVentas() : 0) + 1);
                
                String mp = savedVenta.getMetodoPago();
                if ("EFECTIVO".equalsIgnoreCase(mp)) {
                    corte.setVentasEfectivo((corte.getVentasEfectivo() != null ? corte.getVentasEfectivo() : 0.0) + total);
                } else if ("TARJETA".equalsIgnoreCase(mp) || "TARJETA_CREDITO".equalsIgnoreCase(mp) || "TARJETA_DEBITO".equalsIgnoreCase(mp)) {
                    corte.setVentasTarjeta((corte.getVentasTarjeta() != null ? corte.getVentasTarjeta() : 0.0) + total);
                } else if ("TRANSFERENCIA".equalsIgnoreCase(mp)) {
                    corte.setVentasTransferencia((corte.getVentasTransferencia() != null ? corte.getVentasTransferencia() : 0.0) + total);
                } else {
                    corte.setVentasEfectivo((corte.getVentasEfectivo() != null ? corte.getVentasEfectivo() : 0.0) + total);
                }
                corteCajaService.save(corte);
            }
        }

        return savedVenta;
    }

    public void deleteById(Long id) {
        ventaRepository.deleteById(id);
    }
}
