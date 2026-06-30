package com.example.stock_management.api;

import com.example.stock_management.dto.UserCreateDTO;
import com.example.stock_management.dto.UserSummaryDTO;
import com.example.stock_management.dto.UserUpdateDTO;
import com.example.stock_management.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestion des utilisateurs (ADMIN uniquement)")
public class UserController {

    private final UserManagementService userManagementService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Liste paginée des utilisateurs avec recherche optionnelle")
    public Page<UserSummaryDTO> getUsers(
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "20") int    size,
            @RequestParam(required = false)    String search
    ) {
        return userManagementService.getUsers(page, size, search);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Détail d'un utilisateur")
    public UserSummaryDTO getUser(@PathVariable Long id) {
        return userManagementService.getUser(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un utilisateur")
    public ResponseEntity<UserSummaryDTO> createUser(@Valid @RequestBody UserCreateDTO dto) {
        final UserSummaryDTO created = userManagementService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Modifier email / nom / rôle d'un utilisateur")
    public UserSummaryDTO updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDTO dto
    ) {
        return userManagementService.updateUser(id, dto);
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activer ou désactiver un utilisateur")
    public UserSummaryDTO toggleStatus(@PathVariable Long id) {
        return userManagementService.toggleStatus(id);
    }

    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Réinitialiser le mot de passe d'un utilisateur")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        final String newPassword = body.get("newPassword");
        userManagementService.resetPassword(id, newPassword);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un utilisateur")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userManagementService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
