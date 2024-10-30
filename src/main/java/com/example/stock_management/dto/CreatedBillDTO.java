package com.example.stock_management.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreatedBillDTO {
    private Long billId;
    private LocalDateTime billDate;
    private String clientName;
    private String clientAddress;
    private String clientPhone;
    private String clientFax;
    private String clientEmail;
    private Double totalAmount;
    private List<CreatedBillProduct> products;
    private PaymentStatus paymentStatus;
}
