package com.example.stock_management.repository;

import com.example.stock_management.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Trouver toutes les ventes par produit
    List<Sale> findByProduct_IdProduct(Long productId);

    // Trouver les ventes entre deux dates
    @Query("SELECT s FROM Sale s WHERE s.dateSale BETWEEN :dateFrom AND :dateTo")
    List<Sale> findByDateRange(@Param("dateFrom") LocalDate dateFrom, @Param("dateTo") LocalDate dateTo);

    // Trouver les ventes par produit et date
    @Query("SELECT s FROM Sale s WHERE s.product.idProduct = :productId AND s.dateSale BETWEEN :dateFrom AND :dateTo")
    List<Sale> findByProductAndDateRange(
        @Param("productId") Long productId,
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo") LocalDate dateTo
    );

    // Total des ventes pour un produit
    @Query("SELECT COALESCE(SUM(s.totalSaleAmount), 0.0) FROM Sale s WHERE s.product.idProduct = :productId")
    Double findTotalSalesAmountByProduct(@Param("productId") Long productId);

    // Total des quantités vendues pour un produit
    @Query("SELECT COALESCE(SUM(s.quantitySold), 0) FROM Sale s WHERE s.product.idProduct = :productId")
    Integer findTotalSalesQuantityByProduct(@Param("productId") Long productId);
}
