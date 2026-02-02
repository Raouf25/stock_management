package com.example.stock_management.api;

import com.example.stock_management.dto.StockMovementDTO;
import com.example.stock_management.model.StockMouvement;
import com.example.stock_management.service.StockMovementService;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stock-movements")
@Tag(name = "StockMovement", description = "Gestion des mouvements de stock")
@CrossOrigin(origins = "*")
public class StockMovementController {

    @Autowired
    private StockMovementService stockMovementService;

    /**
     * Récupérer tous les mouvements de stock
     */
    @GetMapping
    @Operation(summary = "Récupérer tous les mouvements de stock")
    public ResponseEntity<List<StockMovementDTO>> getAllMovements() {
        List<StockMouvement> mouvements = stockMovementService.getAllMovements();
        return ResponseEntity.ok(stockMovementService.convertToDTO(mouvements));
    }

    /**
     * Récupérer un mouvement par ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un mouvement de stock par ID")
    public ResponseEntity<?> getMovementById(@PathVariable Long id) {
        Optional<StockMouvement> mouvement = stockMovementService.getMovementById(id);
        if (mouvement.isPresent()) {
            return ResponseEntity.ok(stockMovementService.convertToDTO(mouvement.get()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Mouvement non trouvé avec l'ID : " + id);
        }
    }

    /**
     * Récupérer les mouvements avec filtres
     * Filtres optionnels : article, type, dateFrom, dateTo
     */
    @GetMapping("/search")
    @Operation(summary = "Rechercher des mouvements de stock avec filtres")
    public ResponseEntity<List<StockMovementDTO>> searchMovements(
        @RequestParam(required = false) Long productId,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate dateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate dateTo) {

        List<StockMouvement> mouvements = stockMovementService.getMovementsByFilter(productId, type, dateFrom, dateTo);
        return ResponseEntity.ok(stockMovementService.convertToDTO(mouvements));
    }

    /**
     * Récupérer les mouvements pour un produit
     */
    @GetMapping("/product/{productId}")
    @Operation(summary = "Récupérer les mouvements pour un produit spécifique")
    public ResponseEntity<List<StockMovementDTO>> getMovementsByProduct(@PathVariable Long productId) {
        List<StockMouvement> mouvements = stockMovementService.getMovementsByProduct(productId);
        return ResponseEntity.ok(stockMovementService.convertToDTO(mouvements));
    }

    /**
     * Récupérer les mouvements par type
     */
    @GetMapping("/type/{type}")
    @Operation(summary = "Récupérer les mouvements par type (ENTREE/SORTIE)")
    public ResponseEntity<?> getMovementsByType(@PathVariable String type) {
        try {
            List<StockMouvement> mouvements = stockMovementService.getMovementsByType(type);
            return ResponseEntity.ok(stockMovementService.convertToDTO(mouvements));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Type de mouvement invalide. Utilisez ENTREE ou SORTIE");
        }
    }

    /**
     * Récupérer les mouvements par source
     */
    @GetMapping("/source/{source}")
    @Operation(summary = "Récupérer les mouvements par source (ACHAT/VENTE/AJUSTEMENT)")
    public ResponseEntity<?> getMovementsBySource(@PathVariable String source) {
        try {
            List<StockMouvement> mouvements = stockMovementService.getMovementsBySource(source);
            return ResponseEntity.ok(stockMovementService.convertToDTO(mouvements));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Source invalide. Utilisez ACHAT, VENTE ou AJUSTEMENT");
        }
    }
}
