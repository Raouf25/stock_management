package com.example.stock_management.dto;

import com.example.stock_management.model.Product;
import com.example.stock_management.model.Purchase;
import com.example.stock_management.model.Sale;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ProductDashboardDTO {
    private Product product;
    private Long stockVendu;
    private Long stockEntrepot;
    private Long purchasesCount;
    private Double averagePurchasePrice;
    private Long salesCount;
    private Double averageSalePrice;
    private Double bilan;
    private List<Purchase> purchases;
    private List<Sale> sales;

    public ProductDashboardDTO(Product product, Long stockVendu, Long totalPurchaseQty,
                               Long purchasesCount, Double averagePurchasePrice,
                               Long salesCount, Double averageSalePrice,
                               Double totalSaleAmountSales, Double totalAmountTTCPurchases) {
        this.product = product;
        this.stockVendu = stockVendu != null ? stockVendu : 0L;

        long totalPurchased = totalPurchaseQty != null ? totalPurchaseQty : 0L;
        this.stockEntrepot = Math.max(0L, totalPurchased - this.stockVendu);

        this.purchasesCount = purchasesCount != null ? purchasesCount : 0L;
        this.averagePurchasePrice = averagePurchasePrice != null ? averagePurchasePrice : 0.0;

        this.salesCount = salesCount != null ? salesCount : 0L;
        this.averageSalePrice = averageSalePrice != null ? averageSalePrice : 0.0;

        double salesTotal = totalSaleAmountSales != null ? totalSaleAmountSales : 0.0;
        double purchasesTotal = totalAmountTTCPurchases != null ? totalAmountTTCPurchases : 0.0;
        this.bilan = salesTotal - purchasesTotal;
    }

}