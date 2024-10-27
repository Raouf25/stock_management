package com.example.stock_management.repository;


import com.example.stock_management.model.StockMouvement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMouvementRepository extends JpaRepository<StockMouvement, Long> {
}
