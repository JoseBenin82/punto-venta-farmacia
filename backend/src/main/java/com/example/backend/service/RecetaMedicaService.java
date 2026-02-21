package com.example.backend.service;

import com.example.backend.model.RecetaMedica;
import com.example.backend.repository.RecetaMedicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecetaMedicaService {

    @Autowired
    private RecetaMedicaRepository recetaMedicaRepository;

    public List<RecetaMedica> obtenerTodas() {
        return recetaMedicaRepository.findAll();
    }

    public Optional<RecetaMedica> obtenerPorId(Long id) {
        return recetaMedicaRepository.findById(id);
    }

    public RecetaMedica guardarReceta(RecetaMedica receta) {
        return recetaMedicaRepository.save(receta);
    }

    public void eliminarReceta(Long id) {
        recetaMedicaRepository.deleteById(id);
    }
}
