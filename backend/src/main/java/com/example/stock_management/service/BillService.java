package com.example.stock_management.service;

import com.example.stock_management.dto.BillDTO;
import com.example.stock_management.dto.InvoiceCreationDTO;
import com.example.stock_management.dto.PaymentStatus;
import com.example.stock_management.model.Bill;
import com.example.stock_management.model.BillProduct;
import com.example.stock_management.model.Customer;
import com.example.stock_management.model.Product;
import com.example.stock_management.model.Sale;
import com.example.stock_management.model.StockMouvement;
import com.example.stock_management.repository.BillRepository;
import com.example.stock_management.repository.CustomerRepository;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.SaleRepository;
import com.example.stock_management.repository.StockMouvementRepository;
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
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;

    private final ProductRepository productRepository;

    private final CustomerRepository customerRepository;
    
    private final StockMouvementRepository stockMouvementRepository;
    
    private final SaleRepository saleRepository;


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
            productRepository.updateStock(billProductDTO.getIdProduct(), billProductDTO.getQuantite());
            
            // Create stock movement for sale
            createStockMovement(product, billProductDTO.getQuantite(), "VENTE");
            
            // Create sale record
            createSaleRecord(customer, product, billProductDTO.getQuantite(), null);
            
            double productTotal = billProductDTO.getQuantite() * product.getUnitPriceBought();
            billProduct.setTotalProductPrice(productTotal);

            // Associer la facture aux produits
            billProduct.setBill(bill);

            return billProduct;
        }).toList();

        // Calculate total from all products
        runningTotal = billProducts.stream()
            .map(bp -> BigDecimal.valueOf(bp.getTotalProductPrice()))
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
        double totalHT = 0.0;
        List<BillProduct> billProducts = new java.util.ArrayList<>();

        for (InvoiceCreationDTO.InvoiceLineItemDTO lineItem : invoiceDto.getProducts()) {
            Product product = productRepository.findById(lineItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + lineItem.getProductId()));

            // Calculate line total before discount
            double subtotal = lineItem.getQuantity() * lineItem.getUnitPrice().doubleValue();
            
            // Apply per-item discount if specified
            double lineDiscount = lineItem.getDiscount() != null ? lineItem.getDiscount().doubleValue() : 0.0;
            double discountAmount = (subtotal * lineDiscount) / 100.0;
            double lineTotalHT = subtotal - discountAmount;

            totalHT += lineTotalHT;

            BillProduct billProduct = new BillProduct();
            billProduct.setProduct(product);
            billProduct.setQuantity(lineItem.getQuantity());
            billProduct.setTotalProductPrice(lineTotalHT);
            billProduct.setDiscountPercentage(lineDiscount); // Stocker la remise par article
            billProduct.setBill(bill);
            billProducts.add(billProduct);

            // Update stock
            productRepository.updateStock(lineItem.getProductId(), lineItem.getQuantity());
            
            // Create stock movement for sale
            createStockMovement(product, lineItem.getQuantity(), "VENTE");
            
            // Create sale record
            createSaleRecord(customer, product, lineItem.getQuantity(), lineItem.getUnitPrice().doubleValue());
        }

        bill.setBillProducts(billProducts);

        // Calculate totals with VAT (19%)
        BigDecimal VAT_RATE = new BigDecimal("0.19");
        BigDecimal totalWithVAT = new BigDecimal(totalHT).multiply(BigDecimal.ONE.add(VAT_RATE)).setScale(3, RoundingMode.HALF_UP);
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
        LocalDate now = LocalDate.now();
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

    /**
     * Create a stock movement record for tracking inventory changes
     */
    private void createStockMovement(Product product, Integer quantity, String operation) {
        StockMouvement mouvement = new StockMouvement();
        mouvement.setProduct(product);
        mouvement.setQuantity(quantity);
        mouvement.setDate(LocalDate.now());
        mouvement.setType(StockMouvement.Type.SORTIE);
        mouvement.setSource(StockMouvement.Source.VENTE);
        mouvement.setReference("FACTURE-" + System.currentTimeMillis());
        
        stockMouvementRepository.save(mouvement);
    }
    
    /**
     * Create a sale record for tracking sales
     */
    private void createSaleRecord(Customer customer, Product product, Integer quantity, Double unitPrice) {
        Sale sale = new Sale();
        sale.setDateSale(LocalDate.now());
        sale.setCustomer(customer);
        sale.setProduct(product);
        sale.setInvoiceNumber("INV-" + System.currentTimeMillis());
        sale.setQuantitySold(quantity);
        
        // Use provided unit price or fallback to product's unit price sold
        double salePrice = (unitPrice != null) ? unitPrice : product.getUnitPriceSold();
        sale.setUnitSalePrice(salePrice);
        sale.setTotalSaleAmount(quantity * salePrice);
        sale.setComment("Vente automatique via facturation");
        
        saleRepository.save(sale);
    }

    @Transactional
    public Bill registerPayment(Long billId, double amount) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Facture non trouvée avec l'ID: " + billId));
        
        BigDecimal paymentAmount = BigDecimal.valueOf(amount).setScale(3, RoundingMode.HALF_UP);
        
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Le montant doit être positif.");
        }
        if (bill.getAmountDue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("La facture est déjà totalement payée.");
        }
        if (paymentAmount.compareTo(bill.getAmountDue()) > 0) {
            throw new RuntimeException("Le montant dépasse le montant dû.");
        }
        
        // Met à jour l'acompte
        BigDecimal currentDeposit = bill.getDeposit() != null ? bill.getDeposit() : BigDecimal.ZERO;
        BigDecimal newDeposit = currentDeposit.add(paymentAmount);
        bill.setDeposit(newDeposit);
        
        // Recalcule le montant dû
        BigDecimal newAmountDue = bill.getTotal().subtract(newDeposit);
        if (newAmountDue.compareTo(BigDecimal.ZERO) < 0) {
            newAmountDue = BigDecimal.ZERO;
        }
        bill.setAmountDue(newAmountDue);
        
        // Met à jour le statut de paiement
        if (newAmountDue.compareTo(BigDecimal.ZERO) == 0) {
            bill.setPaymentStatus(PaymentStatus.PAID);
        } else if (newDeposit.compareTo(BigDecimal.ZERO) > 0 && newDeposit.compareTo(bill.getTotal()) < 0) {
            bill.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        } else {
            bill.setPaymentStatus(PaymentStatus.UNPAID);
        }
        
        // Sauvegarde
        return billRepository.save(bill);
    }
}
