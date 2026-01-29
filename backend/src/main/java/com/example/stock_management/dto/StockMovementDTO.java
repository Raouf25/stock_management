package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productDesignation;
    private Integer quantity;
    private LocalDate date;
    private String type; // ENTREE | SORTIE
    private String source; // ACHAT, VENTE, AJUSTEMENT
    private String reference;
}
