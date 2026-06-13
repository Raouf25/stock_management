package com.example.stock_management.service;

import com.example.stock_management.dto.PaymentStatus;
import com.example.stock_management.dto.ProductDashboardDTO;
import com.example.stock_management.model.Purchase;
import com.example.stock_management.model.Sale;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.PurchaseRepository;
import com.example.stock_management.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class ProductDashboardService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private BillService billService;

   /* public List<ProductDashboardDTO> getProductsDashboardData() {
        // 1. Récupération instantanée de tous les produits + calculs via l'unique requête JPA
        List<ProductDashboardDTO> dtos = productRepository.findProductsDashboardData();

        // Cache local pour ne pas interroger la table Bill plusieurs fois pour le même numéro de facture
        Map<String, String> billStatusCache = new HashMap<>();

        // 2. Peuplement des listes d'historiques pour le Drawer du Front-end
        for (ProductDashboardDTO dto : dtos) {
            Long productId = dto.getProduct().getIdProduct();

            List<Purchase> purchases = purchaseRepository.findByProduct_IdProduct(productId);
            List<Sale> sales = saleRepository.findByProduct_IdProduct(productId);

            // Résolution des statuts de paiement sur les ventes de ce produit
            if (sales != null) {
                for (Sale sale : sales) {
                    String invoiceNum = sale.getInvoiceNumber();
                    if (invoiceNum != null && !invoiceNum.trim().isEmpty()) {
                        String status = billStatusCache.computeIfAbsent(invoiceNum.trim(),
                                id -> billService.getPaymentStatusByBillId(id));
                        sale.setPaymentStatus(status);
                    } else {
                        sale.setPaymentStatus("SANS FACTURE");
                    }
                }
            }

            dto.setPurchases(purchases);
            dto.setSales(sales);
        }

        return dtos;
    }*/

/*
    // Pool dédié : évite de saturer le ForkJoinPool commun avec des I/O bloquantes
    private static final ExecutorService POOL =
            Executors.newFixedThreadPool(
                    Runtime.getRuntime().availableProcessors() * 2,
                    r -> { Thread t = new Thread(r, "dashboard-worker"); t.setDaemon(true); return t; }
            );

    public List<ProductDashboardDTO> getProductsDashboardData() {

        List<ProductDashboardDTO> dtos = productRepository.findProductsDashboardData();

        // Cache thread-safe partagé entre tous les CompletableFuture
        Map<String, String> billStatusCache = new ConcurrentHashMap<>();

        // Chaque produit est enrichi dans son propre thread
        List<CompletableFuture<Void>> futures = dtos.stream()
                .map(dto -> CompletableFuture.runAsync(
                        () -> enrichDto(dto, billStatusCache), POOL))
                .toList();

        // Attente de tous les threads, propagation des erreurs
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        return dtos;
    }

    private void enrichDto(ProductDashboardDTO dto, Map<String, String> billStatusCache) {
        Long productId = dto.getProduct().getIdProduct();

        List<Purchase> purchases = purchaseRepository.findByProduct_IdProduct(productId);
        List<Sale>     sales     = saleRepository.findByProduct_IdProduct(productId);

        if (sales != null) {
            for (Sale sale : sales) {
                String invoiceNum = sale.getInvoiceNumber();
                if (invoiceNum != null && !invoiceNum.trim().isEmpty()) {
                    // computeIfAbsent est atomique sur ConcurrentHashMap → pas de double appel
                    String status = billStatusCache.computeIfAbsent(
                            invoiceNum.trim(),
                            id -> billService.getPaymentStatusByBillId(id));
                    sale.setPaymentStatus(status);
                } else {
                    sale.setPaymentStatus("SANS FACTURE");
                }
            }
        }

        dto.setPurchases(purchases);
        dto.setSales(sales);
    }*/

/*
**Tableau comparatif des gains :**

| | Avant (séquentiel) | V1 (multi-thread) | V2 (batch + cache) |
|---|---|---|---|
| Requêtes SQL | N × 2 | N × 2 (parallèle) | **2** |
| Appels billService | M séquentiels | M (avec cache local) | **1 batch** |
| Cache inter-requêtes | ❌ | ❌ | **✅ Spring Cache** |
| Temps total | N × T | ~T | **~T/N + cache hit ≈ 0** |
 */

    private static final ExecutorService POOL =
            Executors.newFixedThreadPool(
                    Runtime.getRuntime().availableProcessors() * 2,
                    r -> { Thread t = new Thread(r, "dashboard-worker"); t.setDaemon(true); return t; }
            );


    @Cacheable("dashboard-products")
    public List<ProductDashboardDTO> getProductsDashboardData() {

        List<ProductDashboardDTO> dtos = productRepository.findProductsDashboardData();
        if (dtos.isEmpty()) return dtos;

        // ── Fix 1 : 2 requêtes IN(…) pour TOUS les produits ──────────────────
        Set<Long> productIds = dtos.stream()
                .map(d -> d.getProduct().getIdProduct())
                .collect(Collectors.toSet());

        // Groupement en mémoire : productId → liste
        Map<Long, List<Purchase>> purchasesByProduct = purchaseRepository
                .findAllByProductIds(productIds)
                .stream()
                .collect(Collectors.groupingBy(p -> p.getProduct().getIdProduct()));

        Map<Long, List<Sale>> salesByProduct = saleRepository
                .findAllByProductIds(productIds)
                .stream()
                .collect(Collectors.groupingBy(s -> s.getProduct().getIdProduct()));

        // ── Fix 2 : résolution des statuts en 1 seule requête batch ──────────
        Set<Long> allInvoiceNumbers = salesByProduct.values().stream()
                .flatMap(Collection::stream)
                .map(Sale::getInvoiceNumber)
                .filter(n -> n != null && !n.trim().isEmpty())
                .map(String::trim)
                .map(Long::valueOf)//convert String to long
                .collect(Collectors.toSet());

        Map<Long, PaymentStatus> billStatuses = billService.getStatusesByInvoiceNumbers(allInvoiceNumbers);

        // ── Multi-threading : enrichissement en parallèle (lecture seule) ─────
        List<CompletableFuture<Void>> futures = dtos.stream()
                .map(dto -> CompletableFuture.runAsync(
                        () -> enrichDto(dto, purchasesByProduct, salesByProduct, billStatuses),
                        POOL))
                .toList();

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        return dtos;
    }

    private void enrichDto(
            ProductDashboardDTO dto,
            Map<Long, List<Purchase>> purchasesByProduct,
            Map<Long, List<Sale>> salesByProduct,
            Map<Long, PaymentStatus> billStatuses) {

        Long productId = dto.getProduct().getIdProduct();

        List<Purchase> purchases = purchasesByProduct.getOrDefault(productId, List.of());
        List<Sale>     sales     = salesByProduct.getOrDefault(productId, List.of());

        // Application des statuts déjà résolus — aucun appel réseau ici
        sales.forEach(sale -> {
            String num = sale.getInvoiceNumber();
            if (num != null && !num.trim().isEmpty()) {
                sale.setPaymentStatus(billStatuses.getOrDefault(Long.valueOf(num), PaymentStatus.GIFT).name());
            } else {
                sale.setPaymentStatus("SANS FACTURE");
            }
        });

        dto.setPurchases(purchases);
        dto.setSales(sales);
    }

    // ── Invalidation du cache sur toute écriture ──────────────────────────────
    @CacheEvict(value = "dashboard-products", allEntries = true)
    public void onDataChanged() { /* appelé après createPurchase, createSale, etc. */ }


}