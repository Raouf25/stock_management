package com.example.stock_management.service;

import com.example.stock_management.dto.PaymentStatus;
import com.example.stock_management.dto.ProductDashboardDTO;
import com.example.stock_management.dto.ProductDashboardResponseDTO;
import com.example.stock_management.model.BillProduct;
import com.example.stock_management.model.Purchase;
import com.example.stock_management.model.Sale;
import com.example.stock_management.repository.BillProductRepository;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.PurchaseRepository;
import com.example.stock_management.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
    private BillProductRepository billProductRepository;

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

        Map<Long, List<BillProduct>> billProductsByProduct = billProductRepository
                .findAllWithBillByProductIds(productIds)
                .stream()
                .collect(Collectors.groupingBy(bp -> bp.getProduct().getIdProduct()));

        return projections.stream()
                .map(p -> toResponseDTO(p, purchasesByProduct, salesByProduct, billProductsByProduct))
                .collect(Collectors.toList());
    }

    private ProductDashboardResponseDTO toResponseDTO(
            ProductDashboardDTO p,
            Map<Long, List<Purchase>> purchasesByProduct,
            Map<Long, List<Sale>> salesByProduct,
            Map<Long, List<BillProduct>> billProductsByProduct) {

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

        // Standalone sales (not from a bill)
        List<ProductDashboardResponseDTO.SaleItem> saleItems = new ArrayList<>(
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
                                "SANS FACTURE"
                        ))
                        .collect(Collectors.toList())
        );

        // Bill-originated sales from bill_product
        billProductsByProduct.getOrDefault(p.getProductId(), List.of()).stream()
                .filter(bp -> bp.getBill() != null)
                .map(bp -> {
                    String invoiceNum = String.valueOf(bp.getBill().getIdBill());
                    String paymentStatus = bp.getBill().getPaymentStatus() != null
                            ? bp.getBill().getPaymentStatus().name() : "INCONNU";
                    double unitPrice = bp.getQuantity() != null && bp.getQuantity() > 0
                            ? bp.getTotalProductPrice() / bp.getQuantity() : 0.0;
                    return new ProductDashboardResponseDTO.SaleItem(
                            bp.getId(),
                            bp.getBill().getDateBill() != null ? bp.getBill().getDateBill().toLocalDate() : null,
                            bp.getBill().getCustomer() != null ? bp.getBill().getCustomer().getName() : null,
                            bp.getQuantity(),
                            unitPrice,
                            bp.getTotalProductPrice(),
                            invoiceNum,
                            null,
                            paymentStatus
                    );
                })
                .forEach(saleItems::add);

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

    // ── Invalidation du cache sur toute écriture ──────────────────────────────
    @CacheEvict(value = "dashboard-products", allEntries = true)
    public void onDataChanged() { /* appelé après createPurchase, createSale, etc. */ }


}