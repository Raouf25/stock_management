package com.example.stock_management.repository;

import com.example.stock_management.model.Product;
import com.example.stock_management.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    @Query("SELECT s FROM Sale s WHERE s.product.idProduct IN :ids")
    List<Sale> findAllByProductIds(@Param("ids") Collection<Long> ids);

    List<Sale> findByProduct_IdProduct(Long productId);

    List<Sale> findByProduct(Product product);

    @Query("SELECT s FROM Sale s WHERE s.dateSale BETWEEN :dateFrom AND :dateTo")
    List<Sale> findByDateRange(@Param("dateFrom") LocalDate dateFrom, @Param("dateTo") LocalDate dateTo);

    @Query("SELECT s FROM Sale s WHERE s.product.idProduct = :productId AND s.dateSale BETWEEN :dateFrom AND :dateTo")
    List<Sale> findByProductAndDateRange(
        @Param("productId") Long productId,
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo") LocalDate dateTo
    );

    @Query("SELECT COALESCE(SUM(s.totalSaleAmount), 0) FROM Sale s WHERE s.product.idProduct = :productId")
    BigDecimal findTotalSalesAmountByProduct(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(s.quantitySold), 0) FROM Sale s WHERE s.product.idProduct = :productId")
    Integer findTotalSalesQuantityByProduct(@Param("productId") Long productId);
}
