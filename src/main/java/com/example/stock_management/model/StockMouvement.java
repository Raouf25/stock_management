package com.example.stock_management.model;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class StockMouvement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMouvement;

    @ManyToOne
    @JoinColumn(name = "idProduct")
    private Product product;

    private Integer quantiteChangee;
    private LocalDateTime dateMouvement;

    @Enumerated(EnumType.STRING)
    private TypeMouvement typeMouvement;

    public enum TypeMouvement {
        AJOUT, RETRAIT, RETOUR
    }
}
