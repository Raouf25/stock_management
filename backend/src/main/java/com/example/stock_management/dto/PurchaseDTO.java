package com.example.stock_management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseDTO {
    private Long id;

    @NotNull(message = "datePurchase is required")
    private LocalDate datePurchase;

    @NotNull(message = "supplierId is required")
    private Long supplierId;

    private String supplierName;
    private String invoiceNumber;
    private String comment;

    // Rétrocompatibilité — champs racines pour l'affichage HTML du tableau
    private Integer quantity;
    private BigDecimal unitPriceTTC;
    private BigDecimal totalAmountTTC;

    @Valid
    private List<PurchaseLineDTO> lines;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseLineDTO {
        @NotNull(message = "productId is required")
        private Long productId;

        private String productName;
        private String productDesignation;

        @NotNull(message = "quantity is required")
        @Positive(message = "quantity must be greater than 0")
        private Integer quantity;

        @NotNull(message = "unitPriceTTC is required")
        @Positive(message = "unitPriceTTC must be greater than 0")
        private BigDecimal unitPriceTTC;

        private BigDecimal totalLineAmountTTC;
    }
}
