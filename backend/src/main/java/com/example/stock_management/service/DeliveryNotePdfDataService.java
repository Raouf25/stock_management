package com.example.stock_management.service;

import com.example.stock_management.model.DeliveryNote;
import com.example.stock_management.model.DeliveryNoteProduct;
import com.example.stock_management.util.NumberUtils;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service dédié à la préparation des données pour la génération de PDF de bon de livraison.
 * Hérite de AbstractPdfDataService pour les méthodes utilitaires communes.
 */
@Service
public class DeliveryNotePdfDataService extends AbstractPdfDataService {

    private final DeliveryNoteService deliveryNoteService;

    private static final double VAT_RATE = 0.19;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public DeliveryNotePdfDataService(DeliveryNoteService deliveryNoteService, NumberUtils numberUtils) {
        super(numberUtils);
        this.deliveryNoteService = deliveryNoteService;
    }

    /**
     * Prépare toutes les données nécessaires pour générer le PDF d'un bon de livraison
     */
    public Map<String, Object> preparePdfData(Long deliveryNoteId) {
        Map<String, Object> data = new HashMap<>();

        deliveryNoteService.findById(deliveryNoteId).ifPresent(dn -> {
            populateDeliveryNoteData(dn, data);
            populateCustomerData(dn.getCustomer(), data);  // Méthode héritée
        });

        populateCompanyData(data);  // Méthode héritée
        addDefaultPlaceholders(data);

        return data;
    }

    private void populateDeliveryNoteData(DeliveryNote dn, Map<String, Object> data) {
        data.put("deliveryNoteNumber", dn.getDeliveryNoteNumber());
        data.put("deliveryDate", dn.getDateDelivery().format(DATE_FORMATTER));
        data.put("statusLabel", getStatusLabel(dn.getStatus().name()));
        data.put("notes", dn.getNotes());
        data.put("deliveryAddress", defaultIfNull(dn.getDeliveryAddress(), ""));

        // Déterminer si la TVA doit être appliquée (par défaut non)
        boolean applyTva = dn.getApplyTva() != null ? dn.getApplyTva() : false;
        data.put("applyTva", applyTva);
        data.put("showTva", applyTva);

        List<Map<String, Object>> productsList = buildProductsList(dn);
        data.put("products", productsList);

        calculateAndSetTotals(productsList, data, applyTva);
    }

    private void calculateAndSetTotals(List<Map<String, Object>> productsList, Map<String, Object> data, boolean applyTva) {
        double totalDiscount = productsList.stream()
                .mapToDouble(p -> getDoubleValue(p.get("discountValue")))
                .sum();

        double totalHT = productsList.stream()
                .mapToDouble(p -> getDoubleValue(p.get("totalPriceValue")))
                .sum();

        double tva = applyTva ? totalHT * VAT_RATE : 0.0;
        double totalTTC = totalHT + tva;

        data.put("totalHTFormatted", formatDecimal(totalHT, 3, 3));
        data.put("totalDiscountFormatted", formatDecimal(totalDiscount, 3, 3));
        data.put("tvaFormatted", applyTva ? formatDecimal(tva, 3, 3) : "0,000");
        data.put("totalFormatted", formatDecimal(totalTTC, 3, 3));
    }

    private List<Map<String, Object>> buildProductsList(DeliveryNote dn) {
        List<Map<String, Object>> productsList = new ArrayList<>();

        if (dn.getDeliveryNoteProducts() == null) return productsList;

        for (DeliveryNoteProduct dnp : dn.getDeliveryNoteProducts()) {
            productsList.add(buildProductData(dnp));
        }

        return productsList;
    }

    private Map<String, Object> buildProductData(DeliveryNoteProduct dnp) {
        Map<String, Object> productData = new HashMap<>();

        String productName = dnp.getProduct() != null ? dnp.getProduct().getName() : "";
        String productRef = dnp.getProduct() != null ? String.valueOf(dnp.getProduct().getReference()) : "";
        int qty = dnp.getQuantity() != null ? dnp.getQuantity() : 0;
        double unitPrice = dnp.getUnitPrice() != null ? dnp.getUnitPrice().doubleValue() : 0.0;
        double totalPrice = dnp.getTotalPrice() != null ? dnp.getTotalPrice().doubleValue() : 0.0;
        double discountPct = dnp.getDiscount() != null ? dnp.getDiscount().doubleValue() : 0.0;

        double grossPrice = unitPrice * qty;
        double discountAmount = Math.max(grossPrice - totalPrice, 0.0);

        productData.put("productName", productName);
        productData.put("productRef", productRef);
        productData.put("quantity", qty);
        productData.put("unitPriceFormatted", formatDecimal(unitPrice, 3, 3));
        productData.put("totalPriceFormatted", formatDecimal(totalPrice, 3, 3));
        productData.put("discountPercentage", formatDecimal(discountPct, 1, 1));
        productData.put("totalPriceValue", totalPrice);
        productData.put("grossValue", grossPrice);
        productData.put("discountValue", discountAmount);

        return productData;
    }

    private void addDefaultPlaceholders(Map<String, Object> data) {
        data.putIfAbsent("deliveryAddress", "");
        data.putIfAbsent("licensePlateX", "");
        data.putIfAbsent("licensePlateY", "");
    }

    private String getStatusLabel(String status) {
        return switch (status) {
            case "PENDING" -> "En attente";
            case "DELIVERED" -> "Livré";
            case "CANCELLED" -> "Annulé";
            default -> status;
        };
    }
}
