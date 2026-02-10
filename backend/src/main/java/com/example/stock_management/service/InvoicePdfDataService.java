package com.example.stock_management.service;

import com.example.stock_management.model.Bill;
import com.example.stock_management.model.BillProduct;
import com.example.stock_management.util.NumberUtils;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service dédié à la préparation des données pour la génération de PDF de facture.
 * Hérite de AbstractPdfDataService pour les méthodes utilitaires communes.
 */
@Service
public class InvoicePdfDataService extends AbstractPdfDataService {

    private final BillService billService;
    private final SupplierService supplierService;
    
    private static final double VAT_RATE = 0.19;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public InvoicePdfDataService(BillService billService, SupplierService supplierService, NumberUtils numberUtils) {
        super(numberUtils);
        this.billService = billService;
        this.supplierService = supplierService;
    }

    /**
     * Prépare toutes les données nécessaires pour générer le PDF d'une facture
     */
    public Map<String, Object> preparePdfData(Long billId) {
        Map<String, Object> data = new HashMap<>();
        
        supplierService.findById(3L).ifPresent(supplier -> data.put("supplier", supplier));
        billService.findById(billId).ifPresent(bill -> populateBillData(bill, data));
        populateCompanyData(data);  // Méthode héritée
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

        // Déterminer si la TVA doit être appliquée (par défaut non)
        boolean applyTva = bill.getApplyTva() != null ? bill.getApplyTva() : false;
        data.put("applyTva", applyTva);

        List<Map<String, Object>> productsList = buildProductsList(bill, applyTva);
        data.put("products", productsList);

        BillTotals totals = calculateTotals(productsList, bill, applyTva);
        populateTotals(data, totals, applyTva);

        data.put("billNumber", "FAC-" + String.format("%04d", bill.getIdBill()));
        data.put("billDate", bill.getDateBill().format(DATE_FORMATTER));

        // Utilise la méthode héritée pour le client
        populateCustomerData(bill.getCustomer(), data);

        // Ajouts spécifiques facture
        if (bill.getCustomer() != null) {
            Map<String, String> client = new HashMap<>();
            client.put("name", bill.getCustomer().getName());
            client.put("address", bill.getCustomer().getAddress());
            client.put("taxId", defaultIfNull(bill.getCustomer().getTvaCode(), "N/A"));
            data.put("client", client);
        }
    }

    private void populateTotals(Map<String, Object> data, BillTotals totals, boolean applyTva) {
        data.put("total", totals.totalTTC);
        data.put("totalHT", totals.totalHT);
        data.put("tva", totals.tva);
        data.put("totalGrossHT", totals.totalGrossHT);
        data.put("totalDiscount", totals.totalDiscount);
        data.put("deposit", totals.deposit);
        data.put("amountDue", totals.amountDue);
        data.put("showTva", applyTva);

        data.put("totalHTFormatted", formatDecimal(totals.totalHT, 3, 3));
        data.put("tvaFormatted", applyTva ? formatDecimal(totals.tva, 3, 3) : "0,000");
        data.put("totalTTCFormatted", formatDecimal(totals.totalTTC, 3, 3));
        data.put("totalGrossHTFormatted", formatDecimal(totals.totalGrossHT, 3, 3));
        data.put("totalDiscountFormatted", formatDecimal(totals.totalDiscount, 3, 3));
        data.put("depositFormatted", formatDecimal(totals.deposit, 3, 3));
        data.put("amountDueFormatted", formatDecimal(totals.amountDue, 3, 3));
    }

    /**
     * Construit la liste des produits avec tous les calculs nécessaires
     */
    private List<Map<String, Object>> buildProductsList(Bill bill, boolean applyTva) {
        List<Map<String, Object>> productsList = new ArrayList<>();
        
        if (bill.getBillProducts() == null) return productsList;

        for (BillProduct bp : bill.getBillProducts()) {
            productsList.add(buildProductData(bp, applyTva));
        }
        
        return productsList;
    }

    private Map<String, Object> buildProductData(BillProduct bp, boolean applyTva) {
        Map<String, Object> productData = new HashMap<>();
        
        String productName = bp.getProduct() != null ? bp.getProduct().getName() : "";
        String productRef = bp.getProduct() != null ? String.valueOf(bp.getProduct().getReference()) : "";
        int qty = bp.getQuantity() != null ? bp.getQuantity() : 0;
        double totalPrice = bp.getTotalProductPrice() != null ? bp.getTotalProductPrice() : 0.0;
        
        double unitPrice = calculateUnitPrice(bp, totalPrice, qty);
        ProductDiscount discount = calculateDiscount(bp, unitPrice, qty, totalPrice);
        
        double priceAfterDiscount = totalPrice;
        double vatAmount = applyTva ? priceAfterDiscount * VAT_RATE : 0.0;
        double totalWithVat = priceAfterDiscount + vatAmount;
        
        productData.put("productRef", productRef);
        productData.put("productName", productName);
        productData.put("quantity", qty);
        productData.put("unitPriceValue", unitPrice);
        productData.put("unitPriceFormatted", formatDecimal(unitPrice, 3, 3));
        productData.put("totalPriceFormatted", formatDecimal(totalPrice, 3, 3));
        productData.put("discountValue", discount.amount);
        productData.put("discountFormatted", formatDecimal(discount.amount, 3, 3));
        productData.put("discountPercentage", formatDecimal(discount.percentage, 1, 1));
        productData.put("vatRate", applyTva ? "19%" : "0%");
        productData.put("vatAmountFormatted", formatDecimal(vatAmount, 3, 3));
        productData.put("totalWithVatFormatted", formatDecimal(totalWithVat, 3, 3));
        productData.put("vatAmountValue", vatAmount);
        productData.put("totalPriceValue", priceAfterDiscount);
        
        return productData;
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
        double discountAmount = Math.max(expectedGross - totalPrice, 0.0);
        
        double discountPercentage = bp.getDiscountPercentage() != null ? bp.getDiscountPercentage() : 0.0;
        if (discountPercentage == 0.0 && expectedGross > 0) {
            discountPercentage = (discountAmount / expectedGross) * 100;
        }
        
        return new ProductDiscount(discountAmount, discountPercentage);
    }

    /**
     * Calcule tous les totaux de la facture
     */
    private BillTotals calculateTotals(List<Map<String, Object>> productsList, Bill bill, boolean applyTva) {
        double sumTotalHT = productsList.stream()
            .mapToDouble(p -> getDoubleValue(p.get("totalPriceValue")))
            .sum();
        
        double sumVat = applyTva ? productsList.stream()
            .mapToDouble(p -> getDoubleValue(p.get("vatAmountValue")))
            .sum() : 0.0;
        
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
        
        double totalTTC = sumTotalHT + sumVat;
        double deposit = bill.getDeposit() != null ? bill.getDeposit().doubleValue() : 0.0;
        double amountDue = totalTTC - deposit;
        
        return new BillTotals(sumTotalHT, sumVat, totalTTC, sumGrossHT, sumDiscount, deposit, amountDue);
    }

    private void addDefaultPlaceholders(Map<String, Object> data) {
        data.put("deliveryAddress", "");
        data.put("customerRef", "");
        data.put("paymentMethod", "Espèces / Virement / Chèque");
        data.put("paymentRef", "");
        data.put("paymentTerms", "30 jours");
    }

    // Records internes pour structurer les données
    private record ProductDiscount(double amount, double percentage) {}
    
    private record BillTotals(
        double totalHT, double tva, double totalTTC,
        double totalGrossHT, double totalDiscount, double deposit, double amountDue
    ) {}
}
