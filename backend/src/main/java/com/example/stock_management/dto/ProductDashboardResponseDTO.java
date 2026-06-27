package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
public class ProductDashboardResponseDTO {

    private ProductSummary product;
    private Statistics statistics;
    private List<PurchaseItem> purchases;
    private List<SaleItem> sales;

    @Data
    @AllArgsConstructor
    public static class ProductSummary {
        private Long id;
        private Long reference;
        private String name;
        private String category;
        private String unit;
        private BigDecimal salePrice;
        private Integer stock;
    }

    @Data
    @AllArgsConstructor
    public static class Statistics {
        private BigDecimal averagePurchasePrice;
        private BigDecimal averageSalePrice;
        private BigDecimal balance;
    }

    @Data
    @AllArgsConstructor
    public static class PurchaseItem {
        private Long id;
        private LocalDate date;
        private String supplierName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal total;
        private String invoiceNumber;
    }

    @Data
    @AllArgsConstructor
    public static class SaleItem {
        private Long id;
        private LocalDate date;
        private String customerName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal total;
        private String invoiceNumber;
        private String deliveryNoteNumber;
        private String paymentStatus;
    }
}
