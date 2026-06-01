package com.example.stock_management.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseDTO {
    private Long id;
    private LocalDate datePurchase;

    @NotNull(message = "supplierId is required")
    private Long supplierId;

    private String supplierName;

    @NotNull(message = "productId is required")
    private Long productId;

    private String productName;
    private String productDesignation;
    private String invoiceNumber;

    @NotNull(message = "quantity is required")
    @Positive(message = "quantity must be greater than 0")
    private Integer quantity;

    @NotNull(message = "unitPriceTTC is required")
    @Positive(message = "unitPriceTTC must be greater than 0")
    private Double unitPriceTTC;

    private Double totalAmountTTC;
    private String comment;
}
