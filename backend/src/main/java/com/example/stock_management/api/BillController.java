package com.example.stock_management.api;

import com.example.stock_management.dto.BillDTO;
import com.example.stock_management.dto.BillMapper;
import com.example.stock_management.dto.CreatedBillDTO;
import com.example.stock_management.service.BillService;
import com.example.stock_management.service.PdfGenerateService;
import com.example.stock_management.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import com.example.stock_management.util.NumberUtils;

@RestController
@RequestMapping("/api/bills")
@Tag(name = "Bill", description = "Bills management")
@RequiredArgsConstructor
public class BillController {

    private final PdfGenerateService pdfGenerateService;

    private final SupplierService supplierService;
    private final BillService billService;

    private final NumberUtils numberUtils;
    private final BillMapper billMapper;

    @GetMapping
    @Operation(summary = "Obtenir la liste de toutes les bills")
    public List<CreatedBillDTO> getAllBills() {
        return billService.findAll().stream()
                .map(billMapper::sourceToDestination)
                .toList();
    }


    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une Bill par ID")
    public Optional<CreatedBillDTO> getBillById(@PathVariable Long id) {
        return billService.findById(id)
                .map(billMapper::sourceToDestination);
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle Bill")
    public Optional<CreatedBillDTO> createBill(@RequestBody BillDTO billDTO) {
        return Optional.of(billService.save(billDTO)).map(billMapper::sourceToDestination);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une Bill par ID")
    public void deleteBill(@PathVariable Long id) {
        billService.deleteById(id);
    }


//    curl -X 'GET'  'http://localhost:8080/api/bills/generate/5'
    @GetMapping("/generate/{id}")
    public void generatePdf(@PathVariable Long id, HttpServletResponse response) {

        // Ajoutez les données nécessaires à la carte 'data'
        Map<String, Object> data = new HashMap<>();
        
        // Ajouter le fournisseur (supplier)
        supplierService.findById(3L).ifPresent(supplier -> data.put("supplier", supplier));
        
        // Ajouter les données de la facture
        billService.findById(id).ifPresent(bill -> {
            data.put("customer", bill.getCustomer());

            // transform products to a list of maps with preformatted values
            java.util.List<java.util.Map<String, Object>> productsList = new java.util.ArrayList<>();
            if (bill.getBillProducts() != null) {
                for (var bp : bill.getBillProducts()) {
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    String productName = bp.getProduct() != null ? bp.getProduct().getName() : "";
                    String productRef = bp.getProduct() != null ? String.valueOf(bp.getProduct().getReference()) : "";
                    int qty = bp.getQuantity() != null ? bp.getQuantity() : 0;
                    double totalPrice = bp.getTotalProductPrice() != null ? bp.getTotalProductPrice() : 0.0;
                    double unitPrice = qty > 0 ? totalPrice / qty : 0.0;
                    double vatRate = 0.19; // default 19%
                    double vatAmount = totalPrice * vatRate;
                    double totalWithVat = totalPrice + vatAmount;
                    m.put("productRef", productRef);
                    m.put("productName", productName);
                    m.put("quantity", qty);
                    m.put("unitPriceValue", unitPrice);
                    m.put("totalPriceValue", totalPrice);
                    m.put("unitPriceFormatted", numberUtils.formatDecimal(unitPrice, 3, 3) + " DNT");
                    m.put("totalPriceFormatted", numberUtils.formatDecimal(totalPrice, 3, 3) + " DNT");
                    m.put("discountFormatted", "0.000 DNT");
                    m.put("vatRate", "19%");
                    m.put("vatAmountFormatted", numberUtils.formatDecimal(vatAmount, 3, 3) + " DNT");
                    m.put("totalWithVatFormatted", numberUtils.formatDecimal(totalWithVat, 3, 3) + " DNT");
                    productsList.add(m);
                }
            }
            data.put("products", productsList);

            // Calculs des totaux (TVA incluse à 19%)
            double total = bill.getTotal();
            double totalHT = total / 1.19;
            double tva = total - totalHT;

            data.put("total", total);
            data.put("totalHT", totalHT);
            data.put("tva", tva);
            data.put("deposit", bill.getDeposit() != null ? bill.getDeposit() : 0.0);
            data.put("amountDue", bill.getAmountDue());

            // formatted totals
            data.put("totalHTFormatted", numberUtils.formatDecimal(totalHT, 3, 3) + " DNT");
            data.put("tvaFormatted", numberUtils.formatDecimal(tva, 3, 3) + " DNT");
            data.put("totalTTCFormatted", numberUtils.formatDecimal(total, 3, 3) + " DNT");
            data.put("depositFormatted", numberUtils.formatDecimal(bill.getDeposit() != null ? bill.getDeposit() : 0.0, 3, 3) + " DNT");
            data.put("amountDueFormatted", numberUtils.formatDecimal(bill.getAmountDue(), 3, 3) + " DNT");

            // Formater le numéro de facture
            data.put("billNumber", "FAC-" + String.format("%04d", bill.getIdBill()));

            // Formater la date
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
            data.put("billDate", bill.getDateBill().format(formatter));
        });

        // Ajouter les données de l'entreprise (company)
        Map<String, String> company = new HashMap<>();
        company.put("name", "Nom de l'entreprise");
        company.put("address", "Adresse de l'entreprise");
        company.put("phone", "(+216) XX XXX XXX");
        company.put("taxId", "123456789");
        data.put("company", company);

        // flattened company fields for template placeholders
        data.put("companyName", company.get("name"));
        data.put("companyAddress", company.get("address"));
        data.put("companyPhone", company.get("phone"));
        data.put("companyTaxId", company.get("taxId"));
        data.put("supplierRc", company.getOrDefault("rc", ""));
        data.put("supplierRib", company.getOrDefault("rib", ""));
        data.put("supplierIban", company.getOrDefault("iban", ""));

        // Ajouter les données du client (client) and flattened fields
        billService.findById(id).ifPresent(bill -> {
            if (bill.getCustomer() != null) {
                Map<String, String> client = new HashMap<>();
                client.put("name", bill.getCustomer().getName());
                client.put("address", bill.getCustomer().getAddress());
                client.put("taxId", bill.getCustomer().getTvaCode() != null ? bill.getCustomer().getTvaCode() : "N/A");
                data.put("client", client);

                data.put("customerName", bill.getCustomer().getName());
                data.put("customerAddress", bill.getCustomer().getAddress());
                data.put("customerPhone", bill.getCustomer().getPhone() != null ? bill.getCustomer().getPhone() : "");
                data.put("customerTva", bill.getCustomer().getTvaCode() != null ? bill.getCustomer().getTvaCode() : "N/A");
            }
        });

        // default placeholders for delivery and payment
        data.put("deliveryAddress", "");
        data.put("customerRef", "");
        data.put("paymentMethod", "Espèces / Virement / Chèque");
        data.put("paymentRef", "");

        pdfGenerateService.generatePdfFileAPI(data, response);
    }

}
