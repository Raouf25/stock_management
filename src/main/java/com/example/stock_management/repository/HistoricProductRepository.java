package com.example.stock_management.repository;

import com.example.stock_management.model.HistoricProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoricProductRepository extends JpaRepository<HistoricProduct, Long> {
}
