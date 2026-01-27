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

import java.util.Map;
import java.util.Optional;

import java.util.List;
import java.util.HashMap;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;

    private final ProductRepository productRepository;

    private final CustomerRepository customerRepository;


    public List<Bill> findAll() {
        return billRepository.findAll();
    }

    public Optional<Bill> findById(Long id) {
        return billRepository.findById(id);
    }

    @Transactional
    public Bill save(BillDTO billDto) {
        // Vérifier que le client existe
        Customer customer = customerRepository.findById(billDto.getIdClient()).orElseThrow(() -> new RuntimeException("Client not found with ID: " + billDto.getIdClient()));

        Bill bill = new Bill();
        // Associer le client à la facture
        bill.setCustomer(customer);

        // Mettre à jour la date de la facture à l'heure actuelle
        bill.setDateBill(LocalDateTime.now());


        // Traiter les produits associés (BillProduct)
        List<BillProduct> billProducts = billDto.getProducts().stream().map(billProductDTO -> {
            // Charger le produit depuis le repository
            Product product = productRepository.findById(billProductDTO.getIdProduct()).orElseThrow(() -> new RuntimeException("Product not found with ID: " + billProductDTO.getIdProduct()));

            BillProduct billProduct = new BillProduct();
            // Associer l'objet produit récupéré à BillProduct
            billProduct.setProduct(product);
            billProduct.setQuantity(billProductDTO.getQuantite());
            productRepository.updateStock(billProductDTO.getIdProduct(), billProductDTO.getQuantite());
            billProduct.setTotalProductPrice(billProductDTO.getQuantite() * product.getUnitPriceBought());

            bill.setTotal(bill.getTotal() + billProduct.getTotalProductPrice());
            // Associer la facture aux produits
            billProduct.setBill(bill);

            return billProduct;
        }).toList();

        // Attach products
        bill.setBillProducts(billProducts);

        // Calculate deposit (may be null) and amount due
        double deposit = bill.getDeposit() != null ? bill.getDeposit() : 0.0;
        double amountDue = bill.getTotal() - deposit;
        if (amountDue < 0) {
            // protect against negative due (treat as zero)
            amountDue = 0.0;
        }
        bill.setAmountDue(amountDue);

        // Enforce paymentStatus rule: if amountDue != 0 then status must NOT be PAID
        if (Double.compare(amountDue, 0.0) == 0) {
            bill.setPaymentStatus(PaymentStatus.PAID);
        } else {
            // amountDue > 0 -> choose PARTIALLY_PAID when deposit > 0, otherwise UNPAID
            if (deposit > 0.0 && deposit < bill.getTotal()) {
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
        
        // Convert LocalDate to LocalDateTime
        bill.setDateBill(invoiceDto.getBillDate()
            .atStartOfDay(ZoneId.systemDefault())
            .toLocalDateTime());
        
        // Set additional invoice details
        bill.setDeliveryAddress(invoiceDto.getDeliveryAddress());
        bill.setPaymentTerms(invoiceDto.getPaymentTerms());
        bill.setNotes(invoiceDto.getNotes());
        bill.setDiscount(invoiceDto.getDiscount().doubleValue());
        bill.setDeposit(invoiceDto.getDeposit().doubleValue());

        // Calculate total from line items
        double totalHT = 0.0;
        List<BillProduct> billProducts = new java.util.ArrayList<>();

        for (InvoiceCreationDTO.InvoiceLineItemDTO lineItem : invoiceDto.getProducts()) {
            Product product = productRepository.findById(lineItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + lineItem.getProductId()));

            // Calculate line total
            double lineTotalHT = lineItem.getQuantity() * lineItem.getUnitPrice().doubleValue();
            
            // Apply discount to this line if discount is specified
            if (invoiceDto.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal discountPercent = invoiceDto.getDiscount().divide(new BigDecimal(100));
                BigDecimal lineTotal = new BigDecimal(lineTotalHT);
                BigDecimal discountedTotal = lineTotal.multiply(BigDecimal.ONE.subtract(discountPercent));
                lineTotalHT = discountedTotal.doubleValue();
            }

            totalHT += lineTotalHT;

            BillProduct billProduct = new BillProduct();
            billProduct.setProduct(product);
            billProduct.setQuantity(lineItem.getQuantity());
            billProduct.setTotalProductPrice(lineTotalHT);
            billProduct.setBill(bill);
            billProducts.add(billProduct);

            // Update stock
            productRepository.updateStock(lineItem.getProductId(), lineItem.getQuantity());
        }

        bill.setBillProducts(billProducts);

        // Calculate totals with VAT (19%)
        double VAT_RATE = 0.19;
        double totalWithVAT = totalHT * (1 + VAT_RATE);
        bill.setTotal(totalWithVAT);

        // Calculate amount due
        double deposit = invoiceDto.getDeposit().doubleValue();
        double amountDue = totalWithVAT - deposit;
        if (amountDue < 0) {
            amountDue = 0.0;
        }
        bill.setAmountDue(amountDue);

        // Set payment status based on amount due
        if (Double.compare(amountDue, 0.0) == 0) {
            bill.setPaymentStatus(PaymentStatus.PAID);
        } else if (deposit > 0.0 && deposit < totalWithVAT) {
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
        double totalInvoiced = bills.stream().mapToDouble(Bill::getTotal).sum();
        kpis.put("totalInvoicedAmount", totalInvoiced);

        // Average invoice amount
        double avgInvoice = bills.isEmpty() ? 0.0 : totalInvoiced / bills.size();
        kpis.put("averageInvoiceAmount", avgInvoice);

        // Number of unpaid invoices (amountDue > 0)
        long unpaidInvoices = bills.stream().filter(b -> b.getAmountDue() > 0).count();
        kpis.put("unpaidInvoices", unpaidInvoices);

        // Total amount due
        double totalAmountDue = bills.stream().mapToDouble(b -> b.getAmountDue()).sum();
        kpis.put("totalAmountDue", totalAmountDue);

        // Payment status distribution
        Map<String, Long> statusDistribution = new HashMap<>();
        for (Bill bill : bills) {
            String status = bill.getPaymentStatus() != null ? bill.getPaymentStatus().name() : "UNKNOWN";
            statusDistribution.put(status, statusDistribution.getOrDefault(status, 0L) + 1);
        }
        kpis.put("paymentStatusDistribution", statusDistribution);

        // Invoices this month
        LocalDate now = LocalDate.now();
        long invoicesThisMonth = bills.stream()
            .filter(b -> b.getDateBill() != null && b.getDateBill().getMonth() == now.getMonth() && b.getDateBill().getYear() == now.getYear())
            .count();
        kpis.put("invoicesThisMonth", invoicesThisMonth);

        // Total revenue this month
        double revenueThisMonth = bills.stream()
            .filter(b -> b.getDateBill() != null && b.getDateBill().getMonth() == now.getMonth() && b.getDateBill().getYear() == now.getYear())
            .mapToDouble(Bill::getTotal)
            .sum();
        kpis.put("revenueThisMonth", revenueThisMonth);

        return kpis;
    }
}
