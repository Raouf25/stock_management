package com.example.stock_management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for creating a new invoice with all required information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceCreationDTO {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Invoice date is required")
    private LocalDate billDate;

    @NotBlank(message = "Payment terms are required")
    private String paymentTerms;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    private String notes;

    @Min(value = 0, message = "Discount cannot be negative")
    @Max(value = 100, message = "Discount cannot exceed 100%")
    private BigDecimal discount = BigDecimal.ZERO;

    @Min(value = 0, message = "Deposit cannot be negative")
    private BigDecimal deposit = BigDecimal.ZERO;

    @NotEmpty(message = "At least one product is required")
    @Valid
    private List<InvoiceLineItemDTO> products;

    /**
     * Inner DTO for line items in invoice
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvoiceLineItemDTO {

        @NotNull(message = "Product ID is required")
        private Long productId;

        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be greater than 0")
        private BigDecimal unitPrice;

        @Min(value = 0, message = "Discount cannot be negative")
        @Max(value = 100, message = "Discount cannot exceed 100%")
        private BigDecimal discount = BigDecimal.ZERO;
    }
}
