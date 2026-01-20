package com.example.stock_management.model;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class HistoricProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idHistoric;

    @ManyToOne
    @JoinColumn(name = "idProduct")
    private Product product;

    private String operation;
    private LocalDateTime dateOperation;
    private String detailsModification;
}
