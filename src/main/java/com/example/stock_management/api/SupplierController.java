package com.example.stock_management.api;

import com.example.stock_management.model.Supplier;
import com.example.stock_management.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
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
    @Operation(summary = "Obtenir la liste de tous les fournisseurs")
    public List<Supplier> getAllSuppliers() {
        return supplierService.findAll();
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
    public Supplier updateSupplier(@PathVariable Long id, @RequestBody Supplier supplier) {
//        fournisseur.setIdSupplier(id);
        return supplierService.save(supplier);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un fournisseur par ID")
    public void deleteSupplier(@PathVariable Long id) {
        supplierService.deleteById(id);
    }
}
