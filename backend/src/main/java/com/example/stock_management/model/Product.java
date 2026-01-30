package com.example.stock_management.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProduct;
    private Long reference;

    private String designation;
    private String name;
    private String description;
    private String category;
    private String unit;
    private Double unitPriceSold;
    private Double unitPriceBought;
    
    // Image URL du produit
    private String imageUrl;
    
    // Stock initial
    private Integer initialStockQuantity;
    private Double initialUnitPrice; // prix unitaire initial TTC
    private Double initialStockValue; // valeur initiale = quantiteInitiale * prixUnitaireInitial
    
    // Stock actuel
    private Integer currentStockQuantity;
    
    // Valeur du stock actuel
    private Double currentStockValue; // valeur stock final
    
    // CMP (Coût Moyen Pondéré)
    private Double cmp; // = valeurStockFinal / quantiteStockFinal
    
    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;
}
