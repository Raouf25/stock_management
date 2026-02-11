package com.example.stock_management.dto;

import java.math.BigDecimal;

public record SupplierKPIsDTO(
    Long totalSuppliers,
    Long activeSuppliers,
    Long suppliersWithRecentPurchases,
    Long totalPurchases,
    BigDecimal totalPurchaseAmount,
    BigDecimal averagePurchasePerSupplier
) {}
