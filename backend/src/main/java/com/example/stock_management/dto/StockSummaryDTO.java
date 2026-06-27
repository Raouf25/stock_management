package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockSummaryDTO {
    private Long productId;
    private String productDesignation;
    private Integer initialQuantity;
    private BigDecimal initialValue;
    private BigDecimal totalPurchasesAmount;
    private BigDecimal totalSalesAmount;
    private Integer finalQuantity;
    private BigDecimal finalStockValue;
    private BigDecimal cmp;
}
