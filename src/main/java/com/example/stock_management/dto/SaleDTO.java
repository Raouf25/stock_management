package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleDTO {
    private Long id;
    private LocalDateTime dateSale;
    private Long productId;
    private String productDesignation;
    private Integer quantitySold;
    private Double unitSalePrice;
    private Double totalSaleAmount;
}
