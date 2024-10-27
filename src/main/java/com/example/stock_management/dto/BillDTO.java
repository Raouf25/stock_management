package com.example.stock_management.dto;

import lombok.Data;

import java.util.List;

@Data
public class BillDTO {

    private Long idClient;
    private List<BillProductDTO> products;

}
