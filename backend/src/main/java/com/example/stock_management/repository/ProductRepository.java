package com.example.stock_management.repository;


import com.example.stock_management.dto.ProductDashboardDTO;
import com.example.stock_management.dto.ProductInventoryDTO;
import com.example.stock_management.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE  p.currentStockQuantity > 0")
    List<Product> getAvailableProducts();


    /*
      WITH ventes AS (
        SELECT
            product_id,
            COUNT(*) AS nombre_ventes,
            sum(total_sale_amount) AS total_vente,
            sum(quantity_sold) AS total_quantite_vendue,
            sum(total_sale_amount)/sum(quantity_sold) AS prix_vente_moyen
        FROM sale
        --WHERE product_id = 109
        GROUP BY product_id
    ),
         achats AS (
             SELECT
                 product_id,
                 COUNT(*) AS nombre_achats,
                 sum(total_amountttc) AS total_achat,
                 sum(quantity) AS total_quantite_achetee,
                 sum(total_amountttc)/sum(quantity) AS prix_achat_moyen
             FROM purchase
            -- WHERE product_id = 109
             GROUP BY product_id
         )
    SELECT
        COALESCE(v.product_id, a.product_id) AS product_id,
        COALESCE(v.total_quantite_vendue, 0) AS total_quantite_vendue,
        COALESCE(a.total_quantite_achetee, 0) AS total_quantite_achetee,
        COALESCE(a.nombre_achats, 0) AS nombre_achats,
        COALESCE(a.total_achat, 0) AS total_achat,
        COALESCE(v.nombre_ventes, 0) AS nombre_ventes,
        COALESCE(v.total_vente, 0) AS total_vente,
        COALESCE(v.prix_vente_moyen, 0) AS prix_vente_moyen,
        COALESCE(a.prix_achat_moyen, 0) AS prix_achat_moyen
    FROM ventes v
             FULL OUTER JOIN achats a ON v.product_id = a.product_id;
     */
    @Query("SELECT new com.example.stock_management.dto.ProductDashboardDTO(" +
            "  p.idProduct," +
            "  p.reference," +
            "  p.name," +
            "  p.category," +
            "  p.unit," +
            "  p.unitPrice," +
            "  p.unitPriceSold," +
            "  p.currentStockQuantity," +
            "  COALESCE((SELECT SUM(sv.quantitySold)   FROM Sale sv     WHERE sv.product  = p), 0L)," +
            "  COALESCE((SELECT SUM(pa.quantity)        FROM Purchase pa  WHERE pa.product  = p), 0L)" +
            "    - COALESCE((SELECT SUM(sv2.quantitySold) FROM Sale sv2   WHERE sv2.product = p), 0L)," +
            "  COALESCE((SELECT COUNT(pa2)              FROM Purchase pa2 WHERE pa2.product = p), 0L)," +
            "  COALESCE((SELECT SUM(pa3.totalAmountTTC) / SUM(pa3.quantity) FROM Purchase pa3 WHERE pa3.product = p), 0.0)," +
            "  COALESCE((SELECT COUNT(sv3)              FROM Sale sv3     WHERE sv3.product = p), 0L)," +
            "  COALESCE((SELECT SUM(sv4.totalSaleAmount) / SUM(sv4.quantitySold) FROM Sale sv4 WHERE sv4.product = p), 0.0)," +
            "  COALESCE((SELECT SUM(sv5.totalSaleAmount) FROM Sale sv5   WHERE sv5.product = p), 0.0)" +
            "    - COALESCE((SELECT SUM(pa4.totalAmountTTC) FROM Purchase pa4 WHERE pa4.product = p), 0.0)" +
            ") " +
            "FROM Product p " +
            "WHERE EXISTS (SELECT 1 FROM Purchase px WHERE px.product = p)" +
            "   OR EXISTS (SELECT 1 FROM Sale sx WHERE sx.product = p) " +
            "ORDER BY LOWER(p.name) ASC")
    List<ProductDashboardDTO> findProductsDashboardData();

    @Query("SELECT COALESCE(SUM(cp.quantity), 0) FROM BillProduct cp WHERE cp.product.idProduct = :idProduct")
    Integer findTotalArticlesSold(Long idProduct);

    @Query("SELECT p.currentStockQuantity FROM Product p WHERE p.idProduct = :idProduct")
    Integer findStockByProductId(Long idProduct);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.currentStockQuantity = p.currentStockQuantity - :quantite WHERE p.idProduct = :idProduct")
    void updateStock(Long idProduct, Integer quantite);


/*
    @Query("""
        SELECT NEW com.example.stock_management.dto.ProductInventoryDTO$SalesEvolution(
            bp.bill.dateBill,
            SUM(bp.quantity),
            SUM(SUM(bp.quantity)) OVER (ORDER BY bp.bill.dateBill),
            p.initialStockQuantity - SUM(SUM(bp.quantity)) OVER (ORDER BY bp.bill.dateBill)
        )
        FROM Product p
        LEFT JOIN BillProduct bp ON bp.product.idProduct = p.idProduct
        WHERE p.idProduct = :idProduct
          AND (cast(:startDate as date) IS NULL OR bp.bill.dateBill >= :startDate)
          AND (cast(:endDate as date) IS NULL OR bp.bill.dateBill <= :endDate)
        GROUP BY bp.bill.dateBill, p.initialStockQuantity
        ORDER BY bp.bill.dateBill
       """)
    List<ProductInventoryDTO.SalesEvolution> findSalesEvolution(Long idProduct, LocalDateTime startDate, LocalDateTime endDate);
*/

    @Query("SELECT distinct lower(p.category) as category FROM Product p ORDER BY category ASC")
    List<String> getProductsCategories();


    @Query("SELECT p FROM Product p WHERE lower(p.category) = :category")
    List<Product> getProductsByCategory(String category);

    @Query("SELECT p FROM Product p WHERE lower(p.category) = :category")
    Map<String, Float> getProductsStatesCategories();

    @Query("SELECT p FROM Product p WHERE p.supplier.id = :supplierId")
    List<Product> findBySupplierId(Long supplierId);
}
