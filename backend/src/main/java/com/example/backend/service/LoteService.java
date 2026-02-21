package com.example.backend.service;

import com.example.backend.model.Lote;
import com.example.backend.repository.LoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LoteService {

    @Autowired
    private LoteRepository loteRepository;

    public List<Lote> findAll() {
        return loteRepository.findAll();
    }

    public Optional<Lote> findById(Long id) {
        return loteRepository.findById(id);
    }

    public List<Lote> findByProductoId(Long productoId) {
        return loteRepository.findByProductoId(productoId);
    }

    public Lote save(Lote lote) {
        return loteRepository.save(lote);
    }

    public void deleteById(Long id) {
        loteRepository.deleteById(id);
    }
}
