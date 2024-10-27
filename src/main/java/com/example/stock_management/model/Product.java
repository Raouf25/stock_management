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

    private String name;
    private String description;
    private String category;
    private String unit;
    private Double unitPriceHt;
    private Double unitPriceTtc;
    private Integer currentStockQuantity;
    private Integer initialStockQuantity;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;
}
