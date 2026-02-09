package com.example.stock_management.model;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    private String name;
    private String address;
    private String phone;
    private String tvaCode;
    private String fax;
    private String email;
    
    // Nom et prénom du client (masculin tunisien)
    private String fullName;
    
    // Numéro de carte d'identité nationale tunisienne (8 chiffres commençant par 0)
    private String cin;
    
    // Plaque d'immatriculation tunisienne (format: "Y تونس X")
    private String licensePlate;
    
    @Enumerated(EnumType.STRING)
    private CustomerStatus status;
    
    private String city;
    
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = CustomerStatus.ACTIVE;
        }
    }
}
