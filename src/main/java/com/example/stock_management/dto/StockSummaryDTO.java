package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockSummaryDTO {
    private Long productId;
    private String productDesignation;
    private Integer initialQuantity;
    private Double initialValue;
    private Double totalPurchasesAmount; // Total achats en TTC
    private Double totalSalesAmount; // Total ventes en TTC
    private Integer finalQuantity; // stock final
    private Double finalStockValue; // Valeur du stock final
    private Double cmp; // Coût Moyen Pondéré
}
