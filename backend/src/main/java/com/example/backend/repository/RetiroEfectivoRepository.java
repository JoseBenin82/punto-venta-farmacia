package com.example.backend.repository;

import com.example.backend.model.RetiroEfectivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RetiroEfectivoRepository extends JpaRepository<RetiroEfectivo, Long> {
    List<RetiroEfectivo> findByCorteCajaId(Long corteCajaId);
}
