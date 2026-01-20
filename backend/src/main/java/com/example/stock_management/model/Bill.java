package com.example.stock_management.model;

import com.example.stock_management.dto.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bill")
    private Long idBill;

    private LocalDateTime dateBill;

    @ManyToOne
    @JoinColumn(name = "customerId")
    private Customer customer;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // Exclusion de la relation pour éviter la récursion infinie
    private List<BillProduct> billProducts;

    private double total;
    
    @Column(nullable = true)
    private Double deposit;// "Acompte"

    @Column(name = "amount_due")
    private double amountDue;// "Net à payer"


    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;
}
