package com.example.stock_management.service;

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

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetEmailService emailService;

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

    public AuthResponse login(LoginRequest request) {
        // Rechercher l'utilisateur
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return AuthResponse.error("Email ou mot de passe incorrect");
        }

        if (!user.isEnabled()) {
            return AuthResponse.error("Ce compte a été désactivé");
        }

        // Mettre à jour la dernière connexion
        user.setLastLogin(LocalDateTime.now());
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

    private AuthResponse buildAuthResponse(String message, User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getName(),
                user.getRole() != null ? user.getRole().name() : "USER");
        
        AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();

        return AuthResponse.success(message, token, userInfo);
    }
}
