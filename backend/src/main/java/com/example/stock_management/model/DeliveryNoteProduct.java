package com.example.stock_management.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "delivery_note_product")
public class DeliveryNoteProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_delivery_note_product")
    private Long idDeliveryNoteProduct;

    @ManyToOne
    @JoinColumn(name = "delivery_note_id", nullable = false)
    @ToString.Exclude
    @JsonBackReference
    private DeliveryNote deliveryNote;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"supplier"})
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 19, scale = 3, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 19, scale = 3, nullable = false)
    private BigDecimal totalPrice;

    @Column(nullable = true, precision = 19, scale = 3)
    private BigDecimal discount; // Discount percentage for this product

    @PrePersist
    @PreUpdate
    public void calculateTotalPrice() {
        if (unitPrice != null && quantity != null) {
            BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(quantity));
            if (discount != null && discount.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal discountAmount = total.multiply(discount).divide(BigDecimal.valueOf(100));
                total = total.subtract(discountAmount);
            }
            this.totalPrice = total;
        }
    }
}
