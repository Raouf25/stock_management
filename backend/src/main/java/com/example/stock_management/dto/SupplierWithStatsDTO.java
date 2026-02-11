package com.example.stock_management.dto;

import com.example.stock_management.model.Supplier;

import java.math.BigDecimal;

public record SupplierWithStatsDTO(
    Supplier supplier,
    Long totalPurchases,
    BigDecimal totalAmount,
    Integer totalProductsSupplied
) {}
