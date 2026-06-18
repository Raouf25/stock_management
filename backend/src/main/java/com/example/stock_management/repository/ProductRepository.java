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

    @Query("SELECT new com.example.stock_management.dto.ProductDashboardDTO(" +
            "  p, " +
            "  COALESCE(SUM(DISTINCT s.quantitySold), 0L), " +
            "  COALESCE(SUM(DISTINCT pur.quantity), 0L), " +
            "  COUNT(DISTINCT pur.id), " +
            "  COALESCE(AVG(DISTINCT pur.unitPriceTTC), 0.0), " +
            "  COUNT(DISTINCT s.id), " +
            "  COALESCE(AVG(DISTINCT s.unitSalePrice), 0.0), " +
            "  COALESCE(SUM(DISTINCT s.totalSaleAmount), 0.0), " +
            "  COALESCE(SUM(DISTINCT pur.totalAmountTTC), 0.0)" +
            ") " +
            "FROM Product p " +
            "LEFT JOIN Sale s ON s.product = p " +
            "LEFT JOIN Purchase pur ON pur.product = p " +
            "WHERE EXISTS (SELECT 1 FROM Purchase x WHERE x.product = p) " +
            "GROUP BY p.id " +
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

    @Query("SELECT distinct lower(p.category) as category FROM Product p ORDER BY category ASC")
    List<String> getProductsCategories();


    @Query("SELECT p FROM Product p WHERE lower(p.category) = :category")
    List<Product> getProductsByCategory(String category);

    @Query("SELECT p FROM Product p WHERE lower(p.category) = :category")
    Map<String, Float> getProductsStatesCategories();

    @Query("SELECT p FROM Product p WHERE p.supplier.id = :supplierId")
    List<Product> findBySupplierId(Long supplierId);
}
