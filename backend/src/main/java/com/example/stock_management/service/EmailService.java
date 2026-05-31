package com.example.stock_management.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Service d'envoi d'email via Resend API — factures, BL, notifications.
 * Remplace JavaMailSender (SMTP) par des appels HTTP REST.
 * Doc : https://resend.com/docs/api-reference/emails/send-email
 */
@Slf4j
@Service
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from-email:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${resend.from-name:Stock ERP}")
    private String fromName;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Envoie un email avec une pièce jointe PDF (facture, bon de livraison, etc.)
     *
     * @param to          Adresse email du destinataire
     * @param subject     Sujet de l'email
     * @param body        Corps du message (HTML supporté)
     * @param pdfBytes    Contenu PDF en bytes
     * @param pdfFileName Nom du fichier PDF joint
     */
    @Async
    public void sendEmailWithPdfAttachment(String to, String subject, String body, byte[] pdfBytes, String pdfFileName) {
        log.info("════════════════════════════════════════════════════════");
        log.info("📧 Envoi email via Resend avec PDF");
        log.info("📧 Destinataire : {}", to);
        log.info("📎 Pièce jointe : {} ({} bytes)", pdfFileName, pdfBytes.length);
        log.info("════════════════════════════════════════════════════════");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            // Encoder le PDF en Base64 (requis par Resend)
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);

            Map<String, Object> attachment = Map.of(
                    "filename", pdfFileName,
                    "content",  pdfBase64,
                    "type",     "application/pdf"
            );

            Map<String, Object> emailBody = Map.of(
                    "from",        fromName + " <" + fromEmail + ">",
                    "to",          List.of(to),
                    "subject",     subject,
                    "html",        body,
                    "attachments", List.of(attachment)
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(RESEND_API_URL, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Email avec PDF envoyé avec succès à {} (id={})",
                        to, response.getBody() != null ? response.getBody().get("id") : "?");
            } else {
                log.error("❌ Resend a retourné {} pour {}", response.getStatusCode(), to);
            }

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi d'email avec PDF à {} : {}", to, e.getMessage());
            throw new RuntimeException("Échec d'envoi d'email avec PDF via Resend", e);
        }
    }

    /**
     * Envoie un email simple sans pièce jointe
     */
    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        log.info("📧 Envoi email simple via Resend à {}", to);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> emailBody = Map.of(
                    "from",    fromName + " <" + fromEmail + ">",
                    "to",      List.of(to),
                    "subject", subject,
                    "html",    body
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(RESEND_API_URL, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Email simple envoyé avec succès à {} (id={})",
                        to, response.getBody() != null ? response.getBody().get("id") : "?");
            } else {
                log.error("❌ Resend a retourné {} pour {}", response.getStatusCode(), to);
            }

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi d'email simple à {} : {}", to, e.getMessage());
            throw new RuntimeException("Échec d'envoi d'email simple via Resend", e);
        }
    }
}
