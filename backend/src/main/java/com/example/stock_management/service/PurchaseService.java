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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductDashboardService productDashboardService;

    @Transactional
    public List<Purchase> createPurchase(PurchaseDTO purchaseDTO) {
        Supplier supplier = supplierRepository.findById(purchaseDTO.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("Fournisseur non trouvé avec l'ID : " + purchaseDTO.getSupplierId()));

        LocalDate datePurchase = purchaseDTO.getDatePurchase() != null ? purchaseDTO.getDatePurchase() : LocalDate.now();
        List<Purchase> savedPurchases = new ArrayList<>();

        if (purchaseDTO.getLines() != null) {
            for (PurchaseDTO.PurchaseLineDTO line : purchaseDTO.getLines()) {
                Product product = productRepository.findById(line.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Produit non trouvé avec l'ID : " + line.getProductId()));

                Purchase purchase = new Purchase();
                purchase.setDatePurchase(datePurchase);
                purchase.setSupplier(supplier);
                purchase.setProduct(product);
                purchase.setInvoiceNumber(purchaseDTO.getInvoiceNumber());
                purchase.setComment(purchaseDTO.getComment());
                purchase.setQuantity(line.getQuantity());
                purchase.setUnitPriceTTC(line.getUnitPriceTTC());
                purchase.setTotalAmountTTC(
                    BigDecimal.valueOf(line.getQuantity()).multiply(line.getUnitPriceTTC())
                );

                savedPurchases.add(purchaseRepository.save(purchase));
                updateProductStock(product, line.getQuantity(), line.getUnitPriceTTC(), true);
            }
        }

        productDashboardService.onDataChanged();
        return savedPurchases;
    }

    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    public Optional<Purchase> getPurchaseById(Long id) {
        return purchaseRepository.findById(id);
    }

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

    public List<Purchase> getPurchasesByProduct(Long productId) {
        return purchaseRepository.findByProduct_IdProduct(productId);
    }

    public PurchaseDTO convertToDTO(Purchase purchase) {
        PurchaseDTO dto = new PurchaseDTO();
        dto.setId(purchase.getId());
        dto.setDatePurchase(purchase.getDatePurchase());
        dto.setSupplierId(purchase.getSupplier().getId());
        dto.setSupplierName(purchase.getSupplier().getName());
        dto.setInvoiceNumber(purchase.getInvoiceNumber());
        dto.setComment(purchase.getComment());

        dto.setQuantity(purchase.getQuantity());
        dto.setUnitPriceTTC(purchase.getUnitPriceTTC());
        dto.setTotalAmountTTC(purchase.getTotalAmountTTC());

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

    public List<PurchaseDTO> convertToDTO(List<Purchase> purchases) {
        return purchases.stream()
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    private void updateProductStock(Product product, Integer quantity, BigDecimal unitPrice, boolean isEntry) {
        BigDecimal currentValue = Objects.requireNonNullElse(product.getCurrentStockValue(), BigDecimal.ZERO);
        int        currentQty  = Objects.requireNonNullElse(product.getCurrentStockQuantity(), 0);

        if (isEntry) {
            int        newQty   = currentQty + quantity;
            BigDecimal newValue = currentValue.add(BigDecimal.valueOf(quantity).multiply(unitPrice));

            product.setCurrentStockQuantity(newQty);
            product.setCurrentStockValue(newValue);
            product.setCmp(newQty > 0
                ? newValue.divide(BigDecimal.valueOf(newQty), 3, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);
        } else {
            BigDecimal cmp      = Objects.requireNonNullElse(product.getCmp(), unitPrice);
            int        newQty   = Math.max(0, currentQty - quantity);
            BigDecimal newValue = currentValue.subtract(BigDecimal.valueOf(quantity).multiply(cmp)).max(BigDecimal.ZERO);

            product.setCurrentStockQuantity(newQty);
            product.setCurrentStockValue(newValue);
            product.setCmp(newQty > 0
                ? newValue.divide(BigDecimal.valueOf(newQty), 3, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);
        }

        productRepository.save(product);
    }

    public BigDecimal getTotalPurchasesAmount(Long productId) {
        return purchaseRepository.findTotalPurchasesAmountByProduct(productId);
    }

    public Integer getTotalPurchasesQuantity(Long productId) {
        return purchaseRepository.findTotalPurchasesQuantityByProduct(productId);
    }
}
