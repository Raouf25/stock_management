package com.example.stock_management.api;

import com.example.stock_management.dto.SupplierKPIsDTO;
import com.example.stock_management.dto.SupplierWithStatsDTO;
import com.example.stock_management.model.Supplier;
import com.example.stock_management.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/suppliers")
@Tag(name = "Supplier", description = "Gestion des fournisseurs")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Obtenir la liste de tous les fournisseurs avec statistiques")
    public List<SupplierWithStatsDTO> getAllSuppliers() {
        return supplierService.findAllWithStats();
    }
    
    @GetMapping("/kpis")
    @Operation(summary = "Obtenir les KPIs des fournisseurs")
    public SupplierKPIsDTO getSupplierKPIs() {
        return supplierService.getSupplierKPIs();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un fournisseur par ID")
    public Optional<Supplier> getSupplierById(@PathVariable Long id) {
        return supplierService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau fournisseur")
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        return supplierService.save(supplier);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un fournisseur existant")
    public Supplier updateSupplier(@PathVariable Long id, @RequestBody Supplier supplierData) {
        Supplier existingSupplier = supplierService.findById(id)
                .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé avec l'ID: " + id));
        
        // Mettre à jour les champs modifiables
        existingSupplier.setName(supplierData.getName());
        existingSupplier.setAddress(supplierData.getAddress());
        existingSupplier.setPhone(supplierData.getPhone());
        existingSupplier.setEmail(supplierData.getEmail());
        existingSupplier.setWebSite(supplierData.getWebSite());
        existingSupplier.setTvaCode(supplierData.getTvaCode());
        existingSupplier.setRib(supplierData.getRib());
        existingSupplier.setIban(supplierData.getIban());
        existingSupplier.setContactPerson(supplierData.getContactPerson());
        
        return supplierService.save(existingSupplier);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un fournisseur par ID (ADMIN uniquement)")
    public void deleteSupplier(@PathVariable Long id) {
        supplierService.deleteById(id);
    }
}
