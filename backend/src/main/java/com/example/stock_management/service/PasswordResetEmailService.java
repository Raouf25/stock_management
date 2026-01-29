package com.example.stock_management.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@stockmanagement.com}")
    private String fromEmail;

    @Async
    public void sendResetEmail(String to, String userName, String resetLink) {
        // ⚠️ LOG POUR TEST - Affiche le lien dans la console (à retirer en production)
        log.info("═══════════════════════════════════════════════════════════════");
        log.info("🔑 LIEN DE RÉINITIALISATION DE MOT DE PASSE");
        log.info("📧 Email: {}", to);
        log.info("👤 Utilisateur: {}", userName);
        log.info("🔗 Lien: {}", resetLink);
        log.info("═══════════════════════════════════════════════════════════════");
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Réinitialisation de votre mot de passe - Stock Management");
            helper.setText(buildEmailContent(userName, resetLink), true);

            mailSender.send(message);
            log.info("Email de réinitialisation envoyé à {}", to);
        } catch (MessagingException e) {
            log.warn("Email non envoyé (SMTP non configuré?). Utilisez le lien ci-dessus pour tester.");
            log.debug("Erreur SMTP: {}", e.getMessage());
        }
    }

    private String buildEmailContent(String userName, String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); 
                              color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; 
                              background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); 
                              color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { color: #e74c3c; font-size: 13px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Réinitialisation du mot de passe</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>%s</strong>,</p>
                        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                        <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button">Réinitialiser mon mot de passe</a>
                        </p>
                        <p class="warning"><strong>⚠️ Ce lien expire dans 1 heure.</strong></p>
                        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                        <div class="footer">
                            <p>© 2024 Stock Management - Tous droits réservés</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, resetLink);
    }
}
