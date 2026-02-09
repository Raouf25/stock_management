package com.example.stock_management.service;

import com.example.stock_management.model.Customer;
import com.example.stock_management.util.NumberUtils;

import java.util.Map;

/**
 * Classe abstraite contenant les méthodes utilitaires communes pour la génération de PDF.
 * Évite la duplication de code entre InvoicePdfDataService et DeliveryNotePdfDataService.
 */
public abstract class AbstractPdfDataService {

    protected final NumberUtils numberUtils;

    protected AbstractPdfDataService(NumberUtils numberUtils) {
        this.numberUtils = numberUtils;
    }

    /**
     * Remplit les données communes du client dans le Map pour le template PDF
     */
    protected void populateCustomerData(Customer customer, Map<String, Object> data) {
        if (customer == null) return;

        data.put("customerName", customer.getName());
        data.put("customerAddress", customer.getAddress());
        data.put("customerPhone", defaultIfNull(customer.getPhone(), ""));
        data.put("customerTva", defaultIfNull(customer.getTvaCode(), "N/A"));
        data.put("deliveryFullName", defaultIfNull(customer.getFullName(), ""));
        data.put("deliveryCin", defaultIfNull(customer.getCin(), ""));

        parseLicensePlate(customer.getLicensePlate(), data);
    }

    /**
     * Ajoute les données de l'entreprise (à personnaliser selon configuration)
     */
    protected void populateCompanyData(Map<String, Object> data) {
        // TODO: Ces valeurs devraient provenir d'une configuration ou d'une table Supplier
        data.put("companyName", "Nom de l'entreprise");
        data.put("companyAddress", "Adresse de l'entreprise");
        data.put("companyPhone", "(+216) XX XXX XXX");
        data.put("companyTaxId", "123456789");
    }

    /**
     * Parse la plaque d'immatriculation tunisienne (format: "Y تونس X")
     */
    protected void parseLicensePlate(String licensePlate, Map<String, Object> data) {
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
    protected String defaultIfNull(String value, String defaultValue) {
        return value != null ? value : defaultValue;
    }

    /**
     * Extrait une valeur double d'un objet
     */
    protected double getDoubleValue(Object value) {
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return 0.0;
    }

    /**
     * Formate un nombre décimal avec la précision spécifiée
     */
    protected String formatDecimal(double value, int minFraction, int maxFraction) {
        return numberUtils.formatDecimal(value, minFraction, maxFraction);
    }
}
