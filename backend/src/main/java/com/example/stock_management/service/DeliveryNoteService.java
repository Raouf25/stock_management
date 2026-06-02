package com.example.stock_management.service;

import com.example.stock_management.dto.DeliveryNoteDTO;
import com.example.stock_management.dto.DeliveryNoteStatus;
import com.example.stock_management.model.*;
import com.example.stock_management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DeliveryNoteService {

    private final DeliveryNoteRepository deliveryNoteRepository;
    private final DeliveryNoteProductRepository deliveryNoteProductRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final BillRepository billRepository;

    @Transactional(readOnly = true)
    public List<DeliveryNote> findAll() {
        return deliveryNoteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<DeliveryNote> findById(Long id) {
        return deliveryNoteRepository.findById(id);
    }


    public List<DeliveryNote> findByCustomerId(Long customerId) {
        return deliveryNoteRepository.findByCustomer_CustomerId(customerId);
    }

    public List<DeliveryNote> findNotInvoiced() {
        return deliveryNoteRepository.findByInvoiced(false);
    }

    public List<DeliveryNote> findPendingInvoicing() {
        return deliveryNoteRepository.findPendingInvoicing();
    }

    @Transactional
    public DeliveryNote save(DeliveryNoteDTO deliveryNoteDTO) {
        // Vérifier que le client existe
        Customer customer = customerRepository.findById(deliveryNoteDTO.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + deliveryNoteDTO.getCustomerId()));

        DeliveryNote deliveryNote = new DeliveryNote();
        deliveryNote.setCustomer(customer);
        deliveryNote.setDateDelivery(deliveryNoteDTO.getDateDelivery() != null ?
                deliveryNoteDTO.getDateDelivery() : LocalDateTime.now());
        deliveryNote.setDeliveryAddress(deliveryNoteDTO.getDeliveryAddress());
        deliveryNote.setNotes(deliveryNoteDTO.getNotes());
        deliveryNote.setDiscount(deliveryNoteDTO.getDiscount());
        deliveryNote.setStatus(DeliveryNoteStatus.PENDING);
        deliveryNote.setInvoiced(false);

        // Générer le numéro de BL
        deliveryNote.setDeliveryNoteNumber(generateDeliveryNoteNumber());

        // Traiter les produits
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<DeliveryNoteProduct> deliveryNoteProducts = new ArrayList<>();

        for (var productDTO : deliveryNoteDTO.getProducts()) {
            Product product = productRepository.findById(productDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productDTO.getProductId()));

            DeliveryNoteProduct dnProduct = new DeliveryNoteProduct();
            dnProduct.setProduct(product);
            dnProduct.setQuantity(productDTO.getQuantity());
            dnProduct.setUnitPrice(productDTO.getUnitPrice() != null ?
                    productDTO.getUnitPrice() : BigDecimal.valueOf(product.getUnitPriceSold()));
            dnProduct.setDiscount(productDTO.getDiscount() != null ? productDTO.getDiscount() : BigDecimal.ZERO);
            dnProduct.setDeliveryNote(deliveryNote);

            // Calculer le prix total
            dnProduct.calculateTotalPrice();
            totalAmount = totalAmount.add(dnProduct.getTotalPrice());

            deliveryNoteProducts.add(dnProduct);

            // Mettre à jour le stock du produit
            productRepository.updateStock(product.getIdProduct(), productDTO.getQuantity());
        }

        // Appliquer la remise globale si elle existe
        if (deliveryNote.getDiscount() != null && deliveryNote.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmount = totalAmount.multiply(deliveryNote.getDiscount())
                    .divide(BigDecimal.valueOf(100), 3, RoundingMode.HALF_UP);
            totalAmount = totalAmount.subtract(discountAmount);
        }

        // Déterminer si la TVA doit être appliquée (par défaut non)
        boolean applyTva = deliveryNoteDTO.getApplyTva() != null ? deliveryNoteDTO.getApplyTva() : false;
        deliveryNote.setApplyTva(applyTva);

        // Appliquer la TVA (19%) si demandé
        if (applyTva) {
            BigDecimal VAT_RATE = new BigDecimal("0.19");
            totalAmount = totalAmount.multiply(BigDecimal.ONE.add(VAT_RATE)).setScale(3, RoundingMode.HALF_UP);
        }

        deliveryNote.setTotalAmount(totalAmount.setScale(3, RoundingMode.HALF_UP));
        deliveryNote.setDeliveryNoteProducts(deliveryNoteProducts);

        return deliveryNoteRepository.save(deliveryNote);
    }

    @Transactional
    public DeliveryNote updateStatus(Long id, DeliveryNoteStatus status) {
        DeliveryNote deliveryNote = deliveryNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery Note not found with ID: " + id));

        deliveryNote.setStatus(status);

        if (status == DeliveryNoteStatus.INVOICED) {
            deliveryNote.setInvoiced(true);
        }

        return deliveryNoteRepository.save(deliveryNote);
    }

    @Transactional
    public void delete(Long id) {
        DeliveryNote deliveryNote = deliveryNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery Note not found with ID: " + id));

        if (deliveryNote.getInvoiced()) {
            throw new RuntimeException("Cannot delete an invoiced delivery note");
        }

        // Annuler les mouvements de stock
        for (DeliveryNoteProduct dnp : deliveryNote.getDeliveryNoteProducts()) {
            // Remettre le stock
            Product product = dnp.getProduct();
            product.setCurrentStockQuantity(product.getCurrentStockQuantity() + dnp.getQuantity());
            productRepository.save(product);

        }

        deliveryNoteRepository.delete(deliveryNote);
    }

    @Transactional
    public Bill convertToInvoice(List<Long> deliveryNoteIds) {
        if (deliveryNoteIds == null || deliveryNoteIds.isEmpty()) {
            throw new RuntimeException("No delivery notes specified");
        }

        List<DeliveryNote> deliveryNotes = deliveryNoteRepository.findAllById(deliveryNoteIds);

        if (deliveryNotes.isEmpty()) {
            throw new RuntimeException("No delivery notes found");
        }

        // Vérifier que tous les BL appartiennent au même client
        Customer customer = deliveryNotes.get(0).getCustomer();
        boolean sameCustomer = deliveryNotes.stream()
                .allMatch(dn -> dn.getCustomer().getCustomerId().equals(customer.getCustomerId()));

        if (!sameCustomer) {
            throw new RuntimeException("All delivery notes must belong to the same customer");
        }

        // Vérifier qu'aucun BL n'est déjà facturé
        boolean alreadyInvoiced = deliveryNotes.stream().anyMatch(DeliveryNote::getInvoiced);
        if (alreadyInvoiced) {
            throw new RuntimeException("Some delivery notes are already invoiced");
        }

        // Créer la facture
        Bill bill = new Bill();
        bill.setCustomer(customer);
        bill.setDateBill(LocalDateTime.now());
        bill.setPaymentStatus(com.example.stock_management.dto.PaymentStatus.UNPAID);

        // Agréger tous les produits des BL
        Map<Long, BillProduct> productMap = new HashMap<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (DeliveryNote dn : deliveryNotes) {
            for (DeliveryNoteProduct dnp : dn.getDeliveryNoteProducts()) {
                Long productId = dnp.getProduct().getIdProduct();

                if (productMap.containsKey(productId)) {
                    // Additionner les quantités si le produit existe déjà
                    BillProduct existing = productMap.get(productId);
                    existing.setQuantity(existing.getQuantity() + dnp.getQuantity());
                    double newTotal = existing.getQuantity() * dnp.getUnitPrice().doubleValue();
                    existing.setTotalProductPrice(newTotal);
                } else {
                    // Créer un nouveau BillProduct
                    BillProduct billProduct = new BillProduct();
                    billProduct.setProduct(dnp.getProduct());
                    billProduct.setQuantity(dnp.getQuantity());
                    billProduct.setTotalProductPrice(dnp.getTotalPrice().doubleValue());
                    billProduct.setBill(bill);
                    productMap.put(productId, billProduct);
                }

                totalAmount = totalAmount.add(dnp.getTotalPrice());
            }
        }

        bill.setBillProducts(new ArrayList<>(productMap.values()));
        bill.setTotal(totalAmount.setScale(3, RoundingMode.HALF_UP));
        bill.setAmountDue(totalAmount.setScale(3, RoundingMode.HALF_UP));

        // Sauvegarder la facture
        bill = billRepository.save(bill);

        // Mettre à jour les BL comme facturés
        for (DeliveryNote dn : deliveryNotes) {
            dn.setInvoiced(true);
            dn.setStatus(DeliveryNoteStatus.INVOICED);
            dn.setBill(bill);
        }
        deliveryNoteRepository.saveAll(deliveryNotes);

        return bill;
    }

    public Map<String, Object> getKPIs() {
        Map<String, Object> kpis = new HashMap<>();

        long totalDeliveryNotes = deliveryNoteRepository.count();
        long notInvoiced = deliveryNoteRepository.countNotInvoiced();
        long pending = deliveryNoteRepository.countByStatus(DeliveryNoteStatus.PENDING);
        long delivered = deliveryNoteRepository.countByStatus(DeliveryNoteStatus.DELIVERED);
        BigDecimal totalAmountNotInvoiced = deliveryNoteRepository.sumTotalAmountNotInvoiced();

        // Calculs pour le mois en cours
        LocalDateTime now = LocalDateTime.now();
        List<DeliveryNote> thisMonthNotes = deliveryNoteRepository.findByYearAndMonth(
                now.getYear(), now.getMonthValue());
        long thisMonthCount = thisMonthNotes.size();
        BigDecimal thisMonthAmount = thisMonthNotes.stream()
                .map(DeliveryNote::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        kpis.put("totalDeliveryNotes", totalDeliveryNotes);
        kpis.put("notInvoiced", notInvoiced);
        kpis.put("pendingDelivery", pending);
        kpis.put("delivered", delivered);
        kpis.put("totalAmountNotInvoiced", totalAmountNotInvoiced);
        kpis.put("thisMonthDeliveryNotes", thisMonthCount);
        kpis.put("thisMonthAmount", thisMonthAmount);

        return kpis;
    }

    private String generateDeliveryNoteNumber() {
        String prefix = "BL";
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // Trouver le dernier numéro du jour
        String pattern = prefix + "-" + datePart + "-%";
        long count = deliveryNoteRepository.count();

        return String.format("%s-%s-%04d", prefix, datePart, count + 1);
    }
}
