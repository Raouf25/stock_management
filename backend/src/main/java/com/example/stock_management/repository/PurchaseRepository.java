package com.example.stock_management.repository;

import com.example.stock_management.model.Product;
import com.example.stock_management.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    @Query("SELECT p FROM Purchase p WHERE p.product.idProduct IN :ids")
    List<Purchase> findAllByProductIds(@Param("ids") Collection<Long> ids);

    List<Purchase> findBySupplier_Id(Long supplierId);

    List<Purchase> findByProduct(Product productId);

    List<Purchase> findByProduct_IdProduct(Long productId);

    @Query("SELECT p FROM Purchase p WHERE p.datePurchase BETWEEN :dateFrom AND :dateTo")
    List<Purchase> findByDateRange(@Param("dateFrom") LocalDate dateFrom, @Param("dateTo") LocalDate dateTo);

    @Query("SELECT p FROM Purchase p WHERE p.supplier.id = :supplierId AND p.datePurchase BETWEEN :dateFrom AND :dateTo")
    List<Purchase> findBySupplierAndDateRange(
        @Param("supplierId") Long supplierId,
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo") LocalDate dateTo
    );

    @Query("SELECT COALESCE(SUM(p.totalAmountTTC), 0) FROM Purchase p WHERE p.product.idProduct = :productId")
    BigDecimal findTotalPurchasesAmountByProduct(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Purchase p WHERE p.product.idProduct = :productId")
    Integer findTotalPurchasesQuantityByProduct(@Param("productId") Long productId);

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.supplier.id = :supplierId")
    Long countPurchasesBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT COALESCE(SUM(p.totalAmountTTC), 0) FROM Purchase p WHERE p.supplier.id = :supplierId")
    BigDecimal sumTotalAmountBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT COUNT(DISTINCT p.product.idProduct) FROM Purchase p WHERE p.supplier.id = :supplierId")
    Long countDistinctProductsBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT COALESCE(SUM(p.totalAmountTTC), 0) FROM Purchase p")
    BigDecimal sumAllPurchaseAmount();

    @Query("SELECT COUNT(DISTINCT p.supplier.id) FROM Purchase p WHERE p.datePurchase >= :dateFrom")
    Long countDistinctSuppliersWithPurchasesSince(@Param("dateFrom") LocalDate dateFrom);
}
