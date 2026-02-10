package com.example.stock_management.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DeliveryNoteDTO {
    private Long customerId;
    private LocalDateTime dateDelivery;
    private String deliveryAddress;
    private String notes;
    private BigDecimal discount;
    private Boolean applyTva = false; // Par défaut, la TVA n'est pas appliquée
    private List<DeliveryNoteProductDTO> products;
}
