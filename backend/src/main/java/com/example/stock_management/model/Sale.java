package com.example.stock_management.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "sale")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateSale;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private String invoiceNumber;
    private Integer quantitySold;
    private Double unitSalePrice; // Prix unitaire de vente TTC
    private Double totalSaleAmount; // quantitySold × unitSalePrice
    private String comment;

    // Préserver la relation avec l'historique
    @OneToOne(mappedBy = "sale")
    private StockMouvement stockMouvement;
}