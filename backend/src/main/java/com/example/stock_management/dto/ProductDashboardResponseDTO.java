package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

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
        private Double salePrice;
        private Integer stock;
    }

    @Data
    @AllArgsConstructor
    public static class Statistics {
        private Double averagePurchasePrice;
        private Double averageSalePrice;
        private Double balance;
    }

    @Data
    @AllArgsConstructor
    public static class PurchaseItem {
        private Long id;
        private LocalDate date;
        private String supplierName;
        private Integer quantity;
        private Double unitPrice;
        private Double total;
        private String invoiceNumber;
    }

    @Data
    @AllArgsConstructor
    public static class SaleItem {
        private Long id;
        private LocalDate date;
        private String customerName;
        private Integer quantity;
        private Double unitPrice;
        private Double total;
        private String invoiceNumber;
        private String deliveryNoteNumber;
        private String paymentStatus;
    }
}
