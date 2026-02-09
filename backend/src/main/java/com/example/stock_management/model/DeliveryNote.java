package com.example.stock_management.model;

import com.example.stock_management.dto.DeliveryNoteStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "delivery_note")
public class DeliveryNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_delivery_note")
    private Long idDeliveryNote;

    @Column(name = "delivery_note_number", unique = true, nullable = false, length = 50)
    private String deliveryNoteNumber;

    @Column(name = "date_delivery", nullable = false)
    private LocalDateTime dateDelivery;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "deliveryNote", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @JsonManagedReference
    private List<DeliveryNoteProduct> deliveryNoteProducts;

    @Column(precision = 19, scale = 3)
    private BigDecimal totalAmount;

    @Column(nullable = true, precision = 19, scale = 3)
    private BigDecimal discount; // Discount percentage (0-100)

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DeliveryNoteStatus status;

    // Relation vers la facture si le BL a été transformé
    @ManyToOne
    @JoinColumn(name = "bill_id")
    @JsonIgnoreProperties({"deliveryNotes", "customer", "billProducts"})
    private Bill bill;

    @Column(name = "invoiced", nullable = false)
    private Boolean invoiced = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = DeliveryNoteStatus.PENDING;
        }
        if (invoiced == null) {
            invoiced = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
