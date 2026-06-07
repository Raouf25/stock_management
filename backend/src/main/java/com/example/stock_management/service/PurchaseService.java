package com.example.stock_management.service;

import com.example.stock_management.dto.PurchaseDTO;
import com.example.stock_management.model.Purchase;
import com.example.stock_management.model.Product;
import com.example.stock_management.model.Supplier;
import com.example.stock_management.repository.PurchaseRepository;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    /**
     * Créer un achat groupé multi-produits et mettre à jour le stock pour chaque produit
     */
    @Transactional
    public List<Purchase> createPurchase(PurchaseDTO purchaseDTO) {
        // 1. Valider que le fournisseur existe
        Supplier supplier = supplierRepository.findById(purchaseDTO.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("Fournisseur non trouvé avec l'ID : " + purchaseDTO.getSupplierId()));

        LocalDate datePurchase = purchaseDTO.getDatePurchase() != null ? purchaseDTO.getDatePurchase() : LocalDate.now();
        List<Purchase> savedPurchases = new ArrayList<>();

        // 2. Parcourir chaque ligne de produit envoyée par le front-end
        if (purchaseDTO.getLines() != null) {
            for (PurchaseDTO.PurchaseLineDTO line : purchaseDTO.getLines()) {

                // Valider que le produit de la ligne existe
                Product product = productRepository.findById(line.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Produit non trouvé avec l'ID : " + line.getProductId()));

                // Créer une entité Purchase dédiée à cette ligne de produit
                Purchase purchase = new Purchase();
                purchase.setDatePurchase(datePurchase);
                purchase.setSupplier(supplier);
                purchase.setProduct(product);
                purchase.setInvoiceNumber(purchaseDTO.getInvoiceNumber());
                purchase.setComment(purchaseDTO.getComment());

                // Assigner les données spécifiques à la ligne de produit
                purchase.setQuantity(line.getQuantity());
                purchase.setUnitPriceTTC(line.getUnitPriceTTC());
                purchase.setTotalAmountTTC(line.getQuantity() * line.getUnitPriceTTC());

                // Sauvegarder la ligne d'achat
                Purchase savedLine = purchaseRepository.save(purchase);
                savedPurchases.add(savedLine);

                // Mettre à jour le stock du produit et recalculer le CMP (Entrée de stock)
                updateProductStock(product, line.getQuantity(), line.getUnitPriceTTC(), true);
            }
        }

        return savedPurchases;
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
    public List<Purchase> getPurchasesByFilter(LocalDate dateFrom, LocalDate dateTo, Long supplierId) {
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
     * Convertir une entité Purchase individuelle en DTO (Format unifié compatible avec la classe parente)
     */
    public PurchaseDTO convertToDTO(Purchase purchase) {
        PurchaseDTO dto = new PurchaseDTO();
        dto.setId(purchase.getId());
        dto.setDatePurchase(purchase.getDatePurchase());
        dto.setSupplierId(purchase.getSupplier().getId());
        dto.setSupplierName(purchase.getSupplier().getName());
        dto.setInvoiceNumber(purchase.getInvoiceNumber());
        dto.setComment(purchase.getComment());
        dto.setTotalAmountTTC(purchase.getTotalAmountTTC());

        // Remplir la structure sous forme de liste de lignes à élément unique pour la compatibilité front
        PurchaseDTO.PurchaseLineDTO lineDto = new PurchaseDTO.PurchaseLineDTO();
        lineDto.setProductId(purchase.getProduct().getIdProduct());
        lineDto.setProductName(purchase.getProduct().getName());
        lineDto.setProductDesignation(purchase.getProduct().getDesignation());
        lineDto.setQuantity(purchase.getQuantity());
        lineDto.setUnitPriceTTC(purchase.getUnitPriceTTC());
        lineDto.setTotalLineAmountTTC(purchase.getTotalAmountTTC());

        dto.setLines(List.of(lineDto));
        return dto;
    }

    /**
     * Convertir une liste d'entités Purchase en liste de DTOs
     */
    public List<PurchaseDTO> convertToDTO(List<Purchase> purchases) {
        return purchases.stream()
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());
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