package com.example.stock_management.model;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class HistoricBill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idHistoric;

    @ManyToOne
    @JoinColumn(name = "id_bill")
    private Bill bill;

    private String operation;
    private LocalDateTime dateOperation;
    private String detailsModification;
}
