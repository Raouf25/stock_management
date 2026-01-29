package com.example.stock_management.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import java.io.UnsupportedEncodingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:facturation@entreprise.com}")
    private String fromEmail;

    @Value("${app.mail.from-name:Service Facturation}")
    private String fromName;

    /**
     * Envoie un email avec une pièce jointe PDF
     *
     * @param to          Adresse email du destinataire
     * @param subject     Sujet de l'email
     * @param body        Corps du message (HTML supporté)
     * @param pdfBytes    Contenu PDF en bytes
     * @param pdfFileName Nom du fichier PDF joint
     */
    public void sendEmailWithPdfAttachment(String to, String subject, String body, byte[] pdfBytes, String pdfFileName) throws MessagingException, UnsupportedEncodingException {
        log.info("Envoi d'email à {} avec pièce jointe {}", to, pdfFileName);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true); // true = HTML

        // Ajouter la pièce jointe PDF
        helper.addAttachment(pdfFileName, new ByteArrayResource(pdfBytes), "application/pdf");

        mailSender.send(message);
        log.info("Email envoyé avec succès à {}", to);
    }

    /**
     * Envoie un email simple sans pièce jointe
     */
    public void sendSimpleEmail(String to, String subject, String body) throws MessagingException, UnsupportedEncodingException {
        log.info("Envoi d'email simple à {}", to);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true);

        mailSender.send(message);
        log.info("Email envoyé avec succès à {}", to);
    }
}
