package com.example.stock_management.api;

import com.example.stock_management.dto.StockSummaryDTO;
import com.example.stock_management.dto.StockAlertDTO;
import com.example.stock_management.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stock")
@Tag(name = "Stock Reporting", description = "Reporting et synthèse de stock")
@CrossOrigin(origins = "*")
public class ReportingController {

    @Autowired
    private StockService stockService;

    /**
     * Récupérer le résumé global du stock
     */
    @GetMapping("/summary")
    @Operation(summary = "Récupérer le résumé global du stock")
    public ResponseEntity<Map<String, Object>> getGlobalStockSummary() {
        List<StockSummaryDTO> summaries = stockService.getGlobalStockSummary();

        Map<String, Object> response = new HashMap<>();
        response.put("products", summaries);
        
        // Calculer les totaux
        int totalInitialQuantity = summaries.stream()
            .mapToInt(StockSummaryDTO::getInitialQuantity)
            .sum();
        
        double totalInitialValue = summaries.stream()
            .mapToDouble(StockSummaryDTO::getInitialValue)
            .sum();
        
        double totalPurchasesAmount = summaries.stream()
            .mapToDouble(StockSummaryDTO::getTotalPurchasesAmount)
            .sum();
        
        double totalSalesAmount = summaries.stream()
            .mapToDouble(StockSummaryDTO::getTotalSalesAmount)
            .sum();
        
        int totalFinalQuantity = summaries.stream()
            .mapToInt(StockSummaryDTO::getFinalQuantity)
            .sum();
        
        double totalFinalStockValue = summaries.stream()
            .mapToDouble(StockSummaryDTO::getFinalStockValue)
            .sum();

        response.put("totals", Map.of(
            "initialQuantity", totalInitialQuantity,
            "initialValue", totalInitialValue,
            "totalPurchasesAmount", totalPurchasesAmount,
            "totalSalesAmount", totalSalesAmount,
            "finalQuantity", totalFinalQuantity,
            "finalStockValue", totalFinalStockValue
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * Récupérer le résumé de stock pour un produit spécifique
     */
    @GetMapping("/summary/{productId}")
    @Operation(summary = "Récupérer le résumé de stock pour un produit")
    public ResponseEntity<?> getProductStockSummary(@PathVariable Long productId) {
        try {
            StockSummaryDTO summary = stockService.getProductStockSummary(productId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Produit non trouvé avec l'ID : " + productId);
        }
    }

    /**
     * Récupérer les alertes de stock
     * Paramètre optionnel: threshold (par défaut 10)
     */
    @GetMapping("/alerts")
    @Operation(summary = "Récupérer les alertes de stock")
    public ResponseEntity<List<StockAlertDTO>> getStockAlerts(
        @RequestParam(required = false, defaultValue = "10") Integer threshold) {
        List<StockAlertDTO> alerts = stockService.getStockAlerts(threshold);
        return ResponseEntity.ok(alerts);
    }

    /**
     * Récupérer la valeur totale du stock
     */
    @GetMapping("/total-value")
    @Operation(summary = "Récupérer la valeur totale du stock")
    public ResponseEntity<Map<String, Double>> getTotalStockValue() {
        Double totalValue = stockService.getTotalStockValue();
        Map<String, Double> response = new HashMap<>();
        response.put("totalStockValue", totalValue);
        return ResponseEntity.ok(response);
    }

    /**
     * Recalculer tous les CMP
     */
    @PostMapping("/recalculate-cmp")
    @Operation(summary = "Recalculer les CMP de tous les produits")
    public ResponseEntity<Map<String, String>> recalculateCmp() {
        try {
            stockService.recalculateAllCmp();
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Les CMP ont été recalculés avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Erreur lors du recalcul des CMP : " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
