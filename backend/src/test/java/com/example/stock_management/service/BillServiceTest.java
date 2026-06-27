package com.example.stock_management.service;

import com.example.stock_management.dto.InvoiceCreationDTO;
import com.example.stock_management.dto.PaymentStatus;
import com.example.stock_management.model.Bill;
import com.example.stock_management.model.Customer;
import com.example.stock_management.model.Product;
import com.example.stock_management.repository.BillRepository;
import com.example.stock_management.repository.CustomerRepository;
import com.example.stock_management.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillServiceTest {

    @Mock private BillRepository billRepository;
    @Mock private ProductRepository productRepository;
    @Mock private CustomerRepository customerRepository;

    // Fixed clock so date assertions are deterministic
    private final Clock clock = Clock.fixed(
            Instant.parse("2026-06-27T10:00:00Z"),
            ZoneId.of("UTC")
    );

    @InjectMocks
    private BillService billService;

    // BillService uses constructor injection — re-create with fixed clock
    @BeforeEach
    void injectClock() {
        billService = new BillService(billRepository, productRepository, customerRepository, clock);
    }

    private Customer customer;
    private Product product;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setCustomerId(5L);
        customer.setName("Devis Travaux Express");

        product = new Product();
        product.setIdProduct(1L);
        product.setName("CHAUX ANTIK");
        product.setCurrentStockQuantity(100);
        product.setUnitPrice(new BigDecimal("18.260"));
    }

    // ── TVA ───────────────────────────────────────────────────────────────────

    @Test
    void createInvoice_withTva_applies19PercentTax() {
        when(customerRepository.findById(5L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(billRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Bill bill = billService.createInvoice(buildDto(6, "18.260", true, BigDecimal.ZERO));

        // HT = 6 × 18.260 = 109.560 → TTC = 109.560 × 1.19 = 130.376 (rounded to 3 dp)
        assertThat(bill.getTotal()).isEqualByComparingTo("130.376");
        assertThat(bill.getApplyTva()).isTrue();
    }

    @Test
    void createInvoice_withoutTva_totalEqualsHT() {
        when(customerRepository.findById(5L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(billRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Bill bill = billService.createInvoice(buildDto(6, "18.260", false, BigDecimal.ZERO));

        assertThat(bill.getTotal()).isEqualByComparingTo("109.560");
        assertThat(bill.getApplyTva()).isFalse();
    }

    // ── Statut de paiement ───────────────────────────────────────────────────

    @Test
    void createInvoice_withNoDeposit_setsUnpaid() {
        when(customerRepository.findById(5L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(billRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Bill bill = billService.createInvoice(buildDto(1, "100.000", false, BigDecimal.ZERO));

        assertThat(bill.getPaymentStatus()).isEqualTo(PaymentStatus.UNPAID);
        assertThat(bill.getAmountDue()).isEqualByComparingTo("100.000");
    }

    @Test
    void createInvoice_withPartialDeposit_setsPartiallyPaid() {
        when(customerRepository.findById(5L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(billRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Bill bill = billService.createInvoice(buildDto(1, "100.000", false, new BigDecimal("40.000")));

        assertThat(bill.getPaymentStatus()).isEqualTo(PaymentStatus.PARTIALLY_PAID);
        assertThat(bill.getAmountDue()).isEqualByComparingTo("60.000");
    }

    @Test
    void createInvoice_withFullDeposit_setsPaid() {
        when(customerRepository.findById(5L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(billRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Bill bill = billService.createInvoice(buildDto(1, "100.000", false, new BigDecimal("100.000")));

        assertThat(bill.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(bill.getAmountDue()).isEqualByComparingTo("0.000");
    }

    @Test
    void createInvoice_depositExceedsTotal_amountDueIsZeroNotNegative() {
        when(customerRepository.findById(5L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(billRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Bill bill = billService.createInvoice(buildDto(1, "50.000", false, new BigDecimal("200.000")));

        assertThat(bill.getAmountDue()).isEqualByComparingTo("0.000");
        assertThat(bill.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    void createInvoice_withUnknownCustomer_throwsRuntimeException() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        InvoiceCreationDTO dto = buildDto(1, "10.000", false, BigDecimal.ZERO);
        dto.setCustomerId(99L);

        assertThatThrownBy(() -> billService.createInvoice(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("99");
    }

    // ── Paiement ────────────────────────────────────────────────────────────

    @Test
    void registerPayment_marksBillAsPaid() {
        Bill bill = new Bill();
        bill.setIdBill(13L);
        bill.setPaymentStatus(PaymentStatus.UNPAID);
        bill.setAmountDue(new BigDecimal("130.376"));
        when(billRepository.findById(13L)).thenReturn(Optional.of(bill));
        when(billRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Bill result = billService.registerPayment(13L);

        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(result.getAmountDue()).isEqualByComparingTo("0.000");
    }

    @Test
    void registerPayment_alreadyPaid_throwsRuntimeException() {
        Bill bill = new Bill();
        bill.setIdBill(13L);
        bill.setPaymentStatus(PaymentStatus.PAID);
        bill.setAmountDue(BigDecimal.ZERO);
        when(billRepository.findById(13L)).thenReturn(Optional.of(bill));

        assertThatThrownBy(() -> billService.registerPayment(13L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("déjà");
    }

    @Test
    void registerPayment_withUnknownId_throwsRuntimeException() {
        when(billRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> billService.registerPayment(999L))
                .isInstanceOf(RuntimeException.class);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private InvoiceCreationDTO buildDto(int quantity, String unitPrice, boolean applyTva, BigDecimal deposit) {
        InvoiceCreationDTO.InvoiceLineItemDTO line = InvoiceCreationDTO.InvoiceLineItemDTO.builder()
                .productId(1L)
                .quantity(quantity)
                .unitPrice(new BigDecimal(unitPrice))
                .discount(BigDecimal.ZERO)
                .build();

        return InvoiceCreationDTO.builder()
                .customerId(5L)
                .billDate(LocalDate.of(2026, 6, 27))
                .paymentTerms("30 jours")
                .applyTva(applyTva)
                .deposit(deposit)
                .products(List.of(line))
                .build();
    }
}
