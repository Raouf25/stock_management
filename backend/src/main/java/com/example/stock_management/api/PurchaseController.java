package com.example.stock_management.api;

import com.example.stock_management.dto.PurchaseDTO;
import com.example.stock_management.model.Purchase;
import com.example.stock_management.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@Tag(name = "Purchase", description = "Gestion des achats")
@CrossOrigin(origins = "*")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    /**
     * Créer un nouvel achat
     */
    @PostMapping
    @Operation(summary = "Créer un nouvel achat")
    public ResponseEntity<PurchaseDTO> createPurchase(@Valid @RequestBody PurchaseDTO purchaseDTO) {
        Purchase purchase = purchaseService.createPurchase(purchaseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseService.convertToDTO(purchase));
    }

    /**
     * Récupérer tous les achats
     */
    @GetMapping
    @Operation(summary = "Récupérer tous les achats")
    public ResponseEntity<List<PurchaseDTO>> getAllPurchases() {
        List<Purchase> purchases = purchaseService.getAllPurchases();
        return ResponseEntity.ok(purchaseService.convertToDTO(purchases));
    }

    /**
     * Récupérer un achat par ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un achat par ID")
    public ResponseEntity<PurchaseDTO> getPurchaseById(@PathVariable Long id) {
        return purchaseService.getPurchaseById(id)
            .map(purchase -> ResponseEntity.ok(purchaseService.convertToDTO(purchase)))
            .orElseThrow(() -> new ResourceNotFoundException("Achat non trouv\u00e9 avec l'ID : " + id));
    }

    /**
     * Récupérer les achats avec filtres
     * Filtres optionnels : dateFrom, dateTo, supplier
     */
    @GetMapping("/search")
    @Operation(summary = "Rechercher des achats avec filtres")
    public ResponseEntity<List<PurchaseDTO>> searchPurchases(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate dateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate dateTo,
        @RequestParam(required = false) Long supplierId) {

        List<Purchase> purchases = purchaseService.getPurchasesByFilter(dateFrom, dateTo, supplierId);
        return ResponseEntity.ok(purchaseService.convertToDTO(purchases));
    }

    /**
     * Récupérer les achats par produit
     */
    @GetMapping("/product/{productId}")
    @Operation(summary = "Récupérer les achats pour un produit spécifique")
    public ResponseEntity<List<PurchaseDTO>> getPurchasesByProduct(@PathVariable Long productId) {
        List<Purchase> purchases = purchaseService.getPurchasesByProduct(productId);
        return ResponseEntity.ok(purchaseService.convertToDTO(purchases));
    }
}
