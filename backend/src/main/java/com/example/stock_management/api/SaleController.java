package com.example.stock_management.api;

import com.example.stock_management.dto.SaleDTO;
import com.example.stock_management.model.Sale;
import com.example.stock_management.service.SaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sales")
@Tag(name = "Sale", description = "Gestion des ventes")
@CrossOrigin(origins = "*")
public class SaleController {

    @Autowired
    private SaleService saleService;

    /**
     * Créer une nouvelle vente
     */
    @PostMapping
    @Operation(summary = "Créer une nouvelle vente")
    public ResponseEntity<?> createSale(@RequestBody SaleDTO saleDTO) {
        try {
            Sale sale = saleService.createSale(saleDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(saleService.convertToDTO(sale));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Erreur lors de la création de la vente : " + e.getMessage());
        }
    }

    /**
     * Récupérer toutes les ventes
     */
    @GetMapping
    @Operation(summary = "Récupérer toutes les ventes")
    public ResponseEntity<List<SaleDTO>> getAllSales() {
        List<Sale> sales = saleService.getAllSales();
        return ResponseEntity.ok(saleService.convertToDTO(sales));
    }

    /**
     * Récupérer toutes les ventes combinées (directes + issues des factures).
     * Utilisé par le dashboard pour les graphiques.
     */
    @GetMapping("/combined")
    @Operation(summary = "Récupérer toutes les ventes (directes + factures)")
    public ResponseEntity<List<SaleDTO>> getAllSalesCombined() {
        return ResponseEntity.ok(saleService.getAllSalesCombined());
    }

    /**
     * Récupérer une vente par ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une vente par ID")
    public ResponseEntity<?> getSaleById(@PathVariable Long id) {
        Optional<Sale> sale = saleService.getSaleById(id);
        if (sale.isPresent()) {
            return ResponseEntity.ok(saleService.convertToDTO(sale.get()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Vente non trouvée avec l'ID : " + id);
        }
    }

    /**
     * Récupérer les ventes avec filtres
     * Filtres optionnels : dateFrom, dateTo
     */
    @GetMapping("/search")
    @Operation(summary = "Rechercher des ventes avec filtres")
    public ResponseEntity<List<SaleDTO>> searchSales(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate dateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate dateTo) {

        List<Sale> sales = saleService.getSalesByFilter(dateFrom, dateTo);
        return ResponseEntity.ok(saleService.convertToDTO(sales));
    }

    /**
     * Récupérer les ventes par produit
     */
    @GetMapping("/product/{productId}")
    @Operation(summary = "Récupérer les ventes pour un produit spécifique")
    public ResponseEntity<List<SaleDTO>> getSalesByProduct(@PathVariable Long productId) {
        List<Sale> sales = saleService.getSalesByProduct(productId);
        return ResponseEntity.ok(saleService.convertToDTO(sales));
    }
}
