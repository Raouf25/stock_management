package com.example.stock_management.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private String gamme;
    private String unit;

    @Column(precision = 19, scale = 3)
    private BigDecimal unitPriceSold;

    @Column(precision = 19, scale = 3)
    private BigDecimal unitPrice;

    private String imageUrl;

    // Stock initial
    private Integer initialStockQuantity;

    @Column(precision = 19, scale = 3)
    private BigDecimal initialUnitPrice;

    @Column(precision = 19, scale = 3)
    private BigDecimal initialStockValue;

    // Stock actuel
    private Integer currentStockQuantity;

    @Column(precision = 19, scale = 3)
    private BigDecimal currentStockValue;

    // CMP = currentStockValue / currentStockQuantity
    @Column(precision = 19, scale = 3)
    private BigDecimal cmp;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
