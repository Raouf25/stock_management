package com.example.stock_management.repository;


import com.example.stock_management.model.StockMouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StockMouvementRepository extends JpaRepository<StockMouvement, Long> {

    // Trouver tous les mouvements pour un produit
    List<StockMouvement> findByProduct_IdProduct(Long productId);

    // Trouver les mouvements par type
    List<StockMouvement> findByType(StockMouvement.Type type);

    // Trouver les mouvements par source
    List<StockMouvement> findBySource(StockMouvement.Source source);

    // Trouver les mouvements entre deux dates
    @Query("SELECT sm FROM StockMouvement sm WHERE sm.date BETWEEN :dateFrom AND :dateTo ORDER BY sm.date")
    List<StockMouvement> findByDateRange(
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo") LocalDate dateTo
    );

    // Trouver les mouvements pour un produit et une date
    @Query("SELECT sm FROM StockMouvement sm WHERE sm.product.idProduct = :productId AND sm.date BETWEEN :dateFrom AND :dateTo ORDER BY sm.date")
    List<StockMouvement> findByProductAndDateRange(
        @Param("productId") Long productId,
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo") LocalDate dateTo
    );

    // Trouver les mouvements par produit et type
    @Query("SELECT sm FROM StockMouvement sm WHERE sm.product.idProduct = :productId AND sm.type = :type ORDER BY sm.date")
    List<StockMouvement> findByProductAndType(
        @Param("productId") Long productId,
        @Param("type") StockMouvement.Type type
    );
}
