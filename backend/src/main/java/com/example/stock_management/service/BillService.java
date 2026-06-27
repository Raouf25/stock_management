package com.example.stock_management.service;

import com.example.stock_management.dto.BillDTO;
import com.example.stock_management.dto.InvoiceCreationDTO;
import com.example.stock_management.dto.PaymentStatus;
import com.example.stock_management.model.Bill;
import com.example.stock_management.model.BillProduct;
import com.example.stock_management.model.Customer;
import com.example.stock_management.model.Product;
import com.example.stock_management.repository.BillRepository;
import com.example.stock_management.repository.CustomerRepository;
import com.example.stock_management.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.*;
import java.util.Objects;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;

    private final ProductRepository productRepository;

    private final CustomerRepository customerRepository;

    private final Clock clock;

    public Map<Long, PaymentStatus> getStatusesByInvoiceNumbers(Set<Long> idBills) {
        if (idBills.isEmpty()) return Map.of();

        // Une seule requête pour tous les numéros de facture
        return billRepository.findByIdBillIn(idBills)
                .stream()
                .collect(Collectors.toMap(
                        Bill::getIdBill,
                        Bill::getPaymentStatus
                ));
    }

    /**
     * Récupère le statut de paiement d'une facture à partir de son numéro unique.
     * * @param billId Le numéro de la facture (invoiceNumber)
     * @return Le statut sous forme de chaîne (ex: "PAID", "PARTIALLY_PAID", "UNPAID", "INCONNU")
     */
    public String getPaymentStatusByBillId(String billId) {
        if (billId == null || billId.trim().isEmpty()) {
            return "SANS FACTURE";
        }

        // Recherche de la facture en base de données
        Optional<Bill> billOpt = billRepository.findByIdBill(Long.valueOf(billId.trim()));

        if (billOpt.isPresent()) {
            Bill bill = billOpt.get();

            // Si votre statut est une Enum (recommandé), on utilise .name(), sinon un String classique
            if (bill.getPaymentStatus() != null) {
                return bill.getPaymentStatus().toString();
            } else {
                return "INCONNU";
            }
        }

        // Si le numéro de facture est renseigné sur la vente mais introuvable dans la table des factures
        return "FACTURE INTROUVABLE";
    }


    @Transactional(readOnly = true)
    public List<Bill> findAll() {
        return billRepository.findAllWithProducts();
    }

    @Transactional(readOnly = true)
    public Page<Bill> findAllPaged(Pageable pageable) {
        return billRepository.findAllWithProductsPaged(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Bill> findById(Long id) {
        return billRepository.findByIdWithProducts(id);
    }

    @Transactional
    public Bill save(BillDTO billDto) {
        // Vérifier que le client existe
        Customer customer = customerRepository.findById(billDto.getIdClient()).orElseThrow(() -> new RuntimeException("Client not found with ID: " + billDto.getIdClient()));

        Bill bill = new Bill();
        // Associer le client à la facture
        bill.setCustomer(customer);

        // Mettre à jour la date de la facture à l'heure actuelle
        bill.setDateBill(LocalDateTime.now(clock));

        // Initialize total
        BigDecimal runningTotal = BigDecimal.ZERO;

        // Traiter les produits associés (BillProduct)
        List<BillProduct> billProducts = billDto.getProducts().stream().map(billProductDTO -> {
            // Charger le produit depuis le repository
            Product product = productRepository.findById(billProductDTO.getIdProduct()).orElseThrow(() -> new RuntimeException("Product not found with ID: " + billProductDTO.getIdProduct()));

            BillProduct billProduct = new BillProduct();
            // Associer l'objet produit récupéré à BillProduct
            billProduct.setProduct(product);
            billProduct.setQuantity(billProductDTO.getQuantite());
            int newQty = Math.max(0, Objects.requireNonNullElse(product.getCurrentStockQuantity(), 0) - billProductDTO.getQuantite());
            product.setCurrentStockQuantity(newQty);
            productRepository.save(product);

            // Create sale record//
          //  createSaleRecord(customer, product, billProductDTO.getQuantite(), billProductDTO.getPrixTotal() / billProductDTO.getQuantite(), "INV-" + Instant.now(clock).toEpochMilli());

            BigDecimal productTotal = BigDecimal.valueOf(billProductDTO.getQuantite())
                    .multiply(product.getUnitPrice() != null ? product.getUnitPrice() : BigDecimal.ZERO);
            billProduct.setTotalProductPrice(productTotal);

            // Associer la facture aux produits
            billProduct.setBill(bill);

            return billProduct;
        }).toList();

        // Calculate total from all products
        runningTotal = billProducts.stream()
            .map(BillProduct::getTotalProductPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(3, RoundingMode.HALF_UP);

        bill.setTotal(runningTotal);

        // Attach products
        bill.setBillProducts(billProducts);

        // Calculate deposit (may be null) and amount due
        BigDecimal deposit = bill.getDeposit() != null ? bill.getDeposit() : BigDecimal.ZERO;
        BigDecimal amountDue = bill.getTotal().subtract(deposit);
        if (amountDue.compareTo(BigDecimal.ZERO) < 0) {
            // protect against negative due (treat as zero)
            amountDue = BigDecimal.ZERO;
        }
        bill.setAmountDue(amountDue);

        // Enforce paymentStatus rule: if amountDue != 0 then status must NOT be PAID
        if (amountDue.compareTo(BigDecimal.ZERO) == 0) {
            bill.setPaymentStatus(PaymentStatus.PAID);
        } else {
            // amountDue > 0 -> choose PARTIALLY_PAID when deposit > 0, otherwise UNPAID
            if (deposit.compareTo(BigDecimal.ZERO) > 0 && deposit.compareTo(bill.getTotal()) < 0) {
                bill.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
            } else {
                bill.setPaymentStatus(PaymentStatus.UNPAID);
            }
        }

        // Sauvegarder la facture dans la base de données
        return billRepository.save(bill);
    }

    /**
     * Create an invoice with comprehensive invoice data including delivery address, payment terms, discount, etc.
     */
    @Transactional
    public Bill createInvoice(InvoiceCreationDTO invoiceDto) {
        // Verify customer exists
        Customer customer = customerRepository.findById(invoiceDto.getCustomerId())
            .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + invoiceDto.getCustomerId()));

        Bill bill = new Bill();
        bill.setCustomer(customer);
        long billId = Instant.now(clock).toEpochMilli();
        bill.setIdBill(billId); // Generate unique invoice number

        // Convert LocalDate to LocalDateTime
        bill.setDateBill(invoiceDto.getBillDate()
            .atStartOfDay(ZoneId.systemDefault())
            .toLocalDateTime());

        // Set additional invoice details
        bill.setDeliveryAddress(invoiceDto.getDeliveryAddress());
        bill.setPaymentTerms(invoiceDto.getPaymentTerms());
        bill.setNotes(invoiceDto.getNotes());
        bill.setDiscount(invoiceDto.getDiscount());
        bill.setDeposit(invoiceDto.getDeposit());

        // Calculate total from line items
        BigDecimal totalHT = BigDecimal.ZERO;
        List<BillProduct> billProducts = new java.util.ArrayList<>();

        for (InvoiceCreationDTO.InvoiceLineItemDTO lineItem : invoiceDto.getProducts()) {
            Product product = productRepository.findById(lineItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + lineItem.getProductId()));

            BigDecimal subtotal = BigDecimal.valueOf(lineItem.getQuantity()).multiply(lineItem.getUnitPrice());

            BigDecimal lineDiscountPct = lineItem.getDiscount() != null ? lineItem.getDiscount() : BigDecimal.ZERO;
            BigDecimal discountAmount = subtotal.multiply(lineDiscountPct)
                    .divide(BigDecimal.valueOf(100), 3, RoundingMode.HALF_UP);
            BigDecimal lineTotalHT = subtotal.subtract(discountAmount);

            totalHT = totalHT.add(lineTotalHT);

            BillProduct billProduct = new BillProduct();
            billProduct.setProduct(product);
            billProduct.setQuantity(lineItem.getQuantity());
            billProduct.setTotalProductPrice(lineTotalHT);
            billProduct.setDiscountPercentage(lineDiscountPct);
            billProduct.setBill(bill);
            billProducts.add(billProduct);

            // Decrement stock via entity so Hibernate first-level cache stays consistent
            int newQty = Math.max(0, Objects.requireNonNullElse(product.getCurrentStockQuantity(), 0) - lineItem.getQuantity());
            product.setCurrentStockQuantity(newQty);
            productRepository.save(product);
        }

        bill.setBillProducts(billProducts);

        // Déterminer si la TVA doit être appliquée (par défaut non)
        boolean applyTva = invoiceDto.getApplyTva() != null ? invoiceDto.getApplyTva() : false;
        bill.setApplyTva(applyTva);

        // Calculate totals with VAT (19%) if applyTva is true
        BigDecimal VAT_RATE = new BigDecimal("0.19");
        BigDecimal totalWithVAT;
        if (applyTva) {
            totalWithVAT = totalHT.multiply(BigDecimal.ONE.add(VAT_RATE)).setScale(3, RoundingMode.HALF_UP);
        } else {
            totalWithVAT = totalHT.setScale(3, RoundingMode.HALF_UP);
        }
        bill.setTotal(totalWithVAT);

        // Calculate amount due
        BigDecimal deposit = invoiceDto.getDeposit();
        BigDecimal amountDue = totalWithVAT.subtract(deposit);
        if (amountDue.compareTo(BigDecimal.ZERO) < 0) {
            amountDue = BigDecimal.ZERO;
        }
        bill.setAmountDue(amountDue);

        // Set payment status based on amount due
        if (amountDue.compareTo(BigDecimal.ZERO) == 0) {
            bill.setPaymentStatus(PaymentStatus.PAID);
        } else if (deposit.compareTo(BigDecimal.ZERO) > 0 && deposit.compareTo(totalWithVAT) < 0) {
            bill.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        } else {
            bill.setPaymentStatus(PaymentStatus.UNPAID);
        }

        return billRepository.save(bill);
    }


    public void deleteById(Long id) {
        billRepository.deleteById(id);
    }

    public Map<String, Object> getInvoiceKPIs() {
        List<Bill> bills = billRepository.findAll();
        Map<String, Object> kpis = new HashMap<>();

        // Total number of invoices
        kpis.put("totalInvoices", bills.size());

        // Total invoiced amount
        BigDecimal totalInvoiced = bills.stream()
            .map(Bill::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        kpis.put("totalInvoicedAmount", totalInvoiced);

        // Average invoice amount
        BigDecimal avgInvoice = bills.isEmpty() ? BigDecimal.ZERO :
            totalInvoiced.divide(new BigDecimal(bills.size()), 3, RoundingMode.HALF_UP);
        kpis.put("averageInvoiceAmount", avgInvoice);

        // Number of unpaid invoices (amountDue > 0)
        long unpaidInvoices = bills.stream()
            .filter(b -> b.getAmountDue().compareTo(BigDecimal.ZERO) > 0)
            .count();
        kpis.put("unpaidInvoices", unpaidInvoices);

        // Total amount due
        BigDecimal totalAmountDue = bills.stream()
            .map(Bill::getAmountDue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        kpis.put("totalAmountDue", totalAmountDue);

        // Payment status distribution
        Map<String, Long> statusDistribution = new HashMap<>();
        for (Bill bill : bills) {
            String status = bill.getPaymentStatus() != null ? bill.getPaymentStatus().name() : "UNKNOWN";
            statusDistribution.put(status, statusDistribution.getOrDefault(status, 0L) + 1);
        }
        kpis.put("paymentStatusDistribution", statusDistribution);

        // Invoices this month
        LocalDate now = LocalDate.now(clock);
        long invoicesThisMonth = bills.stream()
            .filter(b -> b.getDateBill() != null && b.getDateBill().getMonth() == now.getMonth() && b.getDateBill().getYear() == now.getYear())
            .count();
        kpis.put("invoicesThisMonth", invoicesThisMonth);

        // Total revenue this month
        BigDecimal revenueThisMonth = bills.stream()
            .filter(b -> b.getDateBill() != null && b.getDateBill().getMonth() == now.getMonth() && b.getDateBill().getYear() == now.getYear())
            .map(Bill::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        kpis.put("revenueThisMonth", revenueThisMonth);

        return kpis;
    }

    @Transactional
    public Bill registerPayment(Long billId) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Facture non trouvée avec l'ID: " + billId));

        if (bill.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("La facture est déjà marquée comme payée.");
        }

        bill.setPaymentStatus(PaymentStatus.PAID);
        bill.setAmountDue(BigDecimal.ZERO);

        return billRepository.save(bill);
    }
}
