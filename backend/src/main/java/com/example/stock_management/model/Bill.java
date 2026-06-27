package com.example.stock_management.model;

import com.example.stock_management.dto.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bill")
    private Long idBill;

    private LocalDateTime dateBill;

    @ManyToOne
    @JoinColumn(name = "customerId")
    private Customer customer;

    @ToString.Exclude
    @OneToMany(mappedBy = "bill", fetch = FetchType.EAGER,
            cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillProduct> billProducts;

    @Column(precision = 19, scale = 3)
    private BigDecimal total;

    @Column(nullable = true, precision = 19, scale = 3)
    private BigDecimal deposit;

    @Column(name = "amount_due", precision = 19, scale = 3)
    private BigDecimal amountDue;

    @Column(nullable = true, precision = 19, scale = 3)
    private BigDecimal discount;

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(name = "apply_tva", nullable = false)
    private Boolean applyTva = false;

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
