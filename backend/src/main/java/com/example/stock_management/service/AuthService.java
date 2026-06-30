package com.example.stock_management.service;

import com.example.stock_management.api.AccountLockedException;
import com.example.stock_management.dto.auth.*;
import com.example.stock_management.model.PasswordResetToken;
import com.example.stock_management.model.User;
import com.example.stock_management.repository.PasswordResetTokenRepository;
import com.example.stock_management.repository.UserRepository;
import com.example.stock_management.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetEmailService emailService;
    private final Clock clock;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.error("Un compte avec cet email existe déjà");
        }

        // Créer l'utilisateur
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);
        log.info("Nouvel utilisateur inscrit: {}", user.getEmail());

        // Générer le token et retourner la réponse
        return buildAuthResponse("Inscription réussie", user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        final LocalDateTime now = LocalDateTime.now(clock);

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        // Return a generic error when the user does not exist to avoid email enumeration
        if (user == null) {
            log.debug("Tentative de connexion pour un email inconnu: {}", request.getEmail());
            return AuthResponse.error("Email ou mot de passe incorrect");
        }

        // Check account lock state
        if (user.getLockedUntil() != null) {
            if (user.getLockedUntil().isAfter(now)) {
                long minutesRemaining = Math.max(1, Duration.between(now, user.getLockedUntil()).toMinutes());
                log.warn("Tentative de connexion sur un compte verrouillé: {}", user.getEmail());
                throw new AccountLockedException(user.getLockedUntil(), minutesRemaining);
            } else {
                // Lock has expired — auto-unlock
                log.info("Déverrouillage automatique du compte: {}", user.getEmail());
                user.setLockedUntil(null);
                user.setFailedLoginAttempts(0);
            }
        }

        if (!user.isEnabled()) {
            return AuthResponse.error("Ce compte a été désactivé");
        }

        // Wrong password — increment failure counter
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= MAX_ATTEMPTS) {
                LocalDateTime lockExpiry = now.plusMinutes(LOCK_DURATION_MINUTES);
                user.setLockedUntil(lockExpiry);
                userRepository.save(user);
                log.warn("Compte verrouillé après {} tentatives échouées: {}", attempts, user.getEmail());
                throw new AccountLockedException(lockExpiry, LOCK_DURATION_MINUTES);
            }

            userRepository.save(user);
            int remaining = MAX_ATTEMPTS - attempts;
            String plural = remaining > 1 ? "s" : "";
            log.warn("Mot de passe incorrect pour {}: tentative {}/{}", user.getEmail(), attempts, MAX_ATTEMPTS);
            return AuthResponse.invalidCredentials(
                    "Mot de passe incorrect. " + remaining + " tentative" + plural + " restante" + plural + ".",
                    remaining
            );
        }

        // Successful login — reset failure counter and update last login
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLogin(now);
        userRepository.save(user);

        log.info("Connexion réussie: {}", user.getEmail());
        return buildAuthResponse("Connexion réussie", user);
    }

    @Transactional
    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        log.info("═══════════════════════════════════════════════════════════════");
        log.info("📨 Demande de réinitialisation de mot de passe reçue");
        log.info("📧 Email demandé: {}", request.getEmail());
        
        // Toujours retourner succès pour éviter l'énumération des emails
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null) {
            log.info("✅ Utilisateur trouvé: {} (ID: {})", user.getName(), user.getId());
            
            // Supprimer les anciens tokens
            resetTokenRepository.deleteByUser(user);

            // Créer un nouveau token
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .build();
            resetTokenRepository.save(resetToken);

            // Envoyer l'email
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            log.info("🔗 Lien de réinitialisation généré: {}", resetLink);
            
            emailService.sendResetEmail(user.getEmail(), user.getName(), resetLink);
            
            log.info("📧 Email de réinitialisation envoyé à: {}", user.getEmail());
        } else {
            log.warn("❌ Aucun utilisateur trouvé avec l'email: {}", request.getEmail());
        }
        
        log.info("═══════════════════════════════════════════════════════════════");

        return AuthResponse.success("Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.");
    }

    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = resetTokenRepository
                .findByTokenAndUsedFalse(request.getToken())
                .orElse(null);

        if (resetToken == null || !resetToken.isValid()) {
            return AuthResponse.error("Le lien de réinitialisation est invalide ou a expiré");
        }

        // Mettre à jour le mot de passe
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Marquer le token comme utilisé
        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        log.info("Mot de passe réinitialisé pour: {}", user.getEmail());
        return AuthResponse.success("Mot de passe réinitialisé avec succès");
    }

    public AuthResponse validateResetToken(String token) {
        PasswordResetToken resetToken = resetTokenRepository
                .findByTokenAndUsedFalse(token)
                .orElse(null);

        if (resetToken == null || !resetToken.isValid()) {
            return AuthResponse.error("Le lien est invalide ou a expiré");
        }

        return AuthResponse.success("Token valide");
    }

    public AuthResponse buildAuthResponse(String message, User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getName(),
                user.getRole() != null ? user.getRole().name() : "USER");

        AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .build();

        return AuthResponse.success(message, token, userInfo);
    }

    public String buildRefreshToken(User user) {
        return jwtService.generateRefreshToken(user.getId(), user.getEmail());
    }

    public String buildRefreshTokenForCredentials(Long userId, String email) {
        return jwtService.generateRefreshToken(userId, email);
    }

    public void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        int maxAgeSeconds = (int) (jwtService.getRefreshExpirationMs() / 1000);
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(maxAgeSeconds);
        response.addCookie(cookie);
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    public AuthResponse refreshAccessToken(String refreshToken) {
        if (!jwtService.validateToken(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
            return AuthResponse.error("Refresh token invalide ou expiré");
        }
        String email = jwtService.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null || !user.isEnabled()) {
            return AuthResponse.error("Utilisateur introuvable ou désactivé");
        }
        return buildAuthResponse("Token renouvelé", user);
    }
}
