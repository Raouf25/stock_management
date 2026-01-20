package com.example.stock_management.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "purchase")
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime datePurchase;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private String invoiceNumber; // Numéro de pièce / BL N°
    private Integer quantity;
    private Double unitPriceTTC; // Prix unitaire TTC
    private Double totalAmountTTC; // quantity × unitPriceTTC
    private String comment;

    // Préserver la relation avec l'historique
    @OneToOne(mappedBy = "purchase")
    private StockMouvement stockMouvement;
}
