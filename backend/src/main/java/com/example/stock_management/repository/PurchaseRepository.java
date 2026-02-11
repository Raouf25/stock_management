package com.example.stock_management.repository;

import com.example.stock_management.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    // Trouver tous les achats par fournisseur
    List<Purchase> findBySupplier_Id(Long supplierId);

    // Trouver tous les achats par produit
    List<Purchase> findByProduct_IdProduct(Long productId);

    // Trouver les achats entre deux dates
    @Query("SELECT p FROM Purchase p WHERE p.datePurchase BETWEEN :dateFrom AND :dateTo")
    List<Purchase> findByDateRange(@Param("dateFrom") LocalDate dateFrom, @Param("dateTo") LocalDate dateTo);

    // Trouver les achats par fournisseur et date
    @Query("SELECT p FROM Purchase p WHERE p.supplier.id = :supplierId AND p.datePurchase BETWEEN :dateFrom AND :dateTo")
    List<Purchase> findBySupplierAndDateRange(
        @Param("supplierId") Long supplierId,
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo") LocalDate dateTo
    );

    // Total des achats pour un produit
    @Query("SELECT COALESCE(SUM(p.totalAmountTTC), 0.0) FROM Purchase p WHERE p.product.idProduct = :productId")
    Double findTotalPurchasesAmountByProduct(@Param("productId") Long productId);

    // Total des quantités achetées pour un produit
    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Purchase p WHERE p.product.idProduct = :productId")
    Integer findTotalPurchasesQuantityByProduct(@Param("productId") Long productId);
    
    // Statistiques par fournisseur
    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.supplier.id = :supplierId")
    Long countPurchasesBySupplierId(@Param("supplierId") Long supplierId);
    
    @Query("SELECT COALESCE(SUM(p.totalAmountTTC), 0.0) FROM Purchase p WHERE p.supplier.id = :supplierId")
    Double sumTotalAmountBySupplierId(@Param("supplierId") Long supplierId);
    
    @Query("SELECT COUNT(DISTINCT p.product.idProduct) FROM Purchase p WHERE p.supplier.id = :supplierId")
    Long countDistinctProductsBySupplierId(@Param("supplierId") Long supplierId);
    
    @Query("SELECT COALESCE(SUM(p.totalAmountTTC), 0.0) FROM Purchase p")
    Double sumAllPurchaseAmount();
    
    @Query("SELECT COUNT(DISTINCT p.supplier.id) FROM Purchase p WHERE p.datePurchase >= :dateFrom")
    Long countDistinctSuppliersWithPurchasesSince(@Param("dateFrom") LocalDate dateFrom);
}
