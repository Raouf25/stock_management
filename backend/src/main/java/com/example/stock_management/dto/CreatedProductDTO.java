package com.example.stock_management.dto;

import lombok.Data;

@Data
public class CreatedProductDTO {
    private String nom;
    private String description;
    private Double prixUnitaire;
}
