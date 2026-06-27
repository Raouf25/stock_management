package com.example.stock_management.service;

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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
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

        List<Purchase> rawPurchases = purchasesByProduct.getOrDefault(p.getProductId(), List.of());

        List<ProductDashboardResponseDTO.PurchaseItem> purchaseItems =
                rawPurchases.stream()
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

        // Weighted average purchase price — computed in Java to avoid JPQL type issues
        // (HQL BigDecimal / Long division and NULL totalAmountTTC on legacy rows)
        BigDecimal totalPurchaseAmount = rawPurchases.stream()
                .filter(pur -> pur.getUnitPriceTTC() != null && pur.getQuantity() != null)
                .map(pur -> pur.getUnitPriceTTC().multiply(BigDecimal.valueOf(pur.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalPurchaseQty = rawPurchases.stream()
                .filter(pur -> pur.getQuantity() != null)
                .mapToInt(Purchase::getQuantity)
                .sum();
        BigDecimal avgPurchasePrice = totalPurchaseQty > 0
                ? totalPurchaseAmount.divide(BigDecimal.valueOf(totalPurchaseQty), 3, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

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

        billProductsByProduct.getOrDefault(p.getProductId(), List.of()).stream()
                .filter(bp -> bp.getBill() != null)
                .map(bp -> {
                    String paymentStatus = bp.getBill().getPaymentStatus() != null
                            ? bp.getBill().getPaymentStatus().name() : "INCONNU";
                    BigDecimal unitPrice = (bp.getQuantity() != null && bp.getQuantity() > 0
                            && bp.getTotalProductPrice() != null)
                        ? bp.getTotalProductPrice().divide(BigDecimal.valueOf(bp.getQuantity()), 3, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
                    return new ProductDashboardResponseDTO.SaleItem(
                            bp.getId(),
                            bp.getBill().getDateBill() != null ? bp.getBill().getDateBill().toLocalDate() : null,
                            bp.getBill().getCustomer() != null ? bp.getBill().getCustomer().getName() : null,
                            bp.getQuantity(),
                            unitPrice,
                            bp.getTotalProductPrice(),
                            String.valueOf(bp.getBill().getIdBill()),
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
                        avgPurchasePrice,
                        p.getAverageSalePrice(),
                        p.getBilan()
                ),
                purchaseItems,
                saleItems
        );
    }

    // Called after every write — evicts the Spring cache AND refreshes the materialized view
    @CacheEvict(value = "dashboard-products", allEntries = true)
    public void onDataChanged() {
        productRepository.refreshDashboardView();
    }
}
