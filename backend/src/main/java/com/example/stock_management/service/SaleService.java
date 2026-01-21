package com.example.stock_management.service;

import com.example.stock_management.dto.SaleDTO;
import com.example.stock_management.model.Sale;
import com.example.stock_management.model.Product;
import com.example.stock_management.model.StockMouvement;
import com.example.stock_management.repository.SaleRepository;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.StockMouvementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockMouvementRepository stockMouvementRepository;

    /**
     * Créer une nouvelle vente et générer automatiquement une sortie de stock
     */
    @Transactional
    public Sale createSale(SaleDTO saleDTO) throws Exception {
        // Valider le produit existe
        Product product = productRepository.findById(saleDTO.getProductId())
            .orElseThrow(() -> new Exception("Produit non trouvé avec l'ID : " + saleDTO.getProductId()));

        // Vérifier que la quantité vendue ne dépasse pas le stock disponible
        if (product.getCurrentStockQuantity() == null || product.getCurrentStockQuantity() < saleDTO.getQuantitySold()) {
            throw new Exception("Quantité insuffisante en stock. Stock disponible : " + 
                (product.getCurrentStockQuantity() != null ? product.getCurrentStockQuantity() : 0) + 
                ", Quantité demandée : " + saleDTO.getQuantitySold());
        }

        // Créer la vente
        Sale sale = new Sale();
        sale.setDateSale(saleDTO.getDateSale() != null ? saleDTO.getDateSale() : LocalDate.now());
        sale.setProduct(product);
        sale.setQuantitySold(saleDTO.getQuantitySold());
        sale.setUnitSalePrice(saleDTO.getUnitSalePrice());
        sale.setTotalSaleAmount(saleDTO.getQuantitySold() * saleDTO.getUnitSalePrice());

        // Sauvegarder la vente
        Sale savedSale = saleRepository.save(sale);

        // Générer automatiquement une sortie de stock
        StockMouvement mouvement = new StockMouvement();
        mouvement.setProduct(product);
        mouvement.setQuantity(saleDTO.getQuantitySold());
        mouvement.setDate(LocalDate.now());
        mouvement.setType(StockMouvement.Type.SORTIE);
        mouvement.setSource(StockMouvement.Source.VENTE);
        mouvement.setSale(savedSale);
        mouvement.setReference("VENTE-" + savedSale.getId());

        stockMouvementRepository.save(mouvement);

        // Mettre à jour le stock du produit
        updateProductStock(product, saleDTO.getQuantitySold(), false);

        return savedSale;
    }

    /**
     * Récupérer toutes les ventes
     */
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    /**
     * Récupérer une vente par ID
     */
    public Optional<Sale> getSaleById(Long id) {
        return saleRepository.findById(id);
    }

    /**
     * Récupérer les ventes filtrées
     */
    public List<Sale> getSalesByFilter(LocalDate dateFrom, LocalDate dateTo) {
        if (dateFrom != null && dateTo != null) {
            return saleRepository.findByDateRange(dateFrom, dateTo);
        }
        return saleRepository.findAll();
    }

    /**
     * Récupérer les ventes par produit
     */
    public List<Sale> getSalesByProduct(Long productId) {
        return saleRepository.findByProduct_IdProduct(productId);
    }

    /**
     * Convertir une entité Sale en DTO
     */
    public SaleDTO convertToDTO(Sale sale) {
        SaleDTO dto = new SaleDTO();
        dto.setId(sale.getId());
        dto.setDateSale(sale.getDateSale());
        dto.setProductId(sale.getProduct().getIdProduct());
        dto.setProductDesignation(sale.getProduct().getDesignation());
        dto.setQuantitySold(sale.getQuantitySold());
        dto.setUnitSalePrice(sale.getUnitSalePrice());
        dto.setTotalSaleAmount(sale.getTotalSaleAmount());
        return dto;
    }

    /**
     * Mettre à jour le stock du produit lors d'une sortie
     */
    private void updateProductStock(Product product, Integer quantity, boolean isAdjustment) {
        if (product.getCurrentStockQuantity() == null) {
            product.setCurrentStockQuantity(0);
        }
        if (product.getCurrentStockValue() == null) {
            product.setCurrentStockValue(0.0);
        }

        // Récupérer le CMP actuel
        Double cmp = product.getCmp() != null ? product.getCmp() : 0.0;

        int newQuantity = Math.max(0, product.getCurrentStockQuantity() - quantity);
        double deductedValue = quantity * cmp;
        double newValue = Math.max(0, product.getCurrentStockValue() - deductedValue);

        product.setCurrentStockQuantity(newQuantity);
        product.setCurrentStockValue(newValue);

        // Recalculer le CMP
        if (newQuantity > 0) {
            product.setCmp(newValue / newQuantity);
        } else {
            product.setCmp(0.0);
        }

        productRepository.save(product);
    }

    /**
     * Récupérer le total des ventes pour un produit
     */
    public Double getTotalSalesAmount(Long productId) {
        return saleRepository.findTotalSalesAmountByProduct(productId);
    }

    /**
     * Récupérer le total des quantités vendues pour un produit
     */
    public Integer getTotalSalesQuantity(Long productId) {
        return saleRepository.findTotalSalesQuantityByProduct(productId);
    }
}
