package com.example.stock_management.api;

import com.example.stock_management.dto.PurchaseDTO;
import com.example.stock_management.model.Purchase;
import com.example.stock_management.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
    public ResponseEntity<?> createPurchase(@RequestBody PurchaseDTO purchaseDTO) {
        try {
            Purchase purchase = purchaseService.createPurchase(purchaseDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(purchaseService.convertToDTO(purchase));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Erreur lors de la création de l'achat : " + e.getMessage());
        }
    }

    /**
     * Récupérer tous les achats
     */
    @GetMapping
    @Operation(summary = "Récupérer tous les achats")
    public ResponseEntity<List<PurchaseDTO>> getAllPurchases() {
        List<Purchase> purchases = purchaseService.getAllPurchases();
        List<PurchaseDTO> dtos = purchases.stream()
            .map(purchaseService::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Récupérer un achat par ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un achat par ID")
    public ResponseEntity<?> getPurchaseById(@PathVariable Long id) {
        return purchaseService.getPurchaseById(id)
            .map(purchase -> ResponseEntity.ok(purchaseService.convertToDTO(purchase)))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Achat non trouvé avec l'ID : " + id));
    }

    /**
     * Récupérer les achats avec filtres
     * Filtres optionnels : dateFrom, dateTo, supplier
     */
    @GetMapping("/search")
    @Operation(summary = "Rechercher des achats avec filtres")
    public ResponseEntity<List<PurchaseDTO>> searchPurchases(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
        @RequestParam(required = false) Long supplierId) {

        List<Purchase> purchases = purchaseService.getPurchasesByFilter(dateFrom, dateTo, supplierId);
        List<PurchaseDTO> dtos = purchases.stream()
            .map(purchaseService::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Récupérer les achats par produit
     */
    @GetMapping("/product/{productId}")
    @Operation(summary = "Récupérer les achats pour un produit spécifique")
    public ResponseEntity<List<PurchaseDTO>> getPurchasesByProduct(@PathVariable Long productId) {
        List<Purchase> purchases = purchaseService.getPurchasesByProduct(productId);
        List<PurchaseDTO> dtos = purchases.stream()
            .map(purchaseService::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
