package com.example.stock_management.service;

import com.example.stock_management.dto.SaleDTO;
import com.example.stock_management.model.Customer;
import com.example.stock_management.model.Product;
import com.example.stock_management.model.Sale;
import com.example.stock_management.repository.BillProductRepository;
import com.example.stock_management.repository.CustomerRepository;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.SaleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SaleServiceTest {

    @Mock private SaleRepository saleRepository;
    @Mock private ProductRepository productRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private BillProductRepository billProductRepository;
    @Mock private ProductDashboardService productDashboardService;

    @InjectMocks
    private SaleService saleService;

    private Product product;
    private Customer customer;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setIdProduct(1L);
        product.setName("CHAUX ANTIK");
        product.setCurrentStockQuantity(50);
        product.setCurrentStockValue(new BigDecimal("500.000"));
        product.setCmp(new BigDecimal("10.000"));

        customer = new Customer();
        customer.setCustomerId(5L);
        customer.setName("Devis Travaux Express");
    }

    @Test
    void createSale_withInsufficientStock_throwsException() {
        product.setCurrentStockQuantity(3);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(customerRepository.findByNameIgnoreCase("Devis Travaux Express")).thenReturn(Optional.of(customer));

        SaleDTO dto = buildDto(5, "18.260");

        assertThatThrownBy(() -> saleService.createSale(dto))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("insuffisante")
                .hasMessageContaining("3");
    }

    @Test
    void createSale_withNullStock_throwsException() {
        product.setCurrentStockQuantity(null);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(customerRepository.findByNameIgnoreCase("Devis Travaux Express")).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> saleService.createSale(buildDto(1, "10.000")))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("insuffisante");
    }

    @Test
    void createSale_decrementsStockQuantity() throws Exception {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(customerRepository.findByNameIgnoreCase("Devis Travaux Express")).thenReturn(Optional.of(customer));
        when(saleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        saleService.createSale(buildDto(6, "18.260"));

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(saved.capture());
        assertThat(saved.getValue().getCurrentStockQuantity()).isEqualTo(44); // 50 - 6
    }

    @Test
    void createSale_decrementsStockValueByCmp() throws Exception {
        // stock: 50 units @ CMP 10.000 = value 500.000
        // sell 10 units → deducted = 10 * 10.000 = 100.000 → remaining = 400.000
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(customerRepository.findByNameIgnoreCase("Devis Travaux Express")).thenReturn(Optional.of(customer));
        when(saleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        saleService.createSale(buildDto(10, "15.000"));

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(saved.capture());
        assertThat(saved.getValue().getCurrentStockValue()).isEqualByComparingTo("400.000");
    }

    @Test
    void createSale_cmpRemainsStableAfterSale() throws Exception {
        // CMP should stay at 10.000 after a sale (sale price doesn't affect CMP)
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(customerRepository.findByNameIgnoreCase("Devis Travaux Express")).thenReturn(Optional.of(customer));
        when(saleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        saleService.createSale(buildDto(10, "25.000")); // high sale price should not change CMP

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(saved.capture());
        assertThat(saved.getValue().getCmp()).isEqualByComparingTo("10.000");
    }

    @Test
    void createSale_computesTotalSaleAmount() throws Exception {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(customerRepository.findByNameIgnoreCase("Devis Travaux Express")).thenReturn(Optional.of(customer));
        when(saleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        saleService.createSale(buildDto(6, "18.260"));

        ArgumentCaptor<Sale> saved = ArgumentCaptor.forClass(Sale.class);
        verify(saleRepository).save(saved.capture());
        assertThat(saved.getValue().getTotalSaleAmount()).isEqualByComparingTo("109.560");
    }

    @Test
    void createSale_withUnknownProduct_throwsException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        SaleDTO dto = buildDto(1, "10.000");
        dto.setProductId(999L);

        assertThatThrownBy(() -> saleService.createSale(dto))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("999");
    }

    @Test
    void createSale_withUnknownCustomerName_throwsException() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(customerRepository.findByNameIgnoreCase("Client Inexistant")).thenReturn(Optional.empty());

        SaleDTO dto = buildDto(1, "10.000");
        dto.setCustomerName("Client Inexistant");

        assertThatThrownBy(() -> saleService.createSale(dto))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("Client non trouv");
    }

    @Test
    void createSale_sellsEntireStock_setsQuantityToZero() throws Exception {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(customerRepository.findByNameIgnoreCase("Devis Travaux Express")).thenReturn(Optional.of(customer));
        when(saleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        saleService.createSale(buildDto(50, "10.000")); // sell everything

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(saved.capture());
        assertThat(saved.getValue().getCurrentStockQuantity()).isZero();
        assertThat(saved.getValue().getCmp()).isEqualByComparingTo("0.000");
    }

    @Test
    void createSale_notifiesDashboardCache() throws Exception {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(customerRepository.findByNameIgnoreCase("Devis Travaux Express")).thenReturn(Optional.of(customer));
        when(saleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        saleService.createSale(buildDto(1, "10.000"));

        verify(productDashboardService).onDataChanged();
    }

    private SaleDTO buildDto(int quantity, String unitPrice) {
        SaleDTO dto = new SaleDTO();
        dto.setProductId(1L);
        dto.setCustomerName("Devis Travaux Express");
        dto.setQuantitySold(quantity);
        dto.setUnitSalePrice(new BigDecimal(unitPrice));
        dto.setDateSale(LocalDate.of(2026, 6, 27));
        return dto;
    }
}
