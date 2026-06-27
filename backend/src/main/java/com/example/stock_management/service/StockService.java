package com.example.stock_management.service;

import com.example.stock_management.dto.StockSummaryDTO;
import com.example.stock_management.dto.StockAlertDTO;
import com.example.stock_management.model.Product;
import com.example.stock_management.repository.BillProductRepository;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.PurchaseRepository;
import com.example.stock_management.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class StockService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private BillProductRepository billProductRepository;

    public List<StockSummaryDTO> getGlobalStockSummary() {
        return productRepository.findAll().stream()
            .map(this::calculateProductSummary)
            .collect(Collectors.toList());
    }

    public StockSummaryDTO getProductStockSummary(Long productId) throws Exception {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new Exception("Produit non trouvé avec l'ID : " + productId));
        return calculateProductSummary(product);
    }

    private StockSummaryDTO calculateProductSummary(Product product) {
        StockSummaryDTO summary = new StockSummaryDTO();
        summary.setProductId(product.getIdProduct());
        summary.setProductDesignation(product.getDesignation() != null ? product.getDesignation() : product.getName());

        Integer initialQuantity = Objects.requireNonNullElse(product.getInitialStockQuantity(), 0);
        BigDecimal initialValue = Objects.requireNonNullElse(product.getInitialStockValue(), BigDecimal.ZERO);
        summary.setInitialQuantity(initialQuantity);
        summary.setInitialValue(initialValue);

        BigDecimal totalPurchasesAmount = purchaseRepository.findTotalPurchasesAmountByProduct(product.getIdProduct());
        summary.setTotalPurchasesAmount(totalPurchasesAmount);

        BigDecimal standaloneSalesAmount = saleRepository.findTotalSalesAmountByProduct(product.getIdProduct());
        BigDecimal billProductSalesAmount = billProductRepository.findTotalAmountByProduct(product.getIdProduct());
        BigDecimal totalSalesAmount = standaloneSalesAmount.add(billProductSalesAmount);
        summary.setTotalSalesAmount(totalSalesAmount);

        int purchasesQty = Objects.requireNonNullElse(purchaseRepository.findTotalPurchasesQuantityByProduct(product.getIdProduct()), 0);
        int standaloneSalesQty = Objects.requireNonNullElse(saleRepository.findTotalSalesQuantityByProduct(product.getIdProduct()), 0);
        int billProductSalesQty = Objects.requireNonNullElse(billProductRepository.findTotalQuantityByProduct(product.getIdProduct()), 0);

        Integer finalQuantity = initialQuantity + purchasesQty - standaloneSalesQty - billProductSalesQty;
        summary.setFinalQuantity(finalQuantity);

        BigDecimal finalStockValue = initialValue.add(totalPurchasesAmount).subtract(totalSalesAmount);
        summary.setFinalStockValue(finalStockValue);

        BigDecimal cmp = BigDecimal.ZERO;
        if (finalQuantity > 0) {
            cmp = finalStockValue.divide(BigDecimal.valueOf(finalQuantity), 3, RoundingMode.HALF_UP);
        }
        summary.setCmp(cmp);

        product.setCurrentStockQuantity(finalQuantity);
        product.setCurrentStockValue(finalStockValue);
        product.setCmp(cmp);
        productRepository.save(product);

        return summary;
    }

    public List<StockAlertDTO> getStockAlerts() {
        return getStockAlerts(10);
    }

    public List<StockAlertDTO> getStockAlerts(Integer threshold) {
        return productRepository.findAll().stream()
            .filter(product -> {
                Integer currentQuantity = Objects.requireNonNullElse(product.getCurrentStockQuantity(), 0);
                return currentQuantity <= threshold;
            })
            .map(product -> {
                StockAlertDTO alert = new StockAlertDTO();
                alert.setProductId(product.getIdProduct());
                alert.setProductDesignation(product.getDesignation() != null ? product.getDesignation() : product.getName());
                Integer currentQuantity = Objects.requireNonNullElse(product.getCurrentStockQuantity(), 0);
                alert.setCurrentQuantity(currentQuantity);
                alert.setThreshold(threshold);
                alert.setAlertLevel(currentQuantity <= 5 ? "CRITICAL" : "LOW");
                return alert;
            })
            .collect(Collectors.toList());
    }

    public BigDecimal getTotalStockValue() {
        return productRepository.findAll().stream()
            .map(p -> Objects.requireNonNullElse(p.getCurrentStockValue(), BigDecimal.ZERO))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void recalculateAllCmp() {
        productRepository.findAll().forEach(product -> {
            BigDecimal currentValue = Objects.requireNonNullElse(product.getCurrentStockValue(), BigDecimal.ZERO);
            Integer currentQuantity = Objects.requireNonNullElse(product.getCurrentStockQuantity(), 0);
            product.setCmp(currentQuantity > 0
                ? currentValue.divide(BigDecimal.valueOf(currentQuantity), 3, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);
            productRepository.save(product);
        });
    }

    public Map<String, Object> calculateGlobalTotals(List<StockSummaryDTO> summaries) {
        int totalInitialQuantity = summaries.stream().mapToInt(StockSummaryDTO::getInitialQuantity).sum();

        BigDecimal totalInitialValue = summaries.stream()
                .map(StockSummaryDTO::getInitialValue).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPurchasesAmount = summaries.stream()
                .map(StockSummaryDTO::getTotalPurchasesAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSalesAmount = summaries.stream()
                .map(StockSummaryDTO::getTotalSalesAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalFinalQuantity = summaries.stream().mapToInt(StockSummaryDTO::getFinalQuantity).sum();

        BigDecimal totalFinalStockValue = summaries.stream()
                .map(StockSummaryDTO::getFinalStockValue).reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "initialQuantity", totalInitialQuantity,
                "initialValue", totalInitialValue,
                "totalPurchasesAmount", totalPurchasesAmount,
                "totalSalesAmount", totalSalesAmount,
                "finalQuantity", totalFinalQuantity,
                "finalStockValue", totalFinalStockValue
        );
    }
}
