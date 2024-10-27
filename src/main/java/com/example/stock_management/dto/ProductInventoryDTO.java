package com.example.stock_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;


@Data
public class ProductInventoryDTO {
    private Long productId;
    private String productName;
    private Integer initialStock;
    private Integer currentStock;
    private List<SalesEvolution> salesEvolution;

    @Data
    @AllArgsConstructor // Constructeur public nécessaire pour Hibernate
    public static class SalesEvolution {
        private LocalDateTime date;
        private Long quantitySold;
        private Long quantitySoldCumulative;
        private Long stockQuantity;
    }
}
