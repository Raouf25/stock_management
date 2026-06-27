package com.example.stock_management.service;

import com.example.stock_management.dto.SupplierKPIsDTO;
import com.example.stock_management.dto.SupplierWithStatsDTO;
import com.example.stock_management.model.Supplier;
import com.example.stock_management.repository.PurchaseRepository;
import com.example.stock_management.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;
    
    @Autowired
    private PurchaseRepository purchaseRepository;

    public List<Supplier> findAll() {
        return supplierRepository.findAll();
    }
    
    public List<SupplierWithStatsDTO> findAllWithStats() {
        return supplierRepository.findAll().stream()
                .map(this::enrichSupplierWithStats)
                .sorted(Comparator.comparing(
                        (SupplierWithStatsDTO dto) -> dto.totalAmount(),
                        Comparator.reverseOrder()
                ))
                .collect(Collectors.toList());
    }

    public Optional<Supplier> findById(Long id) {
        return supplierRepository.findById(id);
    }

    public Supplier save(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public void deleteById(Long id) {
        supplierRepository.deleteById(id);
    }
    
    public SupplierKPIsDTO getSupplierKPIs() {
        long totalSuppliers = supplierRepository.count();
        long activeSuppliers = totalSuppliers; // Tous les fournisseurs sont considérés actifs par défaut
        
        LocalDate threeMonthsAgo = LocalDate.now().minusMonths(3);
        long suppliersWithRecentPurchases = purchaseRepository.countDistinctSuppliersWithPurchasesSince(threeMonthsAgo);
        
        long totalPurchases = purchaseRepository.count();
        BigDecimal totalPurchaseAmount = purchaseRepository.sumAllPurchaseAmount();
        
        BigDecimal averagePurchasePerSupplier = totalSuppliers > 0
                ? totalPurchaseAmount.divide(BigDecimal.valueOf(totalSuppliers), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        
        return new SupplierKPIsDTO(
                totalSuppliers,
                activeSuppliers,
                suppliersWithRecentPurchases,
                totalPurchases,
                totalPurchaseAmount,
                averagePurchasePerSupplier
        );
    }
    
    private SupplierWithStatsDTO enrichSupplierWithStats(Supplier supplier) {
        Long totalPurchases = purchaseRepository.countPurchasesBySupplierId(supplier.getId());
        BigDecimal totalAmount = purchaseRepository.sumTotalAmountBySupplierId(supplier.getId());
        Long totalProductsSupplied = purchaseRepository.countDistinctProductsBySupplierId(supplier.getId());
        
        return new SupplierWithStatsDTO(
                supplier, 
                totalPurchases, 
                totalAmount, 
                totalProductsSupplied.intValue()
        );
    }
}
