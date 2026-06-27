package com.example.stock_management.repository;

import com.example.stock_management.model.BillProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

@Repository
public interface BillProductRepository extends JpaRepository<BillProduct, Long> {

    @Query("SELECT bp FROM BillProduct bp JOIN FETCH bp.bill b JOIN FETCH b.customer JOIN FETCH bp.product")
    List<BillProduct> findAllWithBillAndProduct();

    @Query("SELECT bp FROM BillProduct bp JOIN FETCH bp.bill b JOIN FETCH b.customer WHERE bp.product.idProduct IN :ids")
    List<BillProduct> findAllWithBillByProductIds(@Param("ids") Collection<Long> ids);

    @Query("SELECT COALESCE(SUM(bp.quantity), 0) FROM BillProduct bp WHERE bp.product.idProduct = :productId")
    Integer findTotalQuantityByProduct(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(bp.totalProductPrice), 0) FROM BillProduct bp WHERE bp.product.idProduct = :productId")
    BigDecimal findTotalAmountByProduct(@Param("productId") Long productId);
}
