package com.example.stock_management.service;

import com.example.stock_management.model.Bill;
import com.example.stock_management.model.BillProduct;
import com.example.stock_management.model.Customer;
import com.example.stock_management.util.NumberUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service dédié à la préparation des données pour la génération de PDF de facture.
 * Sépare la logique métier de préparation des données du contrôleur.
 */
@Service
@RequiredArgsConstructor
public class InvoicePdfDataService {

    private final BillService billService;
    private final SupplierService supplierService;
    private final NumberUtils numberUtils;
    
    private static final double VAT_RATE = 0.19;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Prépare toutes les données nécessaires pour générer le PDF d'une facture
     */
    public Map<String, Object> preparePdfData(Long billId) {
        Map<String, Object> data = new HashMap<>();
        
        // Ajouter le fournisseur (supplier)
        supplierService.findById(3L).ifPresent(supplier -> data.put("supplier", supplier));
        
        // Ajouter les données de la facture
        billService.findById(billId).ifPresent(bill -> {
            populateBillData(bill, data);
        });

        // Ajouter les données de l'entreprise
        populateCompanyData(data);

        // Ajouter les placeholders par défaut
        addDefaultPlaceholders(data);

        return data;
    }

    /**
     * Construit le corps HTML de l'email pour l'envoi de facture
     */
    public String buildEmailBody(String billNumber, String customerName, Map<String, Object> data) {
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

    /**
     * Remplit les données de la facture dans le Map pour le template PDF
     */
    private void populateBillData(Bill bill, Map<String, Object> data) {
        data.put("customer", bill.getCustomer());

        // Transform products to a list of maps with preformatted values
        List<Map<String, Object>> productsList = buildProductsList(bill);
        data.put("products", productsList);

        // Calculate totals
        BillTotals totals = calculateTotals(productsList, bill);
        
        // Add totals to data
        data.put("total", totals.totalTTC);
        data.put("totalHT", totals.totalHT);
        data.put("tva", totals.tva);
        data.put("totalGrossHT", totals.totalGrossHT);
        data.put("totalDiscount", totals.totalDiscount);
        data.put("deposit", totals.deposit);
        data.put("amountDue", totals.amountDue);

        // Add formatted totals
        data.put("totalHTFormatted", numberUtils.formatDecimal(totals.totalHT, 3, 3));
        data.put("tvaFormatted", numberUtils.formatDecimal(totals.tva, 3, 3));
        data.put("totalTTCFormatted", numberUtils.formatDecimal(totals.totalTTC, 3, 3));
        data.put("totalGrossHTFormatted", numberUtils.formatDecimal(totals.totalGrossHT, 3, 3));
        data.put("totalDiscountFormatted", numberUtils.formatDecimal(totals.totalDiscount, 3, 3));
        data.put("depositFormatted", numberUtils.formatDecimal(totals.deposit, 3, 3));
        data.put("amountDueFormatted", numberUtils.formatDecimal(totals.amountDue, 3, 3));

        // Format bill number and date
        data.put("billNumber", "FAC-" + String.format("%04d", bill.getIdBill()));
        data.put("billDate", bill.getDateBill().format(DATE_FORMATTER));

        // Populate customer data
        populateCustomerData(bill, data);
    }

    /**
     * Construit la liste des produits avec tous les calculs nécessaires
     */
    private List<Map<String, Object>> buildProductsList(Bill bill) {
        List<Map<String, Object>> productsList = new ArrayList<>();
        
        if (bill.getBillProducts() == null) {
            return productsList;
        }

        for (BillProduct bp : bill.getBillProducts()) {
            Map<String, Object> productData = new HashMap<>();
            
            String productName = bp.getProduct() != null ? bp.getProduct().getName() : "";
            String productRef = bp.getProduct() != null ? String.valueOf(bp.getProduct().getReference()) : "";
            int qty = bp.getQuantity() != null ? bp.getQuantity() : 0;
            double totalPrice = bp.getTotalProductPrice() != null ? bp.getTotalProductPrice() : 0.0;
            
            // Calculate unit price
            double unitPrice = calculateUnitPrice(bp, totalPrice, qty);
            
            // Calculate discount
            ProductDiscount discount = calculateDiscount(bp, unitPrice, qty, totalPrice);
            
            // Calculate VAT and total with VAT
            double priceAfterDiscount = totalPrice;
            double vatAmount = priceAfterDiscount * VAT_RATE;
            double totalWithVat = priceAfterDiscount + vatAmount;
            
            // Populate product data
            productData.put("productRef", productRef);
            productData.put("productName", productName);
            productData.put("quantity", qty);
            productData.put("unitPriceValue", unitPrice);
            productData.put("unitPriceFormatted", numberUtils.formatDecimal(unitPrice, 3, 3));
            productData.put("totalPriceFormatted", numberUtils.formatDecimal(totalPrice, 3, 3));
            productData.put("discountValue", discount.amount);
            productData.put("discountFormatted", numberUtils.formatDecimal(discount.amount, 3, 3));
            productData.put("discountPercentage", numberUtils.formatDecimal(discount.percentage, 1, 1));
            productData.put("vatRate", "19%");
            productData.put("vatAmountFormatted", numberUtils.formatDecimal(vatAmount, 3, 3));
            productData.put("totalWithVatFormatted", numberUtils.formatDecimal(totalWithVat, 3, 3));
            productData.put("vatAmountValue", vatAmount);
            productData.put("totalPriceValue", priceAfterDiscount);
            
            productsList.add(productData);
        }
        
        return productsList;
    }

    /**
     * Calcule le prix unitaire d'un produit
     */
    private double calculateUnitPrice(BillProduct bp, double totalPrice, int qty) {
        if (totalPrice > 0.0 && qty > 0) {
            return totalPrice / qty;
        } else if (bp.getProduct() != null && bp.getProduct().getUnitPriceSold() != null) {
            return bp.getProduct().getUnitPriceSold();
        }
        return 0.0;
    }

    /**
     * Calcule la remise d'un produit
     */
    private ProductDiscount calculateDiscount(BillProduct bp, double unitPrice, int qty, double totalPrice) {
        double expectedGross = unitPrice * qty;
        double discountAmount = expectedGross - totalPrice;
        if (discountAmount < 0) discountAmount = 0.0;
        
        double discountPercentage = bp.getDiscountPercentage() != null ? bp.getDiscountPercentage() : 0.0;
        if (discountPercentage == 0.0 && expectedGross > 0) {
            discountPercentage = (discountAmount / expectedGross) * 100;
        }
        
        return new ProductDiscount(discountAmount, discountPercentage);
    }

    /**
     * Calcule tous les totaux de la facture
     */
    private BillTotals calculateTotals(List<Map<String, Object>> productsList, Bill bill) {
        double sumTotalHT = productsList.stream()
            .mapToDouble(p -> getDoubleValue(p.get("totalPriceValue")))
            .sum();
        
        double sumVat = productsList.stream()
            .mapToDouble(p -> getDoubleValue(p.get("vatAmountValue")))
            .sum();
        
        double sumGrossHT = productsList.stream()
            .mapToDouble(p -> {
                double unitPrice = getDoubleValue(p.get("unitPriceValue"));
                int quantity = ((Number) p.get("quantity")).intValue();
                return unitPrice * quantity;
            })
            .sum();
        
        double sumDiscount = productsList.stream()
            .mapToDouble(p -> getDoubleValue(p.get("discountValue")))
            .sum();
        
        double totalHT = sumTotalHT;
        double tva = sumVat;
        double totalTTC = totalHT + tva;
        double deposit = bill.getDeposit() != null ? bill.getDeposit().doubleValue() : 0.0;
        double amountDue = totalTTC - deposit;
        
        return new BillTotals(totalHT, tva, totalTTC, sumGrossHT, sumDiscount, deposit, amountDue);
    }

    /**
     * Remplit les données du client dans le Map
     */
    private void populateCustomerData(Bill bill, Map<String, Object> data) {
        if (bill.getCustomer() == null) return;
        
        Customer customer = bill.getCustomer();
        
        Map<String, String> client = new HashMap<>();
        client.put("name", customer.getName());
        client.put("address", customer.getAddress());
        client.put("taxId", defaultIfNull(customer.getTvaCode(), "N/A"));
        data.put("client", client);

        data.put("customerName", customer.getName());
        data.put("customerAddress", customer.getAddress());
        data.put("customerPhone", defaultIfNull(customer.getPhone(), ""));
        data.put("customerTva", defaultIfNull(customer.getTvaCode(), "N/A"));
        data.put("deliveryFullName", defaultIfNull(customer.getFullName(), ""));
        data.put("deliveryCin", defaultIfNull(customer.getCin(), ""));
        
        parseLicensePlate(customer.getLicensePlate(), data);
    }

    /**
     * Ajoute les données de l'entreprise
     */
    private void populateCompanyData(Map<String, Object> data) {
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
    }

    /**
     * Ajoute les placeholders par défaut
     */
    private void addDefaultPlaceholders(Map<String, Object> data) {
        data.put("deliveryAddress", "");
        data.put("customerRef", "");
        data.put("paymentMethod", "Espèces / Virement / Chèque");
        data.put("paymentRef", "");
        data.put("paymentTerms", "30 jours");
    }

    /**
     * Parse la plaque d'immatriculation tunisienne (format: "Y تونس X")
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

    /**
     * Extrait une valeur double d'un objet
     */
    private double getDoubleValue(Object value) {
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return 0.0;
    }

    // Classes internes pour structurer les données
    private record ProductDiscount(double amount, double percentage) {}
    
    private record BillTotals(
        double totalHT,
        double tva,
        double totalTTC,
        double totalGrossHT,
        double totalDiscount,
        double deposit,
        double amountDue
    ) {}
}
