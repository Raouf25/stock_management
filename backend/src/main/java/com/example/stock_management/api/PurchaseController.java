package com.example.stock_management.api;

import com.example.stock_management.dto.PurchaseDTO;
import com.example.stock_management.model.Purchase;
import com.example.stock_management.service.CsvExportService;
import com.example.stock_management.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@Tag(name = "Purchase", description = "Gestion des achats")
@CrossOrigin(origins = "*")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private CsvExportService csvExportService;

    /**
     * Créer un nouvel achat
     */
    @PostMapping
    @Operation(summary = "Créer un nouvel achat")
    public ResponseEntity<List<PurchaseDTO>> createPurchase(@Valid @RequestBody PurchaseDTO purchaseDTO) {
        var purchase = purchaseService.createPurchase(purchaseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseService.convertToDTO(purchase));
    }

    @GetMapping("/export.csv")
    @Operation(summary = "Exporter les achats en CSV")
    public void exportCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"purchases.csv\"");
        List<PurchaseDTO> purchases = purchaseService.convertToDTO(purchaseService.getAllPurchases());
        response.getWriter().write(csvExportService.exportPurchasesToCsv(purchases));
    }

    /**
     * Récupérer tous les achats
     */
    @GetMapping
    @Operation(summary = "Récupérer tous les achats (paginé)")
    public ResponseEntity<Page<PurchaseDTO>> getAllPurchases(
            @RequestParam(defaultValue = "0")             int page,
            @RequestParam(defaultValue = "50")            int size,
            @RequestParam(defaultValue = "datePurchase")  String sortBy,
            @RequestParam(defaultValue = "desc")          String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<Purchase> paged = purchaseService.getAllPurchasesPaged(PageRequest.of(page, size, sort));
        Page<PurchaseDTO> result = paged.map(purchaseService::convertToDTO);
        return ResponseEntity.ok(result);
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
