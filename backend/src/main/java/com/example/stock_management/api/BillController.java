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

    @GetMapping("/kpis")
    @Operation(summary = "Obtenir les KPIs des factures")
    public Map<String, Object> getInvoiceKPIs() {
        return billService.getInvoiceKPIs();
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
                    // Prefer the recorded line unit price (total/qty) when available (shows actual sale price).
                    // Otherwise fall back to the product default selling price.
                    double unitPrice = 0.0;
                    if (totalPrice > 0.0 && qty > 0) {
                        unitPrice = totalPrice / qty;
                    } else if (bp.getProduct() != null && bp.getProduct().getUnitPriceSold() != null) {
                        unitPrice = bp.getProduct().getUnitPriceSold();
                    }
                    double vatRate = 0.19; // default 19%

                    // Derive discount from stored line total: expectedGross - storedTotal
                    double expectedGross = unitPrice * qty;
                    double discount = expectedGross - totalPrice;
                    if (discount < 0) discount = 0.0;

                    // totalPrice is considered the post-discount line HT (as stored in DB)
                    double priceAfterDiscount = totalPrice;
                    double vatAmount = priceAfterDiscount * vatRate;
                    double totalWithVat = priceAfterDiscount + vatAmount;
                    m.put("productRef", productRef);
                    m.put("productName", productName);
                    m.put("quantity", qty);
                    m.put("unitPriceValue", unitPrice);
                    // totalPrice is the stored line HT (post-discount) -> expose as numeric for summation
                    m.put("unitPriceFormatted", numberUtils.formatDecimal(unitPrice, 3, 3) + " DNT");
                    m.put("totalPriceFormatted", numberUtils.formatDecimal(totalPrice, 3, 3) + " DNT");
                    m.put("discountValue", discount);
                    m.put("discountFormatted", numberUtils.formatDecimal(discount, 3, 3) + " DNT");
                    m.put("vatRate", "19%");
                    m.put("vatAmountFormatted", numberUtils.formatDecimal(vatAmount, 3, 3) + " DNT");
                    m.put("totalWithVatFormatted", numberUtils.formatDecimal(totalWithVat, 3, 3) + " DNT");
                    // also expose raw numeric values for later summation
                    m.put("vatAmountValue", vatAmount);
                    m.put("totalPriceValue", priceAfterDiscount);
                    productsList.add(m);
                }
            }
            data.put("products", productsList);

                // Compute totals by summing product lines (safer when discounts applied in DB)
                // sum of stored line HT (post-discount)
                double sumTotalHT = productsList.stream()
                    .mapToDouble(p -> p.getOrDefault("totalPriceValue", 0.0) instanceof Number ? ((Number)p.getOrDefault("totalPriceValue", 0.0)).doubleValue() : 0.0)
                    .sum();
                // sum of VAT amounts (calculated on post-discount prices)
                double sumVat = productsList.stream()
                    .mapToDouble(p -> p.getOrDefault("vatAmountValue", 0.0) instanceof Number ? ((Number)p.getOrDefault("vatAmountValue", 0.0)).doubleValue() : 0.0)
                    .sum();

                // sum of expected gross (unitPrice * qty) before discounts -> used to show "Total Remise"
                double sumGrossHT = productsList.stream()
                    .mapToDouble(p -> {
                        Number up = (Number)p.getOrDefault("unitPriceValue", 0.0);
                        Number q = (Number)p.getOrDefault("quantity", 0);
                        return up.doubleValue() * q.doubleValue();
                    })
                    .sum();

                // total discount applied
                double sumDiscount = productsList.stream()
                    .mapToDouble(p -> p.getOrDefault("discountValue", 0.0) instanceof Number ? ((Number)p.getOrDefault("discountValue", 0.0)).doubleValue() : 0.0)
                    .sum();

                double totalHT = sumTotalHT; // net HT after discounts (sum of stored line HT)
                double tva = sumVat;
                double total = totalHT + tva;

                data.put("total", total);
                data.put("totalHT", totalHT);
                data.put("tva", tva);
                // expose gross and discounts for template
                data.put("totalGrossHT", sumGrossHT);
                data.put("totalDiscount", sumDiscount);
            double deposit = bill.getDeposit() != null ? bill.getDeposit() : 0.0;
            double amountDue = total - deposit; // Net à payer = Total TTC - Acompte
            data.put("deposit", deposit);
            data.put("amountDue", amountDue);

            // formatted totals
            data.put("totalHTFormatted", numberUtils.formatDecimal(totalHT, 3, 3) + " DNT");
            data.put("tvaFormatted", numberUtils.formatDecimal(tva, 3, 3) + " DNT");
            data.put("totalTTCFormatted", numberUtils.formatDecimal(total, 3, 3) + " DNT");
            data.put("totalGrossHTFormatted", numberUtils.formatDecimal((double)data.getOrDefault("totalGrossHT", 0.0), 3, 3) + " DNT");
            data.put("totalDiscountFormatted", numberUtils.formatDecimal((double)data.getOrDefault("totalDiscount", 0.0), 3, 3) + " DNT");
            data.put("depositFormatted", numberUtils.formatDecimal(deposit, 3, 3) + " DNT");
            data.put("amountDueFormatted", numberUtils.formatDecimal(amountDue, 3, 3) + " DNT");

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
        data.put("paymentTerms", "30 jours");

        pdfGenerateService.generatePdfFileAPI(data, response);
    }

}
