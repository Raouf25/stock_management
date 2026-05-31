package com.example.stock_management.service;

import lombok.extern.slf4j.Slf4j;
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

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void sendResetEmail(String to, String userName, String resetLink) {
        log.info("════════════════════════════════════════════════════════");
        log.info("📨 Envoi email de réinitialisation via Resend");
        log.info("📧 Destinataire : {}", to);
        log.info("🔗 Lien         : {}", resetLink);
        log.info("════════════════════════════════════════════════════════");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = Map.of(
                    "from",    fromName + " <" + fromEmail + ">",
                    "to",      List.of(to),
                    "subject", "Réinitialisation de votre mot de passe — Stock ERP",
                    "html",    buildEmailHtml(userName, resetLink)
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

    private String buildEmailHtml(String userName, String resetLink) {
        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>Réinitialisation mot de passe</title>
            </head>
            <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#f3f4f6;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" role="presentation"
                           style="max-width:600px;width:100%%;background:white;border-radius:16px;
                                  overflow:hidden;box-shadow:0 4px 24px rgba(67,56,202,0.10);">

                      <!-- Header gradient -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#4338ca 0%%,#7c3aed 100%%);
                                   padding:40px 40px 32px;text-align:center;">
                          <p style="margin:0 0 12px;font-size:40px;line-height:1;">🔐</p>
                          <h1 style="margin:0;font-size:22px;font-weight:700;color:white;
                                     letter-spacing:-0.02em;">
                            Réinitialisation du mot de passe
                          </h1>
                          <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">
                            Stock ERP — Gestion de stock
                          </p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px;">
                          <p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.6;">
                            Bonjour <strong>%s</strong>,
                          </p>
                          <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.7;">
                            Vous avez demandé la réinitialisation de votre mot de passe.
                            Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
                          </p>

                          <!-- CTA Button -->
                          <table cellpadding="0" cellspacing="0" role="presentation" width="100%%">
                            <tr>
                              <td align="center" style="padding:0 0 32px;">
                                <a href="%s"
                                   style="display:inline-block;padding:15px 40px;
                                          background:linear-gradient(135deg,#4338ca,#7c3aed);
                                          color:white;text-decoration:none;font-size:16px;
                                          font-weight:600;border-radius:10px;
                                          box-shadow:0 4px 14px rgba(109,40,217,0.35);">
                                  Réinitialiser mon mot de passe
                                </a>
                              </td>
                            </tr>
                          </table>

                          <!-- Warning box -->
                          <table cellpadding="0" cellspacing="0" role="presentation" width="100%%">
                            <tr>
                              <td style="background:#fef3c7;border-left:4px solid #f59e0b;
                                         padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                                <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">
                                  ⏰ Ce lien expire dans <strong>1 heure</strong>.
                                </p>
                              </td>
                            </tr>
                          </table>

                          <br/>

                          <!-- Fallback link -->
                          <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
                            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
                          </p>
                          <p style="margin:0;font-size:11px;color:#6d28d9;word-break:break-all;">
                            %s
                          </p>

                          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;"/>

                          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                            Votre mot de passe reste inchangé.
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background:#f9fafb;padding:20px 40px;
                                   border-top:1px solid #e5e7eb;text-align:center;">
                          <p style="margin:0;font-size:11px;color:#9ca3af;">
                            © 2026 Stock ERP — Tous droits réservés
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(userName, resetLink, resetLink);
    }
}
