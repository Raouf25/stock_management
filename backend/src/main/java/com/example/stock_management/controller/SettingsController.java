package com.example.stock_management.controller;

import com.example.stock_management.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur REST pour les paramètres de l'application.
 * GET : accessible à tout utilisateur authentifié.
 * PUT : réservé aux administrateurs.
 */
@RestController
@RequestMapping("/api/settings")
@Tag(name = "Settings", description = "Application settings management")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    @Operation(summary = "Obtenir tous les paramètres de l'application")
    public ResponseEntity<Map<String, String>> getSettings() {
        return ResponseEntity.ok(settingsService.getAll());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour les paramètres de l'application (ADMIN uniquement)")
    public ResponseEntity<Map<String, String>> updateSettings(
            @RequestBody Map<String, String> settings) {
        return ResponseEntity.ok(settingsService.update(settings));
    }
}
