package com.example.stock_management.dto;

import lombok.Data;

import java.math.BigDecimal;
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
    private BigDecimal totalAmount;
    private BigDecimal deposit;
    private BigDecimal amountDue;
    private List<CreatedBillProduct> products;
    private PaymentStatus paymentStatus;
    private Boolean applyTva;
}
