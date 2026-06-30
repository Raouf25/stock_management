package com.example.stock_management.dto;

import com.example.stock_management.model.UserRole;

import java.time.LocalDateTime;

public record UserSummaryDTO(
        Long id,
        String email,
        String fullName,
        UserRole role,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime lastLogin
) {}
