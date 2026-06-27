package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleDTO {
    private Long id;
    private LocalDate dateSale;
    private Long productId;
    private String productName;
    private String productDesignation;
    private String customerName;
    private Integer quantitySold;
    private BigDecimal unitSalePrice;
    private BigDecimal totalSaleAmount;
    private String invoiceNumber;
    private String deliveryNoteNumber;
}
