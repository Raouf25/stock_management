# Implementation Guide - Stock Management System

This document provides detailed implementation examples from the actual codebase showing how features are implemented.

## Table of Contents
1. [Architecture Layers](#architecture-layers)
2. [Controller Implementation](#controller-implementation)
3. [Service Layer Implementation](#service-layer-implementation)
4. [Error Handling](#error-handling)
5. [Clock Abstraction (Testability)](#clock-abstraction-testability)
6. [Transaction Management](#transaction-management)

---

## Architecture Layers

The application follows a **3-layer architecture**:

```
┌─────────────────────────────────────────────────┐
│  Controller Layer (HTTP Endpoints)              │
│  - PurchaseController                          │
│  - SaleController                              │
│  - BillController                              │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  Service Layer (Business Logic)                │
│  - PurchaseService                             │
│  - SaleService                                 │
│  - BillService                                 │
│  - StockService                                │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  Repository Layer (Data Access)                │
│  - PurchaseRepository (JPA)                    │
│  - SaleRepository (JPA)                        │
│  - ProductRepository (JPA)                     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  Database (PostgreSQL)                         │
└──────────────────────────────────────────────────┘
```

Each layer has a clear responsibility:
- **Controller**: HTTP request/response handling
- **Service**: Business logic and calculations
- **Repository**: Database queries and persistence

---

## Controller Implementation

### Example: PurchaseController

```java
package com.example.stock_management.api;

import com.example.stock_management.dto.PurchaseDTO;
import com.example.stock_management.model.Purchase;
import com.example.stock_management.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/purchases")
@Tag(name = "Purchase", description = "Gestion des achats")
@CrossOrigin(origins = "*")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    /**
     * Créer un nouvel achat
     * Endpoint: POST /api/purchases
     */
    @PostMapping
    @Operation(summary = "Créer un nouvel achat")
    public ResponseEntity<?> createPurchase(@RequestBody PurchaseDTO purchaseDTO) {
        try {
            Purchase purchase = purchaseService.createPurchase(purchaseDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(purchaseService.convertToDTO(purchase));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Erreur lors de la création de l'achat : " + e.getMessage());
        }
    }

    /**
     * Récupérer tous les achats
     * Endpoint: GET /api/purchases
     */
    @GetMapping
    @Operation(summary = "Récupérer tous les achats")
    public ResponseEntity<List<PurchaseDTO>> getAllPurchases() {
        List<Purchase> purchases = purchaseService.getAllPurchases();
        return ResponseEntity.ok(purchaseService.convertToDTO(purchases));
    }

    /**
     * Récupérer un achat par ID
     * Endpoint: GET /api/purchases/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un achat par ID")
    public ResponseEntity<?> getPurchaseById(@PathVariable Long id) {
        Optional<Purchase> purchase = purchaseService.getPurchaseById(id);
        if (purchase.isPresent()) {
            return ResponseEntity.ok(purchaseService.convertToDTO(purchase.get()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Achat non trouvé avec l'ID : " + id);
        }
    }
}
```

**Key Points:**
- Controllers handle only HTTP concerns (requests, responses, status codes)
- All business logic is delegated to services
- Error handling at controller level wraps service exceptions

---

## Service Layer Implementation

### Example: BillService with Clock

```java
package com.example.stock_management.service;

import com.example.stock_management.dto.BillDTO;
import com.example.stock_management.dto.InvoiceCreationDTO;
import com.example.stock_management.dto.PaymentStatus;
import com.example.stock_management.model.Bill;
import com.example.stock_management.model.BillProduct;
import com.example.stock_management.model.Customer;
import com.example.stock_management.model.Product;
import com.example.stock_management.model.Sale;
import com.example.stock_management.repository.BillRepository;
import com.example.stock_management.repository.CustomerRepository;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final Clock clock;  // Injected for testability

    /**
     * Save a bill with current timestamp from Clock
     * 
     * Key testability benefit:
     * - Clock is injected, so it can be mocked in tests
     * - Production code gets real clock via ClockConfig
     * - Tests can inject fixed clock for deterministic behavior
     */
    @Transactional
    public Bill save(BillDTO billDto) {
        // Verify customer exists
        Customer customer = customerRepository.findById(billDto.getIdClient())
            .orElseThrow(() -> new RuntimeException("Client not found with ID: " + billDto.getIdClient()));

        Bill bill = new Bill();
        bill.setCustomer(customer);

        // Use injected Clock instead of LocalDateTime.now()
        // This allows tests to control the current time
        bill.setDateBill(LocalDateTime.now(clock));

        // Initialize total
        BigDecimal runningTotal = BigDecimal.ZERO;

        // Process bill products
        List<BillProduct> billProducts = billDto.getProducts().stream()
            .map(billProductDTO -> {
                Product product = productRepository.findById(billProductDTO.getIdProduct())
                    .orElseThrow(() -> new RuntimeException(
                        "Product not found with ID: " + billProductDTO.getIdProduct()));

                BillProduct billProduct = new BillProduct();
                billProduct.setProduct(product);
                billProduct.setQuantity(billProductDTO.getQuantite());
                productRepository.updateStock(
                    billProductDTO.getIdProduct(), 
                    billProductDTO.getQuantite()
                );
                
                // Create sale record
                createSaleRecord(customer, product, billProductDTO.getQuantite(), 
                    billProductDTO.getPrixTotal() / billProductDTO.getQuantite());

                double productTotal = billProductDTO.getQuantite() * product.getUnitPriceBought();
                billProduct.setTotalProductPrice(productTotal);
                billProduct.setBill(bill);

                return billProduct;
            })
            .toList();

        // Calculate total from all products
        runningTotal = billProducts.stream()
            .map(bp -> BigDecimal.valueOf(bp.getTotalProductPrice()))
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(3, RoundingMode.HALF_UP);
        
        bill.setTotal(runningTotal);
        bill.setBillProducts(billProducts);

        // Calculate amount due
        BigDecimal deposit = bill.getDeposit() != null ? bill.getDeposit() : BigDecimal.ZERO;
        BigDecimal amountDue = bill.getTotal().subtract(deposit);
        if (amountDue.compareTo(BigDecimal.ZERO) < 0) {
            amountDue = BigDecimal.ZERO;
        }
        bill.setAmountDue(amountDue);

        // Set payment status based on amount due
        if (amountDue.compareTo(BigDecimal.ZERO) == 0) {
            bill.setPaymentStatus(PaymentStatus.PAID);
        } else if (deposit.compareTo(BigDecimal.ZERO) > 0 && 
                   deposit.compareTo(bill.getTotal()) < 0) {
            bill.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        } else {
            bill.setPaymentStatus(PaymentStatus.UNPAID);
        }

        return billRepository.save(bill);
    }

    /**
     * Get invoice KPIs for reporting
     * Uses Clock for "this month" calculations
     */
    public Map<String, Object> getInvoiceKPIs() {
        List<Bill> bills = billRepository.findAll();
        Map<String, Object> kpis = new HashMap<>();

        kpis.put("totalInvoices", bills.size());

        BigDecimal totalInvoiced = bills.stream()
            .map(Bill::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        kpis.put("totalInvoicedAmount", totalInvoiced);

        BigDecimal avgInvoice = bills.isEmpty() ? BigDecimal.ZERO : 
            totalInvoiced.divide(new BigDecimal(bills.size()), 3, RoundingMode.HALF_UP);
        kpis.put("averageInvoiceAmount", avgInvoice);

        // Get current date from injected Clock
        LocalDate now = LocalDate.now(clock);
        long invoicesThisMonth = bills.stream()
            .filter(b -> b.getDateBill() != null && 
                    b.getDateBill().getMonth() == now.getMonth() && 
                    b.getDateBill().getYear() == now.getYear())
            .count();
        kpis.put("invoicesThisMonth", invoicesThisMonth);

        return kpis;
    }

    /**
     * Create a sale record for tracking sales
     * Uses Clock for consistent date handling
     */
    private void createSaleRecord(Customer customer, Product product, 
                                  Integer quantity, Double unitPrice) {
        Sale sale = new Sale();
        sale.setDateSale(LocalDate.now(clock));  // Use injected Clock
        sale.setCustomer(customer);
        sale.setProduct(product);
        sale.setInvoiceNumber("INV-" + Instant.now(clock).toEpochMilli());
        sale.setQuantitySold(quantity);
        
        double salePrice = (unitPrice != null) ? unitPrice : product.getUnitPriceSold();
        sale.setUnitSalePrice(salePrice);
        sale.setTotalSaleAmount(quantity * salePrice);
        sale.setComment("Vente automatique via facturation");
        
        saleRepository.save(sale);
    }

    /**
     * Register a payment for a bill
     * Transactional to ensure atomicity
     */
    @Transactional
    public Bill registerPayment(Long billId, double amount) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException(
                "Facture non trouvée avec l'ID: " + billId));
        
        BigDecimal paymentAmount = BigDecimal.valueOf(amount)
            .setScale(3, RoundingMode.HALF_UP);
        
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Le montant doit être positif.");
        }
        if (bill.getAmountDue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("La facture est déjà totalement payée.");
        }
        if (paymentAmount.compareTo(bill.getAmountDue()) > 0) {
            throw new RuntimeException("Le montant dépasse le montant dû.");
        }
        
        // Update deposit
        BigDecimal currentDeposit = bill.getDeposit() != null ? 
            bill.getDeposit() : BigDecimal.ZERO;
        BigDecimal newDeposit = currentDeposit.add(paymentAmount);
        bill.setDeposit(newDeposit);
        
        // Recalculate amount due
        BigDecimal newAmountDue = bill.getTotal().subtract(newDeposit);
        if (newAmountDue.compareTo(BigDecimal.ZERO) < 0) {
            newAmountDue = BigDecimal.ZERO;
        }
        bill.setAmountDue(newAmountDue);
        
        // Update payment status
        if (newAmountDue.compareTo(BigDecimal.ZERO) == 0) {
            bill.setPaymentStatus(PaymentStatus.PAID);
        } else if (newDeposit.compareTo(BigDecimal.ZERO) > 0 && 
                   newDeposit.compareTo(bill.getTotal()) < 0) {
            bill.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        } else {
            bill.setPaymentStatus(PaymentStatus.UNPAID);
        }
        
        return billRepository.save(bill);
    }
}
```

**Key Implementation Patterns:**

1. **Dependency Injection**: Services are injected via constructor using Lombok's `@RequiredArgsConstructor`
2. **Clock Abstraction**: Injected `Clock` bean instead of static `LocalDateTime.now()`
3. **Transactional Operations**: `@Transactional` ensures ACID properties
4. **BigDecimal for Money**: All currency calculations use `BigDecimal` for precision
5. **Validation**: Business rules checked before persistence

---

## Clock Abstraction (Testability)

### Configuration: ClockConfig.java

```java
package com.example.stock_management.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class ClockConfig {

    /**
     * Provides a real Clock bean for production code.
     * Can be easily mocked in tests.
     */
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();  // real clock in production
    }
}
```

### Why Clock Abstraction?

#### Problem Without Clock Abstraction
```java
// ❌ Hard to test - depends on system time
public Bill save(BillDTO billDto) {
    bill.setDateBill(LocalDateTime.now());  // Current time, no control in tests
    // ...
}
```

**Test problems:**
- Tests are non-deterministic (run at different times, different results)
- Cannot test "month boundaries"
- Cannot test "year transitions"

#### Solution With Clock Abstraction
```java
// ✅ Easy to test - injected Clock can be mocked
@Service
@RequiredArgsConstructor
public class BillService {
    private final Clock clock;  // Injected dependency
    
    public Bill save(BillDTO billDto) {
        bill.setDateBill(LocalDateTime.now(clock));  // Controlled time
        // ...
    }
}
```

**Test example:**
```java
@Test
public void testBillCreation() {
    // Create a fixed clock for testing
    Clock fixedClock = Clock.fixed(
        Instant.parse("2024-01-15T10:30:00Z"),
        ZoneId.systemDefault()
    );
    
    // Inject the fixed clock
    BillService billService = new BillService(
        billRepository, 
        productRepository, 
        customerRepository, 
        saleRepository,
        fixedClock  // Fixed clock for deterministic test
    );
    
    Bill bill = billService.save(billDTO);
    
    // Bill date is always 2024-01-15, no matter when test runs
    assertThat(bill.getDateBill()).isEqualTo(
        LocalDateTime.of(2024, 1, 15, 10, 30, 0)
    );
}
```

---

## Error Handling

### Controller-Level Error Handling

```java
@PostMapping
@Operation(summary = "Créer un nouvel achat")
public ResponseEntity<?> createPurchase(@RequestBody PurchaseDTO purchaseDTO) {
    try {
        Purchase purchase = purchaseService.createPurchase(purchaseDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(purchaseService.convertToDTO(purchase));
    } catch (Exception e) {
        // Transform service exceptions to HTTP responses
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Erreur lors de la création de l'achat : " + e.getMessage());
    }
}
```

### Service-Level Validation

```java
public Sale createSale(SaleDTO saleDTO) {
    Product product = productRepository.findById(saleDTO.getProductId())
        .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
    
    // Business rule: Check stock availability
    if (product.getCurrentStockQuantity() < saleDTO.getQuantitySold()) {
        throw new RuntimeException(
            "Quantité insuffisante en stock. Stock disponible : " + 
            product.getCurrentStockQuantity() + 
            ", Quantité demandée : " + saleDTO.getQuantitySold()
        );
    }
    
    Sale sale = new Sale();
    sale.setDateSale(saleDTO.getDateSale());
    sale.setProduct(product);
    sale.setQuantitySold(saleDTO.getQuantitySold());
    sale.setUnitSalePrice(saleDTO.getUnitSalePrice());
    
    return saleRepository.save(sale);
}
```

---

## Transaction Management

### Transactional Service Methods

```java
@Transactional
public Bill save(BillDTO billDto) {
    // All operations within this method are atomic
    // If any operation fails, entire transaction is rolled back
    
    Customer customer = customerRepository.findById(billDto.getIdClient())
        .orElseThrow(() -> new RuntimeException("Client not found"));
    
    Bill bill = new Bill();
    bill.setCustomer(customer);
    bill.setDateBill(LocalDateTime.now(clock));
    
    // Multiple repository operations
    List<BillProduct> billProducts = billDto.getProducts().stream()
        .map(productDTO -> {
            Product product = productRepository.findById(productDTO.getIdProduct())
                .orElseThrow(() -> new RuntimeException("Product not found"));
            
            productRepository.updateStock(
                productDTO.getIdProduct(), 
                productDTO.getQuantite()
            );
            
            // Create sale record
            createSaleRecord(customer, product, 
                productDTO.getQuantite(), 
                productDTO.getPrixTotal() / productDTO.getQuantite());
            
            // Build BillProduct...
            return buildBillProduct(product, productDTO, bill);
        })
        .toList();
    
    bill.setBillProducts(billProducts);
    // ... more operations ...
    
    return billRepository.save(bill);
    
    // If any exception occurs:
    // - All insertions are rolled back
    // - Database remains in consistent state
    // - Exception is propagated to controller
}
```

**Benefits:**
- ✅ All-or-nothing guarantee
- ✅ Data consistency
- ✅ No partial updates
- ✅ Automatic rollback on error

---

## Best Practices Applied

1. **Separation of Concerns**: Each layer (Controller, Service, Repository) has single responsibility
2. **Dependency Injection**: Spring manages all bean lifecycle and injection
3. **Clock Abstraction**: Easy to test time-dependent logic
4. **Transaction Safety**: Atomic operations guarantee data consistency
5. **Validation at Service Level**: Business rules checked before persistence
6. **Error Handling**: Meaningful error messages from service, wrapped by controller
7. **BigDecimal for Money**: Prevents floating-point precision errors

---

## Running Examples

### Create a Bill with Products

```bash
curl -X POST http://localhost:8080/api/bills/create \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "billDate": "2024-01-15",
    "products": [
      {
        "productId": 1,
        "quantity": 10,
        "unitPrice": 20.50
      },
      {
        "productId": 2,
        "quantity": 5,
        "unitPrice": 15.00
      }
    ],
    "applyTva": true,
    "deposit": 100.00
  }'
```

### Register a Payment

```bash
curl -X POST http://localhost:8080/api/bills/1/register-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 250.00
  }'
```

### Get Invoice KPIs

```bash
curl http://localhost:8080/api/bills/kpis
```

---

**Document Version**: 1.0.0  
**Last Updated**: April 13, 2026  
**Framework**: Spring Boot 3.3.3  
**Java**: 21+

