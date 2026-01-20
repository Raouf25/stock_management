package com.example.stock_management.service;

import com.example.stock_management.dto.PurchaseDTO;
import com.example.stock_management.model.Purchase;
import com.example.stock_management.model.Product;
import com.example.stock_management.model.StockMouvement;
import com.example.stock_management.model.Supplier;
import com.example.stock_management.repository.PurchaseRepository;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.SupplierRepository;
import com.example.stock_management.repository.StockMouvementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private StockMouvementRepository stockMouvementRepository;

    /**
     * Créer un nouvel achat et générer automatiquement une entrée de stock
     */
    @Transactional
    public Purchase createPurchase(PurchaseDTO purchaseDTO) throws Exception {
        // Valider le produit existe
        Product product = productRepository.findById(purchaseDTO.getProductId())
            .orElseThrow(() -> new Exception("Produit non trouvé avec l'ID : " + purchaseDTO.getProductId()));

        // Valider le fournisseur existe
        Supplier supplier = supplierRepository.findById(purchaseDTO.getSupplierId())
            .orElseThrow(() -> new Exception("Fournisseur non trouvé avec l'ID : " + purchaseDTO.getSupplierId()));

        // Créer l'achat
        Purchase purchase = new Purchase();
        purchase.setDatePurchase(purchaseDTO.getDatePurchase() != null ? purchaseDTO.getDatePurchase() : LocalDateTime.now());
        purchase.setProduct(product);
        purchase.setSupplier(supplier);
        purchase.setInvoiceNumber(purchaseDTO.getInvoiceNumber());
        purchase.setQuantity(purchaseDTO.getQuantity());
        purchase.setUnitPriceTTC(purchaseDTO.getUnitPriceTTC());
        purchase.setTotalAmountTTC(purchaseDTO.getQuantity() * purchaseDTO.getUnitPriceTTC());
        purchase.setComment(purchaseDTO.getComment());

        // Sauvegarder l'achat
        Purchase savedPurchase = purchaseRepository.save(purchase);

        // Générer automatiquement une entrée de stock
        StockMouvement mouvement = new StockMouvement();
        mouvement.setProduct(product);
        mouvement.setQuantity(purchaseDTO.getQuantity());
        mouvement.setDate(LocalDateTime.now());
        mouvement.setType(StockMouvement.Type.ENTREE);
        mouvement.setSource(StockMouvement.Source.ACHAT);
        mouvement.setPurchase(savedPurchase);
        mouvement.setReference(purchaseDTO.getInvoiceNumber());

        stockMouvementRepository.save(mouvement);

        // Mettre à jour le stock du produit et la valeur du stock
        updateProductStock(product, purchaseDTO.getQuantity(), purchaseDTO.getUnitPriceTTC(), true);

        return savedPurchase;
    }

    /**
     * Récupérer tous les achats
     */
    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    /**
     * Récupérer un achat par ID
     */
    public Optional<Purchase> getPurchaseById(Long id) {
        return purchaseRepository.findById(id);
    }

    /**
     * Récupérer les achats filtrés
     */
    public List<Purchase> getPurchasesByFilter(LocalDateTime dateFrom, LocalDateTime dateTo, Long supplierId) {
        if (supplierId != null && dateFrom != null && dateTo != null) {
            return purchaseRepository.findBySupplierAndDateRange(supplierId, dateFrom, dateTo);
        } else if (dateFrom != null && dateTo != null) {
            return purchaseRepository.findByDateRange(dateFrom, dateTo);
        } else if (supplierId != null) {
            return purchaseRepository.findBySupplier_Id(supplierId);
        }
        return purchaseRepository.findAll();
    }

    /**
     * Récupérer les achats par produit
     */
    public List<Purchase> getPurchasesByProduct(Long productId) {
        return purchaseRepository.findByProduct_IdProduct(productId);
    }

    /**
     * Convertir une entité Purchase en DTO
     */
    public PurchaseDTO convertToDTO(Purchase purchase) {
        PurchaseDTO dto = new PurchaseDTO();
        dto.setId(purchase.getId());
        dto.setDatePurchase(purchase.getDatePurchase());
        dto.setSupplierId(purchase.getSupplier().getId());
        dto.setSupplierName(purchase.getSupplier().getName());
        dto.setProductId(purchase.getProduct().getIdProduct());
        dto.setProductDesignation(purchase.getProduct().getDesignation());
        dto.setInvoiceNumber(purchase.getInvoiceNumber());
        dto.setQuantity(purchase.getQuantity());
        dto.setUnitPriceTTC(purchase.getUnitPriceTTC());
        dto.setTotalAmountTTC(purchase.getTotalAmountTTC());
        dto.setComment(purchase.getComment());
        return dto;
    }

    /**
     * Mettre à jour le stock et la valeur du produit
     */
    private void updateProductStock(Product product, Integer quantity, Double unitPrice, boolean isEntry) {
        if (isEntry) {
            // Entrée de stock : mise à jour du CMP
            if (product.getCurrentStockQuantity() == null) {
                product.setCurrentStockQuantity(0);
            }
            if (product.getCurrentStockValue() == null) {
                product.setCurrentStockValue(0.0);
            }

            int newQuantity = product.getCurrentStockQuantity() + quantity;
            double newValue = product.getCurrentStockValue() + (quantity * unitPrice);

            product.setCurrentStockQuantity(newQuantity);
            product.setCurrentStockValue(newValue);

            // Calculer le CMP
            if (newQuantity > 0) {
                product.setCmp(newValue / newQuantity);
            } else {
                product.setCmp(0.0);
            }
        } else {
            // Sortie de stock
            if (product.getCurrentStockQuantity() == null) {
                product.setCurrentStockQuantity(0);
            }
            if (product.getCurrentStockValue() == null) {
                product.setCurrentStockValue(0.0);
            }

            int newQuantity = Math.max(0, product.getCurrentStockQuantity() - quantity);
            Double cmpValue = product.getCmp() != null ? product.getCmp() : unitPrice;
            double newValue = Math.max(0, product.getCurrentStockValue() - (quantity * cmpValue));

            product.setCurrentStockQuantity(newQuantity);
            product.setCurrentStockValue(newValue);

            // Calculer le CMP
            if (newQuantity > 0) {
                product.setCmp(newValue / newQuantity);
            } else {
                product.setCmp(0.0);
            }
        }

        productRepository.save(product);
    }

    /**
     * Récupérer le total des achats pour un produit
     */
    public Double getTotalPurchasesAmount(Long productId) {
        return purchaseRepository.findTotalPurchasesAmountByProduct(productId);
    }

    /**
     * Récupérer le total des quantités achetées pour un produit
     */
    public Integer getTotalPurchasesQuantity(Long productId) {
        return purchaseRepository.findTotalPurchasesQuantityByProduct(productId);
    }
}
