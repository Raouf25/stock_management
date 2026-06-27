package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDashboardDTO {
    private Long productId;
    private Long reference;
    private String name;
    private String category;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal unitPriceSold;
    private Integer currentStockQuantity;
    private Long stockVendu;
    private Long stockEntrepot;
    private Long purchasesCount;
    private BigDecimal averagePurchasePrice;
    private Long salesCount;
    private BigDecimal averageSalePrice;
    private BigDecimal bilan;
}
