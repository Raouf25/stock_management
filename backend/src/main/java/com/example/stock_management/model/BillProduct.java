package com.example.stock_management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
public class BillProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_bill")
    @JsonIgnore
    private Bill bill;

    @ManyToOne
    @JoinColumn(name = "id_product")
    private Product product;

    private Integer quantity;

    @Column(precision = 19, scale = 3)
    private BigDecimal totalProductPrice;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;
}
