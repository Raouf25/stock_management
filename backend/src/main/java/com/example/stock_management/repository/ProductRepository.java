package com.example.stock_management.repository;

import com.example.stock_management.dto.ProductDashboardDTO;
import com.example.stock_management.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.currentStockQuantity > 0")
    List<Product> getAvailableProducts();

    // Complex JPQL with correlated subqueries — replaced at the DB level by
    // mv_product_dashboard (V11). Call refreshDashboardView() after writes so
    // the view stays current; a future refactor can switch queries to the view.
    @Query("SELECT new com.example.stock_management.dto.ProductDashboardDTO(" +
            "  p.idProduct," +
            "  p.reference," +
            "  p.name," +
            "  p.category," +
            "  p.unit," +
            "  p.unitPrice," +
            "  p.unitPriceSold," +
            "  p.currentStockQuantity," +
            "  COALESCE((SELECT SUM(sv.quantitySold) FROM Sale sv WHERE sv.product = p), 0L)" +
            "  + COALESCE((SELECT SUM(bp.quantity) FROM BillProduct bp WHERE bp.product = p), 0L)," +
            "  COALESCE((SELECT SUM(pa.quantity) FROM Purchase pa WHERE pa.product = p), 0L)" +
            "  - COALESCE((SELECT SUM(sv2.quantitySold) FROM Sale sv2 WHERE sv2.product = p), 0L)" +
            "  - COALESCE((SELECT SUM(bp2.quantity) FROM BillProduct bp2 WHERE bp2.product = p), 0L)," +
            "  COALESCE((SELECT COUNT(pa2) FROM Purchase pa2 WHERE pa2.product = p), 0L)," +
            "  COALESCE((SELECT SUM(pa3.totalAmountTTC) / SUM(pa3.quantity) FROM Purchase pa3 WHERE pa3.product = p), 0)," +
            "  COALESCE((SELECT COUNT(sv3) FROM Sale sv3 WHERE sv3.product = p), 0L)" +
            "  + COALESCE((SELECT COUNT(bp3) FROM BillProduct bp3 WHERE bp3.product = p), 0L)," +
            "  COALESCE(" +
            "    (COALESCE((SELECT SUM(sv4.totalSaleAmount) FROM Sale sv4 WHERE sv4.product = p), 0)" +
            "    + COALESCE((SELECT SUM(bp4.totalProductPrice) FROM BillProduct bp4 WHERE bp4.product = p), 0))" +
            "    / NULLIF(COALESCE((SELECT SUM(sv5.quantitySold) FROM Sale sv5 WHERE sv5.product = p), 0L)" +
            "            + COALESCE((SELECT SUM(bp5.quantity) FROM BillProduct bp5 WHERE bp5.product = p), 0L), 0)" +
            "  , 0)," +
            "  COALESCE((SELECT SUM(sv6.totalSaleAmount) FROM Sale sv6 WHERE sv6.product = p), 0)" +
            "  + COALESCE((SELECT SUM(bp6.totalProductPrice) FROM BillProduct bp6 WHERE bp6.product = p), 0)" +
            "  - COALESCE((SELECT SUM(pa4.totalAmountTTC) FROM Purchase pa4 WHERE pa4.product = p), 0)" +
            ") " +
            "FROM Product p " +
            "WHERE EXISTS (SELECT 1 FROM Purchase px WHERE px.product = p)" +
            "   OR EXISTS (SELECT 1 FROM Sale sx WHERE sx.product = p)" +
            "   OR EXISTS (SELECT 1 FROM BillProduct bpx WHERE bpx.product = p) " +
            "ORDER BY LOWER(p.name) ASC")
    List<ProductDashboardDTO> findProductsDashboardData();

    // Refresh the materialized view (V11) — called by ProductDashboardService after writes
    @Modifying
    @Transactional
    @Query(value = "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_dashboard", nativeQuery = true)
    void refreshDashboardView();

    @Query("SELECT COALESCE(SUM(cp.quantity), 0) FROM BillProduct cp WHERE cp.product.idProduct = :idProduct")
    Integer findTotalArticlesSold(Long idProduct);

    @Query("SELECT p.currentStockQuantity FROM Product p WHERE p.idProduct = :idProduct")
    Integer findStockByProductId(Long idProduct);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.currentStockQuantity = p.currentStockQuantity - :quantite WHERE p.idProduct = :idProduct")
    void updateStock(Long idProduct, Integer quantite);

    @Query("SELECT distinct lower(p.category) as category FROM Product p ORDER BY category ASC")
    List<String> getProductsCategories();

    @Query("SELECT p FROM Product p WHERE lower(p.category) = :category")
    List<Product> getProductsByCategory(String category);

    @Query("SELECT p FROM Product p WHERE lower(p.category) = :category")
    Map<String, Float> getProductsStatesCategories();

    @Query("SELECT p FROM Product p WHERE p.supplier.id = :supplierId")
    List<Product> findBySupplierId(Long supplierId);
}
