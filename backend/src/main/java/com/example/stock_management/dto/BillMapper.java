package com.example.stock_management.dto;


import com.example.stock_management.model.Bill;
import com.example.stock_management.model.BillProduct;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface BillMapper {
    @Mappings({
            @Mapping(source = "customer.name", target = "clientName"),
            @Mapping(source = "customer.address", target = "clientAddress"),
            @Mapping(source = "customer.phone", target = "clientPhone"),
            @Mapping(source = "customer.fax", target = "clientFax"),
            @Mapping(source = "customer.email", target = "clientEmail"),
            @Mapping(source = "dateBill", target = "billDate"),
            @Mapping(source = "idBill", target = "billId"),
            @Mapping(source = "total", target = "totalAmount"),
            @Mapping(source = "billProducts", target = "products"),
            @Mapping(source = "paymentStatus", target = "paymentStatus"),
            @Mapping(source = "deposit", target = "deposit"),
            @Mapping(source = "amountDue", target = "amountDue")
    })
    CreatedBillDTO sourceToDestination(Bill source);

    @Mappings({
            @Mapping(source = "product.reference", target = "reference"),
            @Mapping(source = "product.name", target = "productName"),
            @Mapping(source = "product.description", target = "productDescription"),
            @Mapping(source = "product.unitPrice", target = "unitPrice"),
            @Mapping(source = "quantity", target = "quantity"),
            @Mapping(source = "totalProductPrice", target = "totalProductPrice")
    })
    CreatedBillProduct map(BillProduct billProduct);
}
