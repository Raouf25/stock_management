package com.example.stock_management.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class BillProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_bill")
    private Bill bill;

    @ManyToOne
    @JoinColumn(name = "id_product")
    private Product product;

    private Integer quantity;
    private Double totalProductPrice;
    
    @Column(name = "discount_percentage")
    private Double discountPercentage; // Remise en pourcentage (0-100)

}
