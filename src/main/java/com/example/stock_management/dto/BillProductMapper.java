package com.example.stock_management.dto;


import com.example.stock_management.model.BillProduct;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BillProductMapper {
    BillProductDTO sourceToDestination(BillProduct source);
//    SimpleSource destinationToSource(SimpleDestination destination);
}
