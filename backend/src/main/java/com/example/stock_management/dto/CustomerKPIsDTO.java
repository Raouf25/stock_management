package com.example.stock_management.dto;

import java.math.BigDecimal;

public record CustomerKPIsDTO(
    Long totalCustomers,
    Long activeCustomers,
    Long blockedCustomers,
    Long newCustomersThisMonth,
    BigDecimal totalRevenue,
    BigDecimal averageRevenuePerCustomer,
    BigDecimal totalOutstanding
) {}
