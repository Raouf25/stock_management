package com.example.stock_management.repository;

import com.example.stock_management.model.BillProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillProductRepository extends JpaRepository<BillProduct, Long> {
    // Méthodes de requêtes personnalisées si nécessaire
}
