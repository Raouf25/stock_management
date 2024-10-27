package com.example.stock_management.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long supplierId;

    private String name;
    private String address;
    private String phone;
    private String email;
    private String weSite;
    private String tvaCode;
    private String rib;
    private String iban;
    private String contactPerson;
}
