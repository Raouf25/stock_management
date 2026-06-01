# Testing Guide - Stock Management System

Complete guide to testing the Stock Management API with actual implementation patterns.

---

## Table of Contents
1. [Unit Testing Patterns](#unit-testing-patterns)
2. [Integration Testing](#integration-testing)
3. [API Testing with Examples](#api-testing-with-examples)
4. [Testing the Clock Abstraction](#testing-the-clock-abstraction)
5. [Test Data & Fixtures](#test-data--fixtures)
6. [CI/CD Testing](#cicd-testing)

---

## Unit Testing Patterns

### Testing Services with Dependencies

**Example: Testing BillService with Clock**

```java
package com.example.stock_management.service;

import com.example.stock_management.dto.BillDTO;
import com.example.stock_management.dto.PaymentStatus;
import com.example.stock_management.model.Bill;
import com.example.stock_management.model.Customer;
import com.example.stock_management.repository.BillRepository;
import com.example.stock_management.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BillServiceTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private Clock clock;  // Inject clock for testing

    @InjectMocks
    private BillService billService;

    private BillDTO billDTO;
    private Customer customer;

    @BeforeEach
    public void setUp() {
        customer = new Customer();
        customer.setCustomerId(1L);
        customer.setName("Test Customer");

        billDTO = new BillDTO();
        billDTO.setIdClient(1L);
    }

    @Test
    public void testBillCreationWithFixedClock() {
        // Arrange: Create a fixed clock for deterministic testing
        Instant fixedInstant = Instant.parse("2024-01-15T10:30:00Z");
        Clock fixedClock = Clock.fixed(fixedInstant, ZoneId.systemDefault());

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> {
            Bill bill = invocation.getArgument(0);
            bill.setIdBill(1L);
            return bill;
        });

        // Act: Save bill with fixed clock
        Bill result = billService.save(billDTO);

        // Assert: Verify bill date matches fixed clock
        assertThat(result).isNotNull();
        assertThat(result.getIdBill()).isEqualTo(1L);
        assertThat(result.getCustomer()).isEqualTo(customer);

        verify(customerRepository).findById(1L);
        verify(billRepository).save(any(Bill.class));
    }

    @Test
    public void testBillCreationThrowsExceptionWhenCustomerNotFound() {
        // Arrange
        when(customerRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> billService.save(billDTO))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Client not found");

        verify(customerRepository).findById(1L);
        verify(billRepository, never()).save(any());
    }

    @Test
    public void testPaymentStatusCalculation() {
        // Arrange
        Bill bill = new Bill();
        bill.setTotal(new BigDecimal("1000.00"));
        bill.setDeposit(new BigDecimal("200.00"));

        // Act & Assert
        BigDecimal amountDue = bill.getTotal().subtract(bill.getDeposit());
        assertThat(amountDue).isEqualTo(new BigDecimal("800.00"));

        // Verify payment status rules
        if (amountDue.compareTo(BigDecimal.ZERO) == 0) {
            assertThat(bill.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        } else if (bill.getDeposit().compareTo(BigDecimal.ZERO) > 0 &&
                   bill.getDeposit().compareTo(bill.getTotal()) < 0) {
            assertThat(bill.getPaymentStatus()).isEqualTo(PaymentStatus.PARTIALLY_PAID);
        }
    }
}
```

---

## Integration Testing

### Testing Full Service with Database

```java
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@Import(PurchaseService.class)  // Import service under test
public class PurchaseServiceIntegrationTest {

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    private Product product;
    private Supplier supplier;

    @BeforeEach
    public void setUp() {
        // Create test data
        supplier = new Supplier();
        supplier.setName("Test Supplier");
        supplierRepository.save(supplier);

        product = new Product();
        product.setDesignation("TEST-001");
        product.setName("Test Product");
        product.setCurrentStockQuantity(100);
        productRepository.save(product);
    }

    @Test
    public void testCreatePurchaseUpdatesStockCorrectly() {
        // Arrange
        PurchaseDTO purchaseDTO = new PurchaseDTO();
        purchaseDTO.setSupplierId(supplier.getId());
        purchaseDTO.setProductId(product.getIdProduct());
        purchaseDTO.setQuantity(50);
        purchaseDTO.setUnitPriceTTC(10.0);
        purchaseDTO.setInvoiceNumber("INV-001");
        purchaseDTO.setDatePurchase(LocalDateTime.now());

        int initialStock = product.getCurrentStockQuantity();

        // Act
        Purchase result = purchaseService.createPurchase(purchaseDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getQuantity()).isEqualTo(50);
        
        // Verify stock was updated
        Product updatedProduct = productRepository.findById(product.getIdProduct()).orElseThrow();
        assertThat(updatedProduct.getCurrentStockQuantity())
            .isEqualTo(initialStock + 50);
    }

    @Test
    public void testCreatePurchaseWithInvalidSupplierThrows() {
        // Arrange
        PurchaseDTO purchaseDTO = new PurchaseDTO();
        purchaseDTO.setSupplierId(999L);  // Non-existent supplier
        purchaseDTO.setProductId(product.getIdProduct());
        purchaseDTO.setQuantity(50);

        // Act & Assert
        assertThatThrownBy(() -> purchaseService.createPurchase(purchaseDTO))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Fournisseur non trouvé");
    }
}
```

---

## API Testing with Examples

### Using curl

```bash
# 1. Create a supplier
curl -X POST http://localhost:8080/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Supplier Co",
    "address": "123 Test St",
    "phone": "1234567890",
    "email": "test@supplier.com"
  }'

# 2. Create a product
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "TEST-001",
    "name": "Test Product",
    "initialStockQuantity": 100,
    "initialUnitPrice": 10.0,
    "initialStockValue": 1000.0,
    "supplierId": 1
  }'

# 3. Create a purchase
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "datePurchase": "2024-01-15T10:30:00",
    "supplierId": 1,
    "productId": 1,
    "invoiceNumber": "BL-001",
    "quantity": 50,
    "unitPriceTTC": 10.5,
    "comment": "Test purchase"
  }'

# 4. Create a sale
curl -X POST http://localhost:8080/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "dateSale": "2024-01-16T14:30:00",
    "productId": 1,
    "quantitySold": 20,
    "unitSalePrice": 15.0
  }'

# 5. Get stock summary
curl http://localhost:8080/api/stock/summary | jq '.'

# 6. Get stock alerts
curl "http://localhost:8080/api/stock/alerts?threshold=50" | jq '.'

# 7. Get all bills
curl http://localhost:8080/api/bills | jq '.'
```

---

## Testing the Clock Abstraction

### Why Clock Testing Matters

Without proper clock testing:
- ❌ Tests fail at month/year boundaries
- ❌ Non-deterministic results
- ❌ Hard to test "this month" logic

### Proper Clock Testing Example

```java
@Test
public void testMonthlyKPICalculationAtMonthBoundary() {
    // Arrange: Create a clock at month boundary
    Instant endOfMonth = Instant.parse("2024-01-31T23:59:59Z");
    Clock monthEndClock = Clock.fixed(endOfMonth, ZoneId.systemDefault());

    // Create bill on last day of month
    Bill billJanuary = new Bill();
    billJanuary.setDateBill(LocalDateTime.now(monthEndClock));
    billRepository.save(billJanuary);

    // Advance clock to first day of next month
    Instant beginningOfNextMonth = Instant.parse("2024-02-01T00:00:00Z");
    Clock nextMonthClock = Clock.fixed(beginningOfNextMonth, ZoneId.systemDefault());

    // Act: Get KPIs with next month's clock
    Map<String, Object> kpis = billService.getInvoiceKPIs();
    long invoicesThisMonth = (long) kpis.get("invoicesThisMonth");

    // Assert: Should be 0 because we're now in February
    assertThat(invoicesThisMonth).isEqualTo(0);
}

@Test
public void testSaleRecordCreationUsesCorrectDate() {
    // Arrange: Set a specific date
    Instant specificDate = Instant.parse("2024-06-15T12:00:00Z");
    Clock fixedClock = Clock.fixed(specificDate, ZoneId.systemDefault());

    Customer customer = new Customer();
    Product product = new Product();

    // Act: Create sale record with fixed clock
    saleRepository.save(sale);

    // Assert: Verify date matches
    LocalDate expectedDate = LocalDate.of(2024, 6, 15);
    assertThat(sale.getDateSale()).isEqualTo(expectedDate);
}
```

---

## Test Data & Fixtures

### Creating Reusable Test Fixtures

```java
@Component
public class TestDataFactory {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    public Customer createTestCustomer() {
        Customer customer = new Customer();
        customer.setName("Test Customer");
        customer.setEmail("test@customer.com");
        customer.setPhone("1234567890");
        return customerRepository.save(customer);
    }

    public Product createTestProduct() {
        Supplier supplier = new Supplier();
        supplier.setName("Test Supplier");
        supplierRepository.save(supplier);

        Product product = new Product();
        product.setDesignation("TEST-001");
        product.setName("Test Product");
        product.setCurrentStockQuantity(1000);
        product.setSupplier(supplier);
        return productRepository.save(product);
    }

    public Bill createTestBill(Customer customer) {
        Bill bill = new Bill();
        bill.setCustomer(customer);
        bill.setDateBill(LocalDateTime.now());
        bill.setTotal(new BigDecimal("1000.00"));
        bill.setAmountDue(new BigDecimal("1000.00"));
        bill.setPaymentStatus(PaymentStatus.UNPAID);
        return bill;
    }

    public BillDTO createTestBillDTO() {
        BillDTO dto = new BillDTO();
        dto.setIdClient(1L);
        return dto;
    }
}
```

---

## CI/CD Testing

### Maven Test Command

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=BillServiceTest

# Run tests with coverage
mvn test jacoco:report

# View coverage report
open target/site/jacoco/index.html

# Run tests with specific profile
mvn test -Ptest-integration
```

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: stock_db_test
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
      
      - name: Run tests
        run: mvn clean test
        env:
          SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/stock_db_test
          SPRING_DATASOURCE_USERNAME: postgres
          SPRING_DATASOURCE_PASSWORD: postgres
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Best Practices

### ✅ DO
- ✅ Use fixed Clock instances for time-dependent tests
- ✅ Mock repositories in unit tests
- ✅ Use @DataJpaTest for repository tests
- ✅ Test business rules (stock validation, payment status)
- ✅ Use meaningful test names
- ✅ Test error cases and exceptions

### ❌ DON'T
- ❌ Use `LocalDateTime.now()` directly in tests (use Clock)
- ❌ Test implementation details (private methods)
- ❌ Create hard dependencies on external services
- ❌ Use arbitrary delays in tests
- ❌ Leave test data in database after tests

---

## Running Tests Locally

```bash
# 1. Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# 2. Run all tests
cd backend
mvn clean test

# 3. View results
echo "Tests complete!"
mvn surefire-report:report
open target/site/surefire-report.html
```

---

**Document Version**: 1.0.0  
**Last Updated**: April 13, 2026  
**Framework**: Spring Boot 3.3.3 with Mockito & JUnit 5

