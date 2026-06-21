package com.example.stock_management.service;

import com.example.stock_management.dto.SaleDTO;
import com.example.stock_management.model.BillProduct;
import com.example.stock_management.model.Sale;
import com.example.stock_management.model.Product;
import com.example.stock_management.repository.BillProductRepository;
import com.example.stock_management.repository.SaleRepository;
import com.example.stock_management.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class SaleService {
    @Autowired
    private com.example.stock_management.repository.CustomerRepository customerRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BillProductRepository billProductRepository;

    @Autowired
    private ProductDashboardService productDashboardService;

    /**
     * Créer une nouvelle vente et générer automatiquement une sortie de stock
     */
    @Transactional
    public Sale createSale(SaleDTO saleDTO) throws Exception {


        // Valider le produit existe
        Product product = productRepository.findById(saleDTO.getProductId())
            .orElseThrow(() -> new Exception("Produit non trouvé avec l'ID : " + saleDTO.getProductId()));

        // Valider le client existe
        com.example.stock_management.model.Customer customer = null;
        if (saleDTO.getCustomerName() != null && !saleDTO.getCustomerName().isEmpty()) {
            List<com.example.stock_management.model.Customer> customers = customerRepository.findAll();
            customer = customers.stream()
                .filter(c -> c.getName() != null && c.getName().equalsIgnoreCase(saleDTO.getCustomerName()))
                .findFirst()
                .orElse(null);
            if (customer == null) {
                throw new Exception("Client non trouvé : " + saleDTO.getCustomerName());
            }
        }

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
        if (customer != null) sale.setCustomer(customer);
        sale.setQuantitySold(saleDTO.getQuantitySold());
        sale.setUnitSalePrice(saleDTO.getUnitSalePrice());
        sale.setTotalSaleAmount(saleDTO.getQuantitySold() * saleDTO.getUnitSalePrice());
        sale.setInvoiceNumber(saleDTO.getInvoiceNumber());
        sale.setDeliveryNoteNumber(saleDTO.getDeliveryNoteNumber());

        // Sauvegarder la vente
        Sale savedSale = saleRepository.save(sale);


        // Mettre à jour le stock du produit
        updateProductStock(product, saleDTO.getQuantitySold(), false);

        productDashboardService.onDataChanged();   // vide le cache
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
        dto.setProductName(sale.getProduct().getName());
        dto.setProductDesignation(sale.getProduct().getDesignation());
        dto.setCustomerName(sale.getCustomer() != null ? sale.getCustomer().getName() : null);
        dto.setQuantitySold(sale.getQuantitySold());
        dto.setUnitSalePrice(sale.getUnitSalePrice());
        dto.setTotalSaleAmount(sale.getTotalSaleAmount());
        dto.setInvoiceNumber(sale.getInvoiceNumber());
        dto.setDeliveryNoteNumber(sale.getDeliveryNoteNumber());
        return dto;
    }

    /**
     * Convertir une liste d'entités Sale en liste de DTOs
     */
    public List<SaleDTO> convertToDTO(List<Sale> sales) {
        return sales.stream()
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());
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
     * Retourne toutes les ventes (directes + issues des factures) sous forme de SaleDTO.
     * Utilisé par le dashboard pour les graphiques.
     */
    public List<SaleDTO> getAllSalesCombined() {
        List<SaleDTO> result = new ArrayList<>(convertToDTO(saleRepository.findAll()));

        billProductRepository.findAllWithBillAndProduct().stream()
            .filter(bp -> bp.getBill() != null && bp.getProduct() != null)
            .map(bp -> {
                SaleDTO dto = new SaleDTO();
                dto.setId(bp.getId());
                dto.setDateSale(bp.getBill().getDateBill() != null
                        ? bp.getBill().getDateBill().toLocalDate() : null);
                dto.setProductId(bp.getProduct().getIdProduct());
                dto.setProductName(bp.getProduct().getName());
                dto.setProductDesignation(bp.getProduct().getDesignation());
                dto.setCustomerName(bp.getBill().getCustomer() != null
                        ? bp.getBill().getCustomer().getName() : null);
                dto.setQuantitySold(bp.getQuantity());
                double unitPrice = (bp.getQuantity() != null && bp.getQuantity() > 0)
                        ? bp.getTotalProductPrice() / bp.getQuantity() : 0.0;
                dto.setUnitSalePrice(unitPrice);
                dto.setTotalSaleAmount(bp.getTotalProductPrice());
                dto.setInvoiceNumber(String.valueOf(bp.getBill().getIdBill()));
                return dto;
            })
            .forEach(result::add);

        result.sort(Comparator.comparing(SaleDTO::getDateSale,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return result;
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
