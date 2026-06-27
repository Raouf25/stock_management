package com.example.stock_management.service;

import com.example.stock_management.dto.PurchaseDTO;
import com.example.stock_management.model.Product;
import com.example.stock_management.model.Purchase;
import com.example.stock_management.model.Supplier;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.PurchaseRepository;
import com.example.stock_management.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseServiceTest {

    @Mock private PurchaseRepository purchaseRepository;
    @Mock private ProductRepository productRepository;
    @Mock private SupplierRepository supplierRepository;
    @Mock private ProductDashboardService productDashboardService;

    @InjectMocks
    private PurchaseService purchaseService;

    private Supplier supplier;
    private Product product;

    @BeforeEach
    void setUp() {
        supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("VALDECO");

        product = new Product();
        product.setIdProduct(10L);
        product.setName("CHAUX ANTIK");
        product.setCurrentStockQuantity(20);
        product.setCurrentStockValue(new BigDecimal("200.000"));
        product.setCmp(new BigDecimal("10.000"));
    }

    @Test
    void createPurchase_incrementsStockQuantity() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(purchaseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        purchaseService.createPurchase(buildDto(10L, 5, "20.000"));

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(saved.capture());
        assertThat(saved.getValue().getCurrentStockQuantity()).isEqualTo(25); // 20 + 5
    }

    @Test
    void createPurchase_recalculatesCmpAsWeightedAverage() {
        // Existing stock: 20 units @ CMP 10.000 → value 200.000
        // New purchase:    5 units @ 20.000       → added value 100.000
        // Expected CMP = 300.000 / 25 = 12.000
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(purchaseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        purchaseService.createPurchase(buildDto(10L, 5, "20.000"));

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(saved.capture());
        assertThat(saved.getValue().getCmp()).isEqualByComparingTo("12.000");
        assertThat(saved.getValue().getCurrentStockValue()).isEqualByComparingTo("300.000");
    }

    @Test
    void createPurchase_withZeroInitialStock_setCmpToUnitPrice() {
        product.setCurrentStockQuantity(0);
        product.setCurrentStockValue(BigDecimal.ZERO);
        product.setCmp(BigDecimal.ZERO);

        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(purchaseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        purchaseService.createPurchase(buildDto(10L, 10, "15.500"));

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(saved.capture());
        assertThat(saved.getValue().getCmp()).isEqualByComparingTo("15.500");
        assertThat(saved.getValue().getCurrentStockQuantity()).isEqualTo(10);
    }

    @Test
    void createPurchase_withUnknownSupplier_throwsIllegalArgument() {
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

        PurchaseDTO dto = buildDto(10L, 5, "20.000");
        dto.setSupplierId(99L);

        assertThatThrownBy(() -> purchaseService.createPurchase(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    @Test
    void createPurchase_withUnknownProduct_throwsIllegalArgument() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        PurchaseDTO dto = buildDto(999L, 5, "20.000");

        assertThatThrownBy(() -> purchaseService.createPurchase(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("999");
    }

    @Test
    void createPurchase_savesOnePurchasePerLine() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(purchaseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        List<Purchase> result = purchaseService.createPurchase(buildDto(10L, 3, "18.000"));

        assertThat(result).hasSize(1);
        verify(purchaseRepository, times(1)).save(any(Purchase.class));
    }

    @Test
    void createPurchase_computesTotalAmountTTC() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(purchaseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        purchaseService.createPurchase(buildDto(10L, 4, "25.000"));

        ArgumentCaptor<Purchase> saved = ArgumentCaptor.forClass(Purchase.class);
        verify(purchaseRepository).save(saved.capture());
        assertThat(saved.getValue().getTotalAmountTTC()).isEqualByComparingTo("100.000");
    }

    @Test
    void createPurchase_notifiesDashboardCache() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(purchaseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        purchaseService.createPurchase(buildDto(10L, 1, "10.000"));

        verify(productDashboardService).onDataChanged();
    }

    private PurchaseDTO buildDto(Long productId, int quantity, String unitPrice) {
        PurchaseDTO dto = new PurchaseDTO();
        dto.setSupplierId(1L);
        dto.setDatePurchase(LocalDate.of(2026, 6, 27));
        dto.setInvoiceNumber("BL-TEST-001");

        PurchaseDTO.PurchaseLineDTO line = new PurchaseDTO.PurchaseLineDTO();
        line.setProductId(productId);
        line.setQuantity(quantity);
        line.setUnitPriceTTC(new BigDecimal(unitPrice));
        dto.setLines(List.of(line));
        return dto;
    }
}
