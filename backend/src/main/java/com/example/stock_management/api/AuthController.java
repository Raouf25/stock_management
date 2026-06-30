package com.example.stock_management.api;

import com.example.stock_management.dto.auth.*;
import com.example.stock_management.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse httpResponse) {
        AuthResponse response = authService.register(request);
        if (response.isSuccess()) {
            issueRefreshCookie(response, httpResponse);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse httpResponse) {
        AuthResponse response = authService.login(request);
        if (response.isSuccess()) {
            issueRefreshCookie(response, httpResponse);
            return ResponseEntity.ok(response);
        }
        if ("INVALID_CREDENTIALS".equals(response.getErrorCode())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshTokenCookie(request);
        if (refreshToken == null) {
            return ResponseEntity.badRequest().body(AuthResponse.error("Refresh token manquant"));
        }
        AuthResponse authResponse = authService.refreshAccessToken(refreshToken);
        if (authResponse.isSuccess()) {
            issueRefreshCookie(authResponse, response);
            return ResponseEntity.ok(authResponse);
        }
        return ResponseEntity.badRequest().body(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        authService.clearRefreshTokenCookie(response);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        AuthResponse authResponse = authService.resetPassword(request);
        return authResponse.isSuccess()
                ? ResponseEntity.ok(authResponse)
                : ResponseEntity.badRequest().body(authResponse);
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<AuthResponse> validateResetToken(@RequestParam String token) {
        AuthResponse authResponse = authService.validateResetToken(token);
        return authResponse.isSuccess()
                ? ResponseEntity.ok(authResponse)
                : ResponseEntity.badRequest().body(authResponse);
    }

    private void issueRefreshCookie(AuthResponse authResponse, HttpServletResponse response) {
        String userEmail = authResponse.getUser() != null ? authResponse.getUser().getEmail() : null;
        Long userId = authResponse.getUser() != null ? authResponse.getUser().getId() : null;
        if (userEmail != null && userId != null) {
            String refreshToken = authService.buildRefreshTokenForCredentials(userId, userEmail);
            authService.setRefreshTokenCookie(response, refreshToken);
        }
    }

    private String extractRefreshTokenCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if ("refreshToken".equals(c.getName())) return c.getValue();
        }
        return null;
    }
}
