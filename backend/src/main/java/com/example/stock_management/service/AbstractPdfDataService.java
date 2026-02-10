package com.example.stock_management.service;

import com.example.stock_management.model.Customer;
import com.example.stock_management.util.NumberUtils;

import java.util.Map;

/**
 * Classe abstraite contenant les méthodes utilitaires communes pour la génération de PDF.
 * <p>
 * Cette classe fournit des utilitaires partagés pour :
 * <ul>
 *   <li>Le formatage des données numériques</li>
 *   <li>La préparation des données client</li>
 *   <li>La préparation des données entreprise</li>
 *   <li>Le parsing et la validation des données</li>
 * </ul>
 * </p>
 * Évite la duplication de code entre InvoicePdfDataService et DeliveryNotePdfDataService.
 * 
 * @author Stock Management System
 * @version 2.0
 */
public abstract class AbstractPdfDataService {

    // ========== Dépendances ==========
    protected final NumberUtils numberUtils;
    
    // ========== Constantes ==========
    private static final String DEFAULT_VALUE = "N/A";
    private static final String DEFAULT_EMPTY_STRING = "";
    private static final int LICENSE_PLATE_PARTS_COUNT = 3;
    private static final String LICENSE_PLATE_SEPARATOR = "\\s+";
    
    // TODO: Ces valeurs devraient provenir d'une configuration ou d'une table Supplier
    private static final String DEFAULT_COMPANY_NAME = "Nom de l'entreprise";
    private static final String DEFAULT_COMPANY_ADDRESS = "Adresse de l'entreprise";
    private static final String DEFAULT_COMPANY_PHONE = "(+216) XX XXX XXX";
    private static final String DEFAULT_COMPANY_TAX_ID = "123456789";

    protected AbstractPdfDataService(NumberUtils numberUtils) {
        this.numberUtils = numberUtils;
    }

    /**
     * Remplit les données communes du client dans le Map pour le template PDF.
     * <p>
     * Les données extraites incluent :
     * <ul>
     *   <li>Nom et adresse du client</li>
     *   <li>Téléphone et code TVA</li>
     *   <li>Informations du livreur (nom, CIN)</li>
     *   <li>Plaque d'immatriculation (parsée)</li>
     * </ul>
     * </p>
     * 
     * @param customer Le client dont les données doivent être extraites (peut être null)
     * @param data La map de données à enrichir
     */
    protected void populateCustomerData(Customer customer, Map<String, Object> data) {
        if (customer == null) {
            populateEmptyCustomerData(data);
            return;
        }

        data.put("customerName", customer.getName());
        data.put("customerAddress", customer.getAddress());
        data.put("customerPhone", defaultIfNull(customer.getPhone(), DEFAULT_EMPTY_STRING));
        data.put("customerTva", defaultIfNull(customer.getTvaCode(), DEFAULT_VALUE));
        data.put("deliveryFullName", defaultIfNull(customer.getFullName(), DEFAULT_EMPTY_STRING));
        data.put("deliveryCin", defaultIfNull(customer.getCin(), DEFAULT_EMPTY_STRING));

        parseLicensePlate(customer.getLicensePlate(), data);
    }
    
    /**
     * Remplit les données client avec des valeurs vides lorsque le client est null.
     */
    private void populateEmptyCustomerData(Map<String, Object> data) {
        data.put("customerName", DEFAULT_EMPTY_STRING);
        data.put("customerAddress", DEFAULT_EMPTY_STRING);
        data.put("customerPhone", DEFAULT_EMPTY_STRING);
        data.put("customerTva", DEFAULT_VALUE);
        data.put("deliveryFullName", DEFAULT_EMPTY_STRING);
        data.put("deliveryCin", DEFAULT_EMPTY_STRING);
        data.put("licensePlateY", DEFAULT_EMPTY_STRING);
        data.put("licensePlateX", DEFAULT_EMPTY_STRING);
    }

    /**
     * Ajoute les données de l'entreprise au Map pour le template PDF.
     * <p>
     * <strong>Note importante :</strong> Les valeurs actuelles sont des placeholders.
     * Dans une implémentation de production, ces valeurs devraient provenir :
     * <ul>
     *   <li>D'une table de configuration dans la base de données</li>
     *   <li>D'un fichier de propriétés (application.properties)</li>
     *   <li>D'une entité Supplier avec l'ID de l'entreprise principale</li>
     * </ul>
     * </p>
     * 
     * @param data La map de données à enrichir
     */
    protected void populateCompanyData(Map<String, Object> data) {
        data.put("companyName", DEFAULT_COMPANY_NAME);
        data.put("companyAddress", DEFAULT_COMPANY_ADDRESS);
        data.put("companyPhone", DEFAULT_COMPANY_PHONE);
        data.put("companyTaxId", DEFAULT_COMPANY_TAX_ID);
    }

    /**
     * Parse une plaque d'immatriculation tunisienne et extrait les composants.
     * <p>
     * Format attendu : "Y تونس X" (exemple : "1234 تونس 7789")
     * <ul>
     *   <li>Y : Deuxième partie numérique (première dans la chaîne)</li>
     *   <li>تونس : Mot "Tunisie" en arabe</li>
     *   <li>X : Première partie numérique (dernière dans la chaîne)</li>
     * </ul>
     * </p>
     * 
     * @param licensePlate La plaque d'immatriculation complète (peut être null ou vide)
     * @param data La map de données où stocker les parties X et Y
     */
    protected void parseLicensePlate(String licensePlate, Map<String, Object> data) {
        if (isValidLicensePlate(licensePlate)) {
            String[] parts = licensePlate.split(LICENSE_PLATE_SEPARATOR);
            if (parts.length >= LICENSE_PLATE_PARTS_COUNT) {
                data.put("licensePlateY", parts[0]);
                data.put("licensePlateX", parts[2]);
                return;
            }
        }
        
        // Valeurs par défaut si le parsing échoue
        data.put("licensePlateY", DEFAULT_EMPTY_STRING);
        data.put("licensePlateX", DEFAULT_EMPTY_STRING);
    }
    
    /**
     * Vérifie si une plaque d'immatriculation est valide (non null et non vide).
     */
    private boolean isValidLicensePlate(String licensePlate) {
        return licensePlate != null && !licensePlate.isEmpty();
    }

    /**
     * Retourne la valeur fournie ou une valeur par défaut si la valeur est null.
     * <p>
     * Utilitaire pour éviter les NullPointerException lors de la manipulation de chaînes.
     * </p>
     * 
     * @param value La valeur à tester
     * @param defaultValue La valeur par défaut à retourner si value est null
     * @return La valeur originale ou la valeur par défaut
     */
    protected String defaultIfNull(String value, String defaultValue) {
        return value != null ? value : defaultValue;
    }

    /**
     * Extrait une valeur double d'un objet de type quelconque.
     * <p>
     * Gère les conversions suivantes :
     * <ul>
     *   <li>Number (Integer, Double, BigDecimal, etc.) → doubleValue()</li>
     *   <li>null ou autre type → 0.0</li>
     * </ul>
     * </p>
     * 
     * @param value L'objet à convertir (peut être null)
     * @return La valeur double extraite ou 0.0
     */
    protected double getDoubleValue(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return 0.0;
    }

    /**
     * Formate un nombre décimal avec la précision spécifiée.
     * <p>
     * Délègue le formatage à NumberUtils qui gère :
     * <ul>
     *   <li>La locale française (espace comme séparateur de milliers, virgule décimale)</li>
     *   <li>Le nombre minimal de décimales affichées</li>
     *   <li>Le nombre maximal de décimales affichées</li>
     * </ul>
     * </p>
     * 
     * @param value La valeur à formater
     * @param minFraction Nombre minimal de décimales (ex: 3 pour "10,000")
     * @param maxFraction Nombre maximal de décimales (ex: 3 pour tronquer à 3 décimales)
     * @return La chaîne formatée selon les règles spécifiées
     */
    protected String formatDecimal(double value, int minFraction, int maxFraction) {
        return numberUtils.formatDecimal(value, minFraction, maxFraction);
    }
}
