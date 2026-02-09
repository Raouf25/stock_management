package com.example.stock_management.dto;

import com.example.stock_management.model.Customer;

import java.math.BigDecimal;

public record CustomerWithStatsDTO(
    Customer customer,
    BigDecimal totalCA,
    BigDecimal unpaidAmount
) {}
