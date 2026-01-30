package com.example.stock_management.api;

import com.example.stock_management.dto.BillDTO;
import com.example.stock_management.dto.BillMapper;
import com.example.stock_management.dto.CreatedBillDTO;
import com.example.stock_management.dto.InvoiceCreationDTO;
import com.example.stock_management.service.BillService;
import com.example.stock_management.service.EmailService;
import com.example.stock_management.service.PdfGenerateService;
import com.example.stock_management.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import com.example.stock_management.util.NumberUtils;

@RestController
@RequestMapping("/api/bills")
@Tag(name = "Bill", description = "Bills management")
@RequiredArgsConstructor
public class BillController {

    private final PdfGenerateService pdfGenerateService;
    private final EmailService emailService;

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

    @PostMapping("/create")
    @Operation(summary = "Créer une nouvelle facture avec tous les détails")
    public ResponseEntity<?> createInvoice(@Valid @RequestBody InvoiceCreationDTO invoiceDto) {
        try {
            var bill = billService.createInvoice(invoiceDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(billMapper.sourceToDestination(bill));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error creating invoice: " + e.getMessage()));
        }
    }

    @GetMapping("/kpis")
    @Operation(summary = "Obtenir les KPIs des factures")
    public Map<String, Object> getInvoiceKPIs() {
        return billService.getInvoiceKPIs();
    }

    @PostMapping("/{id}/send-email")
    @Operation(summary = "Envoyer la facture par email au client")
    public ResponseEntity<?> sendInvoiceByEmail(@PathVariable Long id) {
        try {
            // Récupérer la facture
            var billOpt = billService.findById(id);
            if (billOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            var bill = billOpt.get();
            
            // Vérifier que le client a un email
            if (bill.getCustomer() == null || bill.getCustomer().getEmail() == null || bill.getCustomer().getEmail().isBlank()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Le client n'a pas d'adresse email configurée"));
            }

            // Préparer les données pour le PDF (même logique que generatePdf)
            Map<String, Object> data = preparePdfData(id);

            // Générer le PDF en bytes
            byte[] pdfBytes = pdfGenerateService.generatePdfToBytes(data);

            // Préparer le contenu de l'email
            String billNumber = "FAC-" + String.format("%04d", bill.getIdBill());
            String customerName = bill.getCustomer().getName();
            String customerEmail = bill.getCustomer().getEmail();

            String subject = "Votre facture " + billNumber;
            String body = buildEmailBody(billNumber, customerName, data);

            // Envoyer l'email
            emailService.sendEmailWithPdfAttachment(
                customerEmail,
                subject,
                body,
                pdfBytes,
                billNumber + ".pdf"
            );

            return ResponseEntity.ok(Map.of(
                "message", "Facture envoyée avec succès à " + customerEmail,
                "billNumber", billNumber,
                "customerEmail", customerEmail
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur lors de l'envoi de l'email: " + e.getMessage()));
        }
    }

    private String buildEmailBody(String billNumber, String customerName, Map<String, Object> data) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background-color: #4361ee; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                    .amount { font-size: 18px; font-weight: bold; color: #4361ee; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📄 Facture %s</h1>
                </div>
                <div class="content">
                    <p>Bonjour <strong>%s</strong>,</p>
                    <p>Veuillez trouver ci-joint votre facture <strong>%s</strong>.</p>
                    <p class="amount">Montant Total TTC: %s TND</p>
                    <p>Merci pour votre confiance.</p>
                    <p>Cordialement,<br>L'équipe de facturation</p>
                </div>
                <div class="footer">
                    <p>Ce message a été généré automatiquement. Merci de ne pas y répondre.</p>
                </div>
            </body>
            </html>
            """.formatted(
                billNumber,
                customerName,
                billNumber,
                data.getOrDefault("totalTTCFormatted", "N/A")
            );
    }

    private Map<String, Object> preparePdfData(Long id) {
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
                    double unitPrice = 0.0;
                    if (totalPrice > 0.0 && qty > 0) {
                        unitPrice = totalPrice / qty;
                    } else if (bp.getProduct() != null && bp.getProduct().getUnitPriceSold() != null) {
                        unitPrice = bp.getProduct().getUnitPriceSold();
                    }
                    double vatRate = 0.19;
                    double expectedGross = unitPrice * qty;
                    double discount = expectedGross - totalPrice;
                    if (discount < 0) discount = 0.0;
                    double discountPercentage = bp.getDiscountPercentage() != null ? bp.getDiscountPercentage() : 0.0;
                    if (discountPercentage == 0.0 && expectedGross > 0) {
                        discountPercentage = (discount / expectedGross) * 100;
                    }
                    double priceAfterDiscount = totalPrice;
                    double vatAmount = priceAfterDiscount * vatRate;
                    double totalWithVat = priceAfterDiscount + vatAmount;
                    
                    m.put("productRef", productRef);
                    m.put("productName", productName);
                    m.put("quantity", qty);
                    m.put("unitPriceValue", unitPrice);
                    m.put("unitPriceFormatted", numberUtils.formatDecimal(unitPrice, 3, 3));
                    m.put("totalPriceFormatted", numberUtils.formatDecimal(totalPrice, 3, 3));
                    m.put("discountValue", discount);
                    m.put("discountFormatted", numberUtils.formatDecimal(discount, 3, 3));
                    m.put("discountPercentage", numberUtils.formatDecimal(discountPercentage, 1, 1));
                    m.put("vatRate", "19%");
                    m.put("vatAmountFormatted", numberUtils.formatDecimal(vatAmount, 3, 3));
                    m.put("totalWithVatFormatted", numberUtils.formatDecimal(totalWithVat, 3, 3));
                    m.put("vatAmountValue", vatAmount);
                    m.put("totalPriceValue", priceAfterDiscount);
                    productsList.add(m);
                }
            }
            data.put("products", productsList);

            double sumTotalHT = productsList.stream()
                .mapToDouble(p -> p.getOrDefault("totalPriceValue", 0.0) instanceof Number ? ((Number)p.getOrDefault("totalPriceValue", 0.0)).doubleValue() : 0.0)
                .sum();
            double sumVat = productsList.stream()
                .mapToDouble(p -> p.getOrDefault("vatAmountValue", 0.0) instanceof Number ? ((Number)p.getOrDefault("vatAmountValue", 0.0)).doubleValue() : 0.0)
                .sum();
            double sumGrossHT = productsList.stream()
                .mapToDouble(p -> {
                    Number up = (Number)p.getOrDefault("unitPriceValue", 0.0);
                    Number q = (Number)p.getOrDefault("quantity", 0);
                    return up.doubleValue() * q.doubleValue();
                })
                .sum();
            double sumDiscount = productsList.stream()
                .mapToDouble(p -> p.getOrDefault("discountValue", 0.0) instanceof Number ? ((Number)p.getOrDefault("discountValue", 0.0)).doubleValue() : 0.0)
                .sum();

            double totalHT = sumTotalHT;
            double tva = sumVat;
            double total = totalHT + tva;

            data.put("total", total);
            data.put("totalHT", totalHT);
            data.put("tva", tva);
            data.put("totalGrossHT", sumGrossHT);
            data.put("totalDiscount", sumDiscount);
            
            double deposit = bill.getDeposit() != null ? bill.getDeposit() : 0.0;
            double amountDue = total - deposit;
            data.put("deposit", deposit);
            data.put("amountDue", amountDue);

            data.put("totalHTFormatted", numberUtils.formatDecimal(totalHT, 3, 3));
            data.put("tvaFormatted", numberUtils.formatDecimal(tva, 3, 3));
            data.put("totalTTCFormatted", numberUtils.formatDecimal(total, 3, 3));
            data.put("totalGrossHTFormatted", numberUtils.formatDecimal(sumGrossHT, 3, 3));
            data.put("totalDiscountFormatted", numberUtils.formatDecimal(sumDiscount, 3, 3));
            data.put("depositFormatted", numberUtils.formatDecimal(deposit, 3, 3));
            data.put("amountDueFormatted", numberUtils.formatDecimal(amountDue, 3, 3));

            data.put("billNumber", "FAC-" + String.format("%04d", bill.getIdBill()));
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
            data.put("billDate", bill.getDateBill().format(formatter));
        });

        // Ajouter les données de l'entreprise
        Map<String, String> company = new HashMap<>();
        company.put("name", "Nom de l'entreprise");
        company.put("address", "Adresse de l'entreprise");
        company.put("phone", "(+216) XX XXX XXX");
        company.put("taxId", "123456789");
        data.put("company", company);

        data.put("companyName", company.get("name"));
        data.put("companyAddress", company.get("address"));
        data.put("companyPhone", company.get("phone"));
        data.put("companyTaxId", company.get("taxId"));
        data.put("supplierRc", company.getOrDefault("rc", ""));
        data.put("supplierRib", company.getOrDefault("rib", ""));
        data.put("supplierIban", company.getOrDefault("iban", ""));

        // Ajouter les données du client
        billService.findById(id).ifPresent(bill -> populateCustomerData(bill, data));

        data.put("deliveryAddress", "");
        data.put("customerRef", "");
        data.put("paymentMethod", "Espèces / Virement / Chèque");
        data.put("paymentRef", "");
        data.put("paymentTerms", "30 jours");

        return data;
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
                    
                    // Use stored discount percentage if available, otherwise calculate it
                    double discountPercentage = bp.getDiscountPercentage() != null ? bp.getDiscountPercentage() : 0.0;
                    if (discountPercentage == 0.0 && expectedGross > 0) {
                        discountPercentage = (discount / expectedGross) * 100;
                    }

                    // totalPrice is considered the post-discount line HT (as stored in DB)
                    double priceAfterDiscount = totalPrice;
                    double vatAmount = priceAfterDiscount * vatRate;
                    double totalWithVat = priceAfterDiscount + vatAmount;
                    m.put("productRef", productRef);
                    m.put("productName", productName);
                    m.put("quantity", qty);
                    m.put("unitPriceValue", unitPrice);
                    // totalPrice is the stored line HT (post-discount) -> expose as numeric for summation
                    m.put("unitPriceFormatted", numberUtils.formatDecimal(unitPrice, 3, 3));
                    m.put("totalPriceFormatted", numberUtils.formatDecimal(totalPrice, 3, 3));
                    m.put("discountValue", discount);
                    m.put("discountFormatted", numberUtils.formatDecimal(discount, 3, 3));
                    m.put("discountPercentage", numberUtils.formatDecimal(discountPercentage, 1, 1));
                    m.put("vatRate", "19%");
                    m.put("vatAmountFormatted", numberUtils.formatDecimal(vatAmount, 3, 3));
                    m.put("totalWithVatFormatted", numberUtils.formatDecimal(totalWithVat, 3, 3));
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
            data.put("totalHTFormatted", numberUtils.formatDecimal(totalHT, 3, 3));
            data.put("tvaFormatted", numberUtils.formatDecimal(tva, 3, 3));
            data.put("totalTTCFormatted", numberUtils.formatDecimal(total, 3, 3) );
            data.put("totalGrossHTFormatted", numberUtils.formatDecimal((double)data.getOrDefault("totalGrossHT", 0.0), 3, 3) );
            data.put("totalDiscountFormatted", numberUtils.formatDecimal((double)data.getOrDefault("totalDiscount", 0.0), 3, 3));
            data.put("depositFormatted", numberUtils.formatDecimal(deposit, 3, 3));
            data.put("amountDueFormatted", numberUtils.formatDecimal(amountDue, 3, 3));

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

        // Ajouter les données du client
        billService.findById(id).ifPresent(bill -> populateCustomerData(bill, data));

        // default placeholders for delivery and payment
        data.put("deliveryAddress", "");
        data.put("customerRef", "");
        data.put("paymentMethod", "Espèces / Virement / Chèque");
        data.put("paymentRef", "");
        data.put("paymentTerms", "30 jours");

        pdfGenerateService.generatePdfFileAPI(data, response);
    }

    /**
     * Remplit les données du client dans le Map pour le template PDF
     */
    private void populateCustomerData(com.example.stock_management.model.Bill bill, Map<String, Object> data) {
        if (bill.getCustomer() == null) return;
        
        var customer = bill.getCustomer();
        
        // Données client de base
        Map<String, String> client = new HashMap<>();
        client.put("name", customer.getName());
        client.put("address", customer.getAddress());
        client.put("taxId", defaultIfNull(customer.getTvaCode(), "N/A"));
        data.put("client", client);

        data.put("customerName", customer.getName());
        data.put("customerAddress", customer.getAddress());
        data.put("customerPhone", defaultIfNull(customer.getPhone(), ""));
        data.put("customerTva", defaultIfNull(customer.getTvaCode(), "N/A"));
        
        // Données pour la section "Livré à"
        data.put("deliveryFullName", defaultIfNull(customer.getFullName(), ""));
        data.put("deliveryCin", defaultIfNull(customer.getCin(), ""));
        
        // Extraire les composants de la plaque d'immatriculation (format: "Y تونس X")
        parseLicensePlate(customer.getLicensePlate(), data);
    }
    
    /**
     * Parse la plaque d'immatriculation tunisienne et extrait Y et X
     */
    private void parseLicensePlate(String licensePlate, Map<String, Object> data) {
        if (licensePlate != null && !licensePlate.isEmpty()) {
            String[] parts = licensePlate.split("\\s+");
            if (parts.length >= 3) {
                data.put("licensePlateY", parts[0]);
                data.put("licensePlateX", parts[2]);
                return;
            }
        }
        data.put("licensePlateY", "");
        data.put("licensePlateX", "");
    }
    
    /**
     * Retourne la valeur ou une valeur par défaut si null
     */
    private String defaultIfNull(String value, String defaultValue) {
        return value != null ? value : defaultValue;
    }
}
