package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementDTO {
    private Long id;
    private Long productId;
    private String productDesignation;
    private Integer quantity;
    private LocalDateTime date;
    private String type; // ENTREE | SORTIE
    private String source; // ACHAT, VENTE, AJUSTEMENT
    private String reference;
}
