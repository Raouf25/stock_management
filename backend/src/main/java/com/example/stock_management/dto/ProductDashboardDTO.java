package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDashboardDTO {
    private Long productId;
    private Long reference;
    private String name;
    private String category;
    private String unit;
    private Double unitPrice;
    private Double unitPriceSold;
    private Integer currentStockQuantity;
    private Long stockVendu;
    private Long stockEntrepot;
    private Long purchasesCount;
    private Double averagePurchasePrice;
    private Long salesCount;
    private Double averageSalePrice;
    private Double bilan;
}