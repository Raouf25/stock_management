package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseDTO {
    private Long id;
    private LocalDateTime datePurchase;
    private Long supplierId;
    private String supplierName;
    private Long productId;
    private String productDesignation;
    private String invoiceNumber;
    private Integer quantity;
    private Double unitPriceTTC;
    private Double totalAmountTTC;
    private String comment;
}
