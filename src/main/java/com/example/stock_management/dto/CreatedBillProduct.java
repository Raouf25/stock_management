package com.example.stock_management.dto;


import lombok.Data;

@Data
public class CreatedBillProduct {

    private Long reference;
    private String productName;
    private String productDescription;
    private Double unitPrice;
    private Integer quantity;
    private Double totalProductPrice;
}
