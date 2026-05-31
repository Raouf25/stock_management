package com.example.stock_management.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Service d'envoi d'email via l'API HTTP Resend.
 * Doc : https://resend.com/docs/api-reference/emails/send-email
 */
@Slf4j
@Service
public class PasswordResetEmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from-email:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${resend.from-name:Stock ERP}")
    private String fromName;

    private final RestTemplate restTemplate;
    private final EmailTemplateService emailTemplateService;

    @Autowired
    public PasswordResetEmailService(EmailTemplateService emailTemplateService) {
        this.restTemplate = new RestTemplate();
        this.emailTemplateService = emailTemplateService;
    }

    @Async
    public void sendResetEmail(String to, String userName, String resetLink) {
        log.info("════════════════════════════════════════════════════════");
        log.info("📨 Envoi email de réinitialisation via Resend");
        log.info("📧 Destinataire : {}", to);
        log.info("🔗 Lien         : {}", resetLink);
        log.info("════════════════════════════════════════════════════════");

        try {
            // Génération du HTML avec le template Thymeleaf
            String emailHtml = emailTemplateService.renderPasswordResetEmail(userName, resetLink);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = Map.of(
                    "from",    fromName + " <" + fromEmail + ">",
                    "to",      List.of(to),
                    "subject", "🔐 Réinitialisation de votre mot de passe — Stock ERP",
                    "html",    emailHtml
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(RESEND_API_URL, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Email envoyé avec succès via Resend à {} (id={})",
                        to, response.getBody() != null ? response.getBody().get("id") : "?");
            } else {
                log.error("❌ Resend a retourné {} pour {}", response.getStatusCode(), to);
            }

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'appel Resend pour {} : {}", to, e.getMessage());
            log.warn("⚠️  Lien de réinitialisation (test local) : {}", resetLink);
        }
    }
}
