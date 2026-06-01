package com.example.stock_management.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

/**
 * Service de rendu des templates d'emails avec Thymeleaf.
 * Tous les templates sont dans resources/email-templates/
 */
@Slf4j
@Service
public class EmailTemplateService {

    private final SpringTemplateEngine templateEngine;

    @Autowired
    public EmailTemplateService(@Qualifier("emailTemplateEngine") SpringTemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    /**
     * Rend un template d'email avec les variables fournies
     *
     * @param templateName Nom du fichier template (sans .html)
     * @param variables    Variables à injecter dans le template
     * @return HTML rendu
     */
    public String renderTemplate(String templateName, Map<String, Object> variables) {
        log.debug("📝 Rendu du template email : {}", templateName);
        Context context = new Context();
        context.setVariables(variables);
        // Le resolver a déjà le préfixe "email-templates/" configuré
        return templateEngine.process(templateName, context);
    }

    /**
     * Génère l'email de réinitialisation de mot de passe
     */
    public String renderPasswordResetEmail(String userName, String resetLink) {
        return renderTemplate("password-reset", Map.of(
                "userName", userName,
                "resetLink", resetLink
        ));
    }

    /**
     * Génère l'email de notification de facture
     */
    public String renderInvoiceNotification(String customerName, String billNumber,
                                           String billDate, String totalAmount) {
        return renderTemplate("invoice-notification", Map.of(
                "customerName", customerName,
                "billNumber", billNumber,
                "billDate", billDate,
                "totalAmount", totalAmount
        ));
    }

    /**
     * Génère l'email de notification de bon de livraison
     */
    public String renderDeliveryNoteNotification(String customerName, String deliveryNoteNumber,
                                                 String deliveryDate, String recipientName) {
        return renderTemplate("delivery-note-notification", Map.of(
                "customerName", customerName,
                "deliveryNoteNumber", deliveryNoteNumber,
                "deliveryDate", deliveryDate,
                "recipientName", recipientName != null ? recipientName : ""
        ));
    }

    /**
     * Génère un email de notification générique
     */
    public String renderGenericNotification(String icon, String title, String greeting,
                                           String message, String footer,
                                           String ctaText, String ctaLink) {
        Map<String, Object> vars = new java.util.HashMap<>();
        vars.put("icon", icon != null ? icon : "📧");
        vars.put("title", title);
        vars.put("greeting", greeting);
        vars.put("message", message);
        vars.put("footer", footer);

        if (ctaText != null && ctaLink != null) {
            vars.put("ctaText", ctaText);
            vars.put("ctaLink", ctaLink);
        }

        return renderTemplate("generic-notification", vars);
    }
}
