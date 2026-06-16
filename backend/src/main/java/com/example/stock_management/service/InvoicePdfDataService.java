package com.example.stock_management.service;

import com.example.stock_management.model.Bill;
import com.example.stock_management.model.BillProduct;
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
 * Service dédié à la préparation des données pour la génération de PDF de facture.
 * <p>
 * Ce service gère :
 * <ul>
 *   <li>La préparation des données de facture pour le rendu PDF</li>
 *   <li>Les calculs de totaux (HT, TVA, TTC, remises)</li>
 *   <li>Le formatage des données pour l'affichage</li>
 *   <li>La génération du corps d'email pour l'envoi de facture</li>
 * </ul>
 * </p>
 * Hérite de AbstractPdfDataService pour les méthodes utilitaires communes.
 *
 * @author Stock Management System
 * @version 2.0
 */
@Service
public class InvoicePdfDataService extends AbstractPdfDataService {

    // ========== Dépendances ==========
    private final BillService billService;
    private final SupplierService supplierService;
    private final EmailTemplateService emailTemplateService;

    // ========== Constantes Métier ==========
    private static final double VAT_RATE = 0.19;
    private static final String VAT_RATE_DISPLAY = "19%";
    private static final String NO_VAT_DISPLAY = "0%";
    private static final Long DEFAULT_SUPPLIER_ID = 3L;

    // ========== Constantes de Formatage ==========
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String BILL_NUMBER_PREFIX = "FAC-";
    private static final String BILL_NUMBER_FORMAT = "%04d";
    private static final int DECIMAL_PRECISION_CURRENCY = 3;
    private static final int DECIMAL_PRECISION_PERCENTAGE = 1;

    // ========== Constantes par Défaut ==========
    private static final String DEFAULT_PAYMENT_METHOD = "Espèces / Virement / Chèque";
    private static final String DEFAULT_PAYMENT_TERMS = "30 jours";
    private static final String DEFAULT_VALUE = "N/A";
    private static final String DEFAULT_EMPTY_STRING = "";
    private static final String DEFAULT_ZERO_FORMATTED = "0,000";

    public InvoicePdfDataService(BillService billService,
                                  SupplierService supplierService,
                                  EmailTemplateService emailTemplateService,
                                  NumberUtils numberUtils) {
        super(numberUtils);
        this.billService = billService;
        this.supplierService = supplierService;
        this.emailTemplateService = emailTemplateService;
    }

    /**
     * Prépare toutes les données nécessaires pour générer le PDF d'une facture.
     * <p>
     * Cette méthode orchestre la collecte de toutes les informations requises :
     * <ul>
     *   <li>Informations du fournisseur</li>
     *   <li>Données de la facture (client, produits, totaux)</li>
     *   <li>Informations de l'entreprise</li>
     *   <li>Valeurs par défaut pour les champs optionnels</li>
     * </ul>
     * </p>
     *
     * @param billId L'identifiant de la facture à traiter
     * @return Une Map contenant toutes les données formatées pour le template PDF
     * @throws IllegalArgumentException si billId est null
     */
    public Map<String, Object> preparePdfData(Long billId) {
        Objects.requireNonNull(billId, "Bill ID cannot be null");

        Map<String, Object> data = new HashMap<>();

        // Récupération des données du fournisseur
        supplierService.findById(DEFAULT_SUPPLIER_ID)
            .ifPresent(supplier -> data.put("supplier", supplier));

        // Récupération et traitement des données de facture
        billService.findById(billId)
            .ifPresent(bill -> populateBillData(bill, data));

        // Ajout des informations d'entreprise (méthode héritée)
        populateCompanyData(data);

        // Ajout des valeurs par défaut
        addDefaultPlaceholders(data);

        return data;
    }

    /**
     * Construit le corps HTML de l'email pour l'envoi de facture en utilisant le template premium
     */
    public String buildEmailBody(String billNumber, String customerName, Map<String, Object> data) {
        String billDate = (String) data.get("billDate");
        String totalAmount = (String) data.get("totalTTCFormatted");

        // Utiliser le template Thymeleaf premium invoice-notification.html
        return emailTemplateService.renderInvoiceNotification(
                customerName,
                billNumber,
                billDate,
                totalAmount + " TND"
        );
    }

    /**
     * Remplit les données de la facture dans le Map pour le template PDF.
     * <p>
     * Traite les données dans l'ordre suivant :
     * <ol>
     *   <li>Informations client</li>
     *   <li>Configuration TVA</li>
     *   <li>Liste des produits avec calculs</li>
     *   <li>Totaux de la facture</li>
     *   <li>Métadonnées (numéro, date)</li>
     * </ol>
     * </p>
     *
     * @param bill La facture à traiter
     * @param data La map de données à enrichir
     */
    private void populateBillData(Bill bill, Map<String, Object> data) {
        // 1. Informations client
        data.put("customer", bill.getCustomer());
        populateCustomerData(bill.getCustomer(), data);
        populateClientDetails(bill, data);

        // 2. Configuration TVA
        boolean applyTva = Boolean.TRUE.equals(bill.getApplyTva());
        data.put("applyTva", applyTva);

        // 3. Traitement des produits
        List<Map<String, Object>> productsList = buildProductsList(bill, applyTva);
        data.put("products", productsList);

        // 4. Calculs des totaux
        BillTotals totals = calculateTotals(productsList, bill, applyTva);
        populateTotals(data, totals, applyTva);

        // 5. Métadonnées de la facture
        populateBillMetadata(bill, data);
    }

    /**
     * Ajoute les métadonnées de la facture (numéro et date).
     */
    private void populateBillMetadata(Bill bill, Map<String, Object> data) {
        String billNumber = BILL_NUMBER_PREFIX + String.format(BILL_NUMBER_FORMAT, bill.getIdBill());
        data.put("billNumber", billNumber);
        data.put("billDate", bill.getDateBill().format(DATE_FORMATTER));
        data.put("paymentStatus",bill.getPaymentStatus().getLabel());
    }

    /**
     * Ajoute les détails client spécifiques à la facture.
     */
    private void populateClientDetails(Bill bill, Map<String, Object> data) {
        if (bill.getCustomer() != null) {
            Map<String, String> client = new HashMap<>();
            client.put("name", bill.getCustomer().getName());
            client.put("address", bill.getCustomer().getAddress());
            client.put("taxId", defaultIfNull(bill.getCustomer().getTvaCode(), DEFAULT_VALUE));
            data.put("client", client);
        }
    }

    /**
     * Remplit la map de données avec les totaux de la facture (bruts et formatés).
     *
     * @param data La map de données à enrichir
     * @param totals Les totaux calculés
     * @param applyTva Indique si la TVA est appliquée
     */
    private void populateTotals(Map<String, Object> data, BillTotals totals, boolean applyTva) {
        // Valeurs brutes pour calculs
        data.put("total", totals.totalTTC);
        data.put("totalHT", totals.totalHT);
        data.put("tva", totals.tva);
        data.put("totalGrossHT", totals.totalGrossHT);
        data.put("totalDiscount", totals.totalDiscount);
        data.put("deposit", totals.deposit);
        data.put("amountDue", totals.amountDue);
        data.put("showTva", applyTva);

        // Valeurs formatées pour affichage
        data.put("totalHTFormatted", formatAmount(totals.totalHT));
        data.put("tvaFormatted", applyTva ? formatAmount(totals.tva) : DEFAULT_ZERO_FORMATTED);
        data.put("totalTTCFormatted", formatAmount(totals.totalTTC));
        data.put("totalGrossHTFormatted", formatAmount(totals.totalGrossHT));
        data.put("totalDiscountFormatted", formatAmount(totals.totalDiscount));
        data.put("depositFormatted", formatAmount(totals.deposit));
        data.put("amountDueFormatted", formatAmount(totals.amountDue));
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
     *   <li>Calcul du prix unitaire</li>
     *   <li>Calcul de la remise</li>
     *   <li>Calcul de la TVA si applicable</li>
     *   <li>Formatage pour affichage</li>
     * </ul>
     * </p>
     *
     * @param bill La facture contenant les produits
     * @param applyTva Indique si la TVA doit être appliquée
     * @return Liste des produits avec toutes les données calculées et formatées
     */
    private List<Map<String, Object>> buildProductsList(Bill bill, boolean applyTva) {
        if (bill.getBillProducts() == null || bill.getBillProducts().isEmpty()) {
            return new ArrayList<>();
        }

        return bill.getBillProducts().stream()
            .map(billProduct -> buildProductData(billProduct, applyTva))
            .toList();
    }

    /**
     * Construit les données complètes d'un produit avec tous les calculs.
     *
     * @param bp Le produit de la facture
     * @param applyTva Indique si la TVA doit être appliquée
     * @return Map contenant toutes les données du produit (brutes et formatées)
     */
    private Map<String, Object> buildProductData(BillProduct bp, boolean applyTva) {
        // 1. Extraction des données de base
        ProductInfo info = extractProductInfo(bp);

        // 2. Calculs des prix et remises
        double unitPrice = calculateUnitPrice(bp, info.totalPrice, info.quantity);
        ProductDiscount discount = calculateDiscount(bp, unitPrice, info.quantity, info.totalPrice);

        // 3. Calcul de la TVA
        double vatAmount = applyTva ? info.totalPrice * VAT_RATE : 0.0;
        double totalWithVat = info.totalPrice + vatAmount;

        // 4. Construction de la map de données
        Map<String, Object> productData = new HashMap<>();

        // Informations de base
        productData.put("productRef", info.reference);
        productData.put("productName", info.name);
        productData.put("productDescription", info.description);
        productData.put("quantity", info.quantity);

        // Prix (bruts + formatés)
        productData.put("unitPriceValue", unitPrice);
        productData.put("unitPriceFormatted", formatAmount(unitPrice));
        productData.put("totalPriceValue", info.totalPrice);
        productData.put("totalPriceFormatted", formatAmount(info.totalPrice));

        // Remise (brute + formatée)
        productData.put("discountValue", discount.amount);
        productData.put("discountFormatted", formatAmount(discount.amount));
        productData.put("discountPercentage", formatDecimal(discount.percentage,
            DECIMAL_PRECISION_PERCENTAGE, DECIMAL_PRECISION_PERCENTAGE));

        // TVA (brute + formatée)
        productData.put("vatRate", applyTva ? VAT_RATE_DISPLAY : NO_VAT_DISPLAY);
        productData.put("vatAmountValue", vatAmount);
        productData.put("vatAmountFormatted", formatAmount(vatAmount));
        productData.put("totalWithVatFormatted", formatAmount(totalWithVat));

        return productData;
    }

    /**
     * Extrait les informations de base d'un produit de facture.
     */
    private ProductInfo extractProductInfo(BillProduct bp) {
        Product product = bp.getProduct();

        String name = product != null ? product.getName() : DEFAULT_EMPTY_STRING;
        String description = product != null ? product.getDescription() : DEFAULT_EMPTY_STRING;
        String reference = product != null ? String.valueOf(product.getReference()) : DEFAULT_EMPTY_STRING;
        int quantity = bp.getQuantity() != null ? bp.getQuantity() : 0;
        double totalPrice = bp.getTotalProductPrice() != null ? bp.getTotalProductPrice() : 0.0;

        return new ProductInfo(name, reference,description, quantity, totalPrice);
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
     * Calcule tous les totaux de la facture à partir de la liste des produits.
     * <p>
     * Calculs effectués :
     * <ul>
     *   <li>Total HT : somme des prix après remise</li>
     *   <li>Total brut HT : somme des prix avant remise</li>
     *   <li>Total remises : différence entre brut et net</li>
     *   <li>TVA : 19% du total HT si applicable</li>
     *   <li>Total TTC : Total HT + TVA</li>
     *   <li>Net à payer : Total TTC - Acompte</li>
     * </ul>
     * </p>
     *
     * @param productsList Liste des produits avec leurs données calculées
     * @param bill La facture pour récupérer l'acompte
     * @param applyTva Indique si la TVA doit être appliquée
     * @return Objet contenant tous les totaux calculés
     */
    private BillTotals calculateTotals(List<Map<String, Object>> productsList, Bill bill, boolean applyTva) {
        // Total HT (après remises)
        double sumTotalHT = productsList.stream()
            .mapToDouble(product -> getDoubleValue(product.get("totalPriceValue")))
            .sum();

        // TVA sur le total HT
        double sumVat = applyTva
            ? productsList.stream()
                .mapToDouble(product -> getDoubleValue(product.get("vatAmountValue")))
                .sum()
            : 0.0;

        // Total brut HT (avant remises)
        double sumGrossHT = productsList.stream()
            .mapToDouble(product -> {
                double unitPrice = getDoubleValue(product.get("unitPriceValue"));
                int quantity = ((Number) product.get("quantity")).intValue();
                return unitPrice * quantity;
            })
            .sum();

        // Total des remises
        double sumDiscount = productsList.stream()
            .mapToDouble(product -> getDoubleValue(product.get("discountValue")))
            .sum();

        // Calculs finaux
        double totalTTC = sumTotalHT + sumVat;
        double deposit = bill.getDeposit() != null ? bill.getDeposit().doubleValue() : 0.0;
        double amountDue = totalTTC - deposit;

        return new BillTotals(sumTotalHT, sumVat, totalTTC, sumGrossHT, sumDiscount, deposit, amountDue);
    }

    /**
     * Ajoute les valeurs par défaut pour les champs optionnels de la facture.
     * Ces valeurs sont utilisées si les champs ne sont pas renseignés dans la facture.
     */
    private void addDefaultPlaceholders(Map<String, Object> data) {
        data.putIfAbsent("deliveryAddress", DEFAULT_EMPTY_STRING);
        data.putIfAbsent("customerRef", DEFAULT_EMPTY_STRING);
        data.putIfAbsent("paymentMethod", DEFAULT_PAYMENT_METHOD);
        data.putIfAbsent("paymentRef", DEFAULT_EMPTY_STRING);
        data.putIfAbsent("paymentTerms", DEFAULT_PAYMENT_TERMS);
    }

    // ========== Records internes pour structurer les données ==========

    /**
     * Informations de base d'un produit extraites de BillProduct.
     *
     * @param name Nom du produit
     * @param description  Description du produit
     * @param reference Référence du produit
     * @param quantity Quantité commandée
     * @param totalPrice Prix total après remise
     */
    private record ProductInfo(
        String name,
        String description,
        String reference,
        int quantity,
        double totalPrice
    ) {}

    /**
     * Remise calculée pour un produit.
     *
     * @param amount Montant de la remise en devise
     * @param percentage Pourcentage de remise (0-100)
     */
    private record ProductDiscount(
        double amount,
        double percentage
    ) {}

    /**
     * Ensemble des totaux calculés pour une facture.
     *
     * @param totalHT Total hors taxes (après remises)
     * @param tva Montant de la TVA
     * @param totalTTC Total toutes taxes comprises
     * @param totalGrossHT Total brut HT (avant remises)
     * @param totalDiscount Montant total des remises
     * @param deposit Acompte versé
     * @param amountDue Montant restant dû (TTC - Acompte)
     */
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
