package com.example.stock_management.service;

import com.example.stock_management.dto.PaymentStatus;
import com.example.stock_management.dto.ProductDashboardDTO;
import com.example.stock_management.dto.ProductDashboardResponseDTO;
import com.example.stock_management.model.Purchase;
import com.example.stock_management.model.Sale;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.PurchaseRepository;
import com.example.stock_management.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductDashboardService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private BillService billService;

    @CacheEvict(value = "dashboard-products", allEntries = true)
    public List<ProductDashboardResponseDTO> getProductsDashboardData() {
        List<ProductDashboardDTO> projections = productRepository.findProductsDashboardData();
        if (projections.isEmpty()) return List.of();

        Set<Long> productIds = projections.stream()
                .map(ProductDashboardDTO::getProductId)
                .collect(Collectors.toSet());

        Map<Long, List<Purchase>> purchasesByProduct = purchaseRepository
                .findAllByProductIds(productIds)
                .stream()
                .collect(Collectors.groupingBy(p -> p.getProduct().getIdProduct()));

        Map<Long, List<Sale>> salesByProduct = saleRepository
                .findAllByProductIds(productIds)
                .stream()
                .collect(Collectors.groupingBy(s -> s.getProduct().getIdProduct()));

        Set<Long> invoiceIds = salesByProduct.values().stream()
                .flatMap(Collection::stream)
                .map(Sale::getInvoiceNumber)
                .filter(n -> n != null && !n.trim().isEmpty())
                .map(n -> {
                    try { return Long.valueOf(n.trim()); }
                    catch (NumberFormatException e) { return null; }
                })
                .filter(n -> n != null)
                .collect(Collectors.toSet());

        Map<Long, PaymentStatus> billStatuses = billService.getStatusesByInvoiceNumbers(invoiceIds);

        return projections.stream()
                .map(p -> toResponseDTO(p, purchasesByProduct, salesByProduct, billStatuses))
                .collect(Collectors.toList());
    }

    private ProductDashboardResponseDTO toResponseDTO(
            ProductDashboardDTO p,
            Map<Long, List<Purchase>> purchasesByProduct,
            Map<Long, List<Sale>> salesByProduct,
            Map<Long, PaymentStatus> billStatuses) {

        List<ProductDashboardResponseDTO.PurchaseItem> purchaseItems =
                purchasesByProduct.getOrDefault(p.getProductId(), List.of()).stream()
                        .map(pur -> new ProductDashboardResponseDTO.PurchaseItem(
                                pur.getId(),
                                pur.getDatePurchase(),
                                pur.getSupplier() != null ? pur.getSupplier().getName() : null,
                                pur.getQuantity(),
                                pur.getUnitPriceTTC(),
                                pur.getTotalAmountTTC(),
                                pur.getInvoiceNumber()
                        ))
                        .collect(Collectors.toList());

        List<ProductDashboardResponseDTO.SaleItem> saleItems =
                salesByProduct.getOrDefault(p.getProductId(), List.of()).stream()
                        .map(sale -> new ProductDashboardResponseDTO.SaleItem(
                                sale.getId(),
                                sale.getDateSale(),
                                sale.getCustomer() != null ? sale.getCustomer().getName() : null,
                                sale.getQuantitySold(),
                                sale.getUnitSalePrice(),
                                sale.getTotalSaleAmount(),
                                sale.getInvoiceNumber(),
                                sale.getDeliveryNoteNumber(),
                                resolvePaymentStatus(sale.getInvoiceNumber(), billStatuses)
                        ))
                        .collect(Collectors.toList());

        return new ProductDashboardResponseDTO(
                new ProductDashboardResponseDTO.ProductSummary(
                        p.getProductId(),
                        p.getReference(),
                        p.getName(),
                        p.getCategory(),
                        p.getUnit(),
                        p.getUnitPriceSold(),
                        p.getCurrentStockQuantity()
                ),
                new ProductDashboardResponseDTO.Statistics(
                        p.getAveragePurchasePrice(),
                        p.getAverageSalePrice(),
                        p.getBilan()
                ),
                purchaseItems,
                saleItems
        );
    }

    private String resolvePaymentStatus(String invoiceNumber, Map<Long, PaymentStatus> billStatuses) {
        if (invoiceNumber == null || invoiceNumber.trim().isEmpty()) {
            return "SANS FACTURE";
        }
        try {
            Long invoiceId = Long.valueOf(invoiceNumber.trim());
            return billStatuses.getOrDefault(invoiceId, PaymentStatus.GIFT).name();
        } catch (NumberFormatException e) {
            return "SANS FACTURE";
        }
    }

    // ── Invalidation du cache sur toute écriture ──────────────────────────────
    @CacheEvict(value = "dashboard-products", allEntries = true)
    public void onDataChanged() { /* appelé après createPurchase, createSale, etc. */ }


}