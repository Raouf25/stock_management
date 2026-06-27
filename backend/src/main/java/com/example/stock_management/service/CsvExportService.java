package com.example.stock_management.service;

import com.example.stock_management.dto.CreatedBillDTO;
import com.example.stock_management.dto.PurchaseDTO;
import com.example.stock_management.dto.SaleDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CsvExportService {

    private static final String CRLF = "\r\n";

    public String exportBillsToCsv(List<CreatedBillDTO> bills) {
        StringBuilder sb = new StringBuilder();
        sb.append("billId,billDate,clientName,totalAmount,deposit,amountDue,paymentStatus").append(CRLF);
        for (CreatedBillDTO b : bills) {
            sb.append(safe(b.getBillId()))
              .append(',').append(safe(b.getBillDate()))
              .append(',').append(quoted(b.getClientName()))
              .append(',').append(safe(b.getTotalAmount()))
              .append(',').append(safe(b.getDeposit()))
              .append(',').append(safe(b.getAmountDue()))
              .append(',').append(safe(b.getPaymentStatus()))
              .append(CRLF);
        }
        return sb.toString();
    }

    public String exportPurchasesToCsv(List<PurchaseDTO> purchases) {
        StringBuilder sb = new StringBuilder();
        sb.append("id,datePurchase,supplierName,invoiceNumber,productName,quantity,unitPriceTTC,totalAmountTTC").append(CRLF);
        for (PurchaseDTO p : purchases) {
            String productName = "";
            String qty = safe(p.getQuantity());
            String unitPrice = safe(p.getUnitPriceTTC());
            String total = safe(p.getTotalAmountTTC());
            if (p.getLines() != null && !p.getLines().isEmpty()) {
                productName = p.getLines().get(0).getProductName();
            }
            sb.append(safe(p.getId()))
              .append(',').append(safe(p.getDatePurchase()))
              .append(',').append(quoted(p.getSupplierName()))
              .append(',').append(quoted(p.getInvoiceNumber()))
              .append(',').append(quoted(productName))
              .append(',').append(qty)
              .append(',').append(unitPrice)
              .append(',').append(total)
              .append(CRLF);
        }
        return sb.toString();
    }

    public String exportSalesToCsv(List<SaleDTO> sales) {
        StringBuilder sb = new StringBuilder();
        sb.append("id,dateSale,customerName,productName,quantitySold,unitSalePrice,totalSaleAmount,invoiceNumber").append(CRLF);
        for (SaleDTO s : sales) {
            sb.append(safe(s.getId()))
              .append(',').append(safe(s.getDateSale()))
              .append(',').append(quoted(s.getCustomerName()))
              .append(',').append(quoted(s.getProductName()))
              .append(',').append(safe(s.getQuantitySold()))
              .append(',').append(safe(s.getUnitSalePrice()))
              .append(',').append(safe(s.getTotalSaleAmount()))
              .append(',').append(quoted(s.getInvoiceNumber()))
              .append(CRLF);
        }
        return sb.toString();
    }

    private String safe(Object value) {
        return value == null ? "" : value.toString();
    }

    private String quoted(String value) {
        if (value == null) return "\"\"";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
