package com.example.stock_management.service;

import com.example.stock_management.model.DeliveryNote;
import com.example.stock_management.model.DeliveryNoteProduct;
import com.example.stock_management.model.Product;
import com.example.stock_management.util.NumberUtils;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Service dédié à la préparation des données pour la génération de PDF de bon de livraison.
 * <p>
 * Ce service gère :
 * <ul>
 *   <li>La préparation des données de bon de livraison pour le rendu PDF</li>
 *   <li>Les calculs de totaux (HT, TVA, TTC, remises)</li>
 *   <li>Le formatage des données pour l'affichage</li>
 *   <li>La conversion des statuts de livraison</li>
 * </ul>
 * </p>
 * Hérite de AbstractPdfDataService pour les méthodes utilitaires communes.
 * 
 * @author Stock Management System
 * @version 2.0
 */
@Service
public class DeliveryNotePdfDataService extends AbstractPdfDataService {

    // ========== Dépendances ==========
    private final DeliveryNoteService deliveryNoteService;

    // ========== Constantes Métier ==========
    private static final double VAT_RATE = 0.19;
    
    // ========== Constantes de Formatage ==========
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int DECIMAL_PRECISION_CURRENCY = 3;
    private static final int DECIMAL_PRECISION_PERCENTAGE = 1;
    
    // ========== Constantes par Défaut ==========
    private static final String DEFAULT_EMPTY_STRING = "";
    private static final String DEFAULT_ZERO_FORMATTED = "0,000";
    
    // ========== Constantes de Statuts ==========
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_DELIVERED = "DELIVERED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_LABEL_PENDING = "En attente";
    private static final String STATUS_LABEL_DELIVERED = "Livré";
    private static final String STATUS_LABEL_CANCELLED = "Annulé";

    public DeliveryNotePdfDataService(DeliveryNoteService deliveryNoteService, NumberUtils numberUtils) {
        super(numberUtils);
        this.deliveryNoteService = deliveryNoteService;
    }

    /**
     * Prépare toutes les données nécessaires pour générer le PDF d'un bon de livraison.
     * <p>
     * Cette méthode orchestre la collecte de toutes les informations requises :
     * <ul>
     *   <li>Données du bon de livraison (produits, totaux, statut)</li>
     *   <li>Informations client</li>
     *   <li>Informations de l'entreprise</li>
     *   <li>Valeurs par défaut pour les champs optionnels</li>
     * </ul>
     * </p>
     * 
     * @param deliveryNoteId L'identifiant du bon de livraison à traiter
     * @return Une Map contenant toutes les données formatées pour le template PDF
     * @throws IllegalArgumentException si deliveryNoteId est null
     */
    public Map<String, Object> preparePdfData(Long deliveryNoteId) {
        Objects.requireNonNull(deliveryNoteId, "Delivery Note ID cannot be null");
        
        Map<String, Object> data = new HashMap<>();

        // Récupération et traitement des données
        deliveryNoteService.findById(deliveryNoteId).ifPresent(dn -> {
            populateDeliveryNoteData(dn, data);
            populateCustomerData(dn.getCustomer(), data);  // Méthode héritée
        });

        // Ajout des informations d'entreprise (méthode héritée)
        populateCompanyData(data);
        
        // Ajout des valeurs par défaut
        addDefaultPlaceholders(data);

        return data;
    }

    /**
     * Remplit les données du bon de livraison dans le Map pour le template PDF.
     * <p>
     * Traite les données dans l'ordre suivant :
     * <ol>
     *   <li>Métadonnées (numéro, date, statut)</li>
     *   <li>Configuration TVA</li>
     *   <li>Liste des produits avec calculs</li>
     *   <li>Totaux du bon de livraison</li>
     * </ol>
     * </p>
     * 
     * @param dn Le bon de livraison à traiter
     * @param data La map de données à enrichir
     */
    private void populateDeliveryNoteData(DeliveryNote dn, Map<String, Object> data) {
        // 1. Métadonnées
        data.put("deliveryNoteNumber", dn.getDeliveryNoteNumber());
        data.put("deliveryDate", dn.getDateDelivery().format(DATE_FORMATTER));
        data.put("statusLabel", getStatusLabel(dn.getStatus().name()));
        data.put("notes", dn.getNotes());
        data.put("deliveryAddress", defaultIfNull(dn.getDeliveryAddress(), DEFAULT_EMPTY_STRING));

        // 2. Configuration TVA
        boolean applyTva = Boolean.TRUE.equals(dn.getApplyTva());
        data.put("applyTva", applyTva);
        data.put("showTva", applyTva);

        // 3. Traitement des produits
        List<Map<String, Object>> productsList = buildProductsList(dn);
        data.put("products", productsList);

        // 4. Calculs des totaux
        calculateAndSetTotals(productsList, data, applyTva);
    }

    /**
     * Calcule et définit tous les totaux du bon de livraison.
     * <p>
     * Calculs effectués :
     * <ul>
     *   <li>Total remises : somme des remises sur tous les produits</li>
     *   <li>Total HT : somme des prix après remise</li>
     *   <li>TVA : 19% du total HT si applicable</li>
     *   <li>Total TTC : Total HT + TVA</li>
     * </ul>
     * </p>
     * 
     * @param productsList Liste des produits avec leurs données calculées
     * @param data La map de données à enrichir
     * @param applyTva Indique si la TVA doit être appliquée
     */
    private void calculateAndSetTotals(List<Map<String, Object>> productsList, 
                                       Map<String, Object> data, 
                                       boolean applyTva) {
        // Total des remises
        double totalDiscount = productsList.stream()
                .mapToDouble(product -> getDoubleValue(product.get("discountValue")))
                .sum();

        // Total HT (après remises)
        double totalHT = productsList.stream()
                .mapToDouble(product -> getDoubleValue(product.get("totalPriceValue")))
                .sum();

        // TVA et Total TTC
        double tva = applyTva ? totalHT * VAT_RATE : 0.0;
        double totalTTC = totalHT + tva;

        // Formatage pour affichage
        data.put("totalHTFormatted", formatAmount(totalHT));
        data.put("totalDiscountFormatted", formatAmount(totalDiscount));
        data.put("tvaFormatted", applyTva ? formatAmount(tva) : DEFAULT_ZERO_FORMATTED);
        data.put("totalFormatted", formatAmount(totalTTC));
    }
    
    /**
     * Formate un montant avec la précision monétaire (3 décimales pour TND).
     */
    private String formatAmount(double amount) {
        return formatDecimal(amount, DECIMAL_PRECISION_CURRENCY, DECIMAL_PRECISION_CURRENCY);
    }

    /**
     * Construit la liste des produits avec tous les calculs nécessaires.
     * <p>
     * Pour chaque produit :
     * <ul>
     *   <li>Extraction des données de base</li>
     *   <li>Calcul du prix brut</li>
     *   <li>Calcul de la remise</li>
     *   <li>Formatage pour affichage</li>
     * </ul>
     * </p>
     * 
     * @param dn Le bon de livraison contenant les produits
     * @return Liste des produits avec toutes les données calculées et formatées
     */
    private List<Map<String, Object>> buildProductsList(DeliveryNote dn) {
        if (dn.getDeliveryNoteProducts() == null || dn.getDeliveryNoteProducts().isEmpty()) {
            return new ArrayList<>();
        }

        return dn.getDeliveryNoteProducts().stream()
                .map(this::buildProductData)
                .toList();
    }

    /**
     * Construit les données complètes d'un produit avec tous les calculs.
     * 
     * @param dnp Le produit du bon de livraison
     * @return Map contenant toutes les données du produit (brutes et formatées)
     */
    private Map<String, Object> buildProductData(DeliveryNoteProduct dnp) {
        // 1. Extraction des données de base
        ProductInfo info = extractProductInfo(dnp);
        
        // 2. Calculs des prix et remises
        double grossPrice = info.unitPrice * info.quantity;
        double discountAmount = Math.max(grossPrice - info.totalPrice, 0.0);

        // 3. Construction de la map de données
        Map<String, Object> productData = new HashMap<>();
        
        // Informations de base
        productData.put("productName", info.name);
        productData.put("productRef", info.reference);
        productData.put("quantity", info.quantity);
        
        // Prix (bruts + formatés)
        productData.put("unitPriceFormatted", formatAmount(info.unitPrice));
        productData.put("totalPriceValue", info.totalPrice);
        productData.put("totalPriceFormatted", formatAmount(info.totalPrice));
        
        // Remise (brute + formatée)
        productData.put("discountPercentage", formatDecimal(info.discountPercentage, 
            DECIMAL_PRECISION_PERCENTAGE, DECIMAL_PRECISION_PERCENTAGE));
        productData.put("discountValue", discountAmount);
        
        // Valeurs intermédiaires
        productData.put("grossValue", grossPrice);

        return productData;
    }
    
    /**
     * Extrait les informations de base d'un produit de bon de livraison.
     */
    private ProductInfo extractProductInfo(DeliveryNoteProduct dnp) {
        Product product = dnp.getProduct();
        
        String name = product != null ? product.getName() : DEFAULT_EMPTY_STRING;
        String reference = product != null ? String.valueOf(product.getReference()) : DEFAULT_EMPTY_STRING;
        int quantity = dnp.getQuantity() != null ? dnp.getQuantity() : 0;
        double unitPrice = dnp.getUnitPrice() != null ? dnp.getUnitPrice().doubleValue() : 0.0;
        double totalPrice = dnp.getTotalPrice() != null ? dnp.getTotalPrice().doubleValue() : 0.0;
        double discountPercentage = dnp.getDiscount() != null ? dnp.getDiscount().doubleValue() : 0.0;
        
        return new ProductInfo(name, reference, quantity, unitPrice, totalPrice, discountPercentage);
    }

    /**
     * Ajoute les valeurs par défaut pour les champs optionnels du bon de livraison.
     * Ces valeurs sont utilisées si les champs ne sont pas renseignés.
     */
    private void addDefaultPlaceholders(Map<String, Object> data) {
        data.putIfAbsent("deliveryAddress", DEFAULT_EMPTY_STRING);
        data.putIfAbsent("licensePlateX", DEFAULT_EMPTY_STRING);
        data.putIfAbsent("licensePlateY", DEFAULT_EMPTY_STRING);
    }

    /**
     * Convertit un code de statut technique en libellé lisible.
     * <p>
     * Correspondances :
     * <ul>
     *   <li>PENDING → "En attente"</li>
     *   <li>DELIVERED → "Livré"</li>
     *   <li>CANCELLED → "Annulé"</li>
     *   <li>Autre → Retourne le code tel quel</li>
     * </ul>
     * </p>
     * 
     * @param status Le code de statut technique
     * @return Le libellé en français du statut
     */
    private String getStatusLabel(String status) {
        return switch (status) {
            case STATUS_PENDING -> STATUS_LABEL_PENDING;
            case STATUS_DELIVERED -> STATUS_LABEL_DELIVERED;
            case STATUS_CANCELLED -> STATUS_LABEL_CANCELLED;
            default -> status;
        };
    }
    
    // ========== Record interne pour structurer les données ==========
    
    /**
     * Informations de base d'un produit extraites de DeliveryNoteProduct.
     * 
     * @param name Nom du produit
     * @param reference Référence du produit
     * @param quantity Quantité livrée
     * @param unitPrice Prix unitaire
     * @param totalPrice Prix total après remise
     * @param discountPercentage Pourcentage de remise appliqué
     */
    private record ProductInfo(
        String name,
        String reference,
        int quantity,
        double unitPrice,
        double totalPrice,
        double discountPercentage
    ) {}
}
