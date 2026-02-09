package com.example.stock_management.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DeliveryNoteProductDTO {
    private Long productId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal discount;
}
