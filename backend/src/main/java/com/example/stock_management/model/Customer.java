package com.example.stock_management.model;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

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
}
