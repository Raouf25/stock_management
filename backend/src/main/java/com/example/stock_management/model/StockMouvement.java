package com.example.stock_management.model;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "stock_mouvement")
public class StockMouvement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private Integer quantity;
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private Type type; // ENTREE | SORTIE

    @Enumerated(EnumType.STRING)
    private Source source; // ACHAT, VENTE, AJUSTEMENT

    @OneToOne
    @JoinColumn(name = "purchase_id")
    private Purchase purchase;

    @OneToOne
    @JoinColumn(name = "sale_id")
    private Sale sale;

    private String reference; // référence source (ex: numéro de commande, numéro de facture)

    public enum Type {
        ENTREE, SORTIE
    }

    public enum Source {
        ACHAT, VENTE, AJUSTEMENT
    }
}
