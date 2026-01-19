package com.example.stock_management.service;

import com.example.stock_management.dto.StockSummaryDTO;
import com.example.stock_management.dto.StockAlertDTO;
import com.example.stock_management.model.Product;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.PurchaseRepository;
import com.example.stock_management.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private SaleRepository saleRepository;

    /**
     * Générer un résumé de stock pour tous les produits
     */
    public List<StockSummaryDTO> getGlobalStockSummary() {
        return productRepository.findAll().stream()
            .map(this::calculateProductSummary)
            .collect(Collectors.toList());
    }

    /**
     * Générer un résumé de stock pour un produit spécifique
     */
    public StockSummaryDTO getProductStockSummary(Long productId) throws Exception {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new Exception("Produit non trouvé avec l'ID : " + productId));
        return calculateProductSummary(product);
    }

    /**
     * Calculer le résumé pour un produit
     * Applique les règles métier de calcul
     */
    private StockSummaryDTO calculateProductSummary(Product product) {
        StockSummaryDTO summary = new StockSummaryDTO();
        summary.setProductId(product.getIdProduct());
        summary.setProductDesignation(product.getDesignation() != null ? product.getDesignation() : product.getName());

        // Stock initial et valeur initiale
        Integer initialQuantity = product.getInitialStockQuantity() != null ? product.getInitialStockQuantity() : 0;
        Double initialValue = product.getInitialStockValue() != null ? product.getInitialStockValue() : 0.0;

        summary.setInitialQuantity(initialQuantity);
        summary.setInitialValue(initialValue);

        // Totaux achats
        Double totalPurchasesAmount = purchaseRepository.findTotalPurchasesAmountByProduct(product.getIdProduct());
        summary.setTotalPurchasesAmount(totalPurchasesAmount != null ? totalPurchasesAmount : 0.0);

        // Totaux ventes
        Double totalSalesAmount = saleRepository.findTotalSalesAmountByProduct(product.getIdProduct());
        summary.setTotalSalesAmount(totalSalesAmount != null ? totalSalesAmount : 0.0);

        // Règle de calcul : Stock final = Stock Initial + Total Achats - Total Ventes
        Integer finalQuantity = initialQuantity + 
            (purchaseRepository.findTotalPurchasesQuantityByProduct(product.getIdProduct()) != null ? 
                purchaseRepository.findTotalPurchasesQuantityByProduct(product.getIdProduct()) : 0) -
            (saleRepository.findTotalSalesQuantityByProduct(product.getIdProduct()) != null ? 
                saleRepository.findTotalSalesQuantityByProduct(product.getIdProduct()) : 0);

        summary.setFinalQuantity(finalQuantity);

        // Règle de calcul : Valeur stock final = Valeur Initiale + Montant Achats - Montant Ventes
        Double finalStockValue = initialValue + totalPurchasesAmount - totalSalesAmount;
        summary.setFinalStockValue(finalStockValue);

        // Règle de calcul : CMP = Valeur Stock Final / Quantité Stock Final
        // CMP = 0 si stock final = 0
        Double cmp = 0.0;
        if (finalQuantity > 0) {
            cmp = finalStockValue / finalQuantity;
        }
        summary.setCmp(cmp);

        // Mettre à jour le produit avec les valeurs calculées
        product.setCurrentStockQuantity(finalQuantity);
        product.setCurrentStockValue(finalStockValue);
        product.setCmp(cmp);
        productRepository.save(product);

        return summary;
    }

    /**
     * Obtenir les alertes de stock
     * Les produits avec stock <= au seuil critique
     */
    public List<StockAlertDTO> getStockAlerts() {
        return getStockAlerts(10); // Seuil par défaut
    }

    /**
     * Obtenir les alertes de stock avec un seuil configurable
     */
    public List<StockAlertDTO> getStockAlerts(Integer threshold) {
        return productRepository.findAll().stream()
            .filter(product -> {
                Integer currentQuantity = product.getCurrentStockQuantity() != null ? product.getCurrentStockQuantity() : 0;
                return currentQuantity <= threshold;
            })
            .map(product -> {
                StockAlertDTO alert = new StockAlertDTO();
                alert.setProductId(product.getIdProduct());
                alert.setProductDesignation(product.getDesignation() != null ? product.getDesignation() : product.getName());
                Integer currentQuantity = product.getCurrentStockQuantity() != null ? product.getCurrentStockQuantity() : 0;
                alert.setCurrentQuantity(currentQuantity);
                alert.setThreshold(threshold);
                
                // Déterminer le niveau d'alerte
                if (currentQuantity <= 5) {
                    alert.setAlertLevel("CRITICAL");
                } else {
                    alert.setAlertLevel("LOW");
                }
                
                return alert;
            })
            .collect(Collectors.toList());
    }

    /**
     * Obtenir la valeur totale du stock
     */
    public Double getTotalStockValue() {
        return productRepository.findAll().stream()
            .mapToDouble(product -> {
                Double value = product.getCurrentStockValue() != null ? product.getCurrentStockValue() : 0.0;
                return value;
            })
            .sum();
    }

    /**
     * Récalculer le CMP pour tous les produits
     */
    public void recalculateAllCmp() {
        productRepository.findAll().forEach(product -> {
            Double currentValue = product.getCurrentStockValue() != null ? product.getCurrentStockValue() : 0.0;
            Integer currentQuantity = product.getCurrentStockQuantity() != null ? product.getCurrentStockQuantity() : 0;
            
            if (currentQuantity > 0) {
                product.setCmp(currentValue / currentQuantity);
            } else {
                product.setCmp(0.0);
            }
            productRepository.save(product);
        });
    }
}
