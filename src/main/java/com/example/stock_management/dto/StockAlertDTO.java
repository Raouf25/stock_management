package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockAlertDTO {
    private Long productId;
    private String productDesignation;
    private Integer currentQuantity;
    private Integer threshold;
    private String alertLevel; // LOW, CRITICAL
}
