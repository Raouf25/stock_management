package com.example.stock_management.dto;

import com.example.stock_management.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserUpdateDTO(
        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        String email,

        @NotBlank(message = "Le nom complet est obligatoire")
        String fullName,

        @NotNull(message = "Le rôle est obligatoire")
        UserRole role
) {}
