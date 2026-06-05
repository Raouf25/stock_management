package com.example.stock_management.service;

import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.Margin;
import com.microsoft.playwright.options.Media;
import com.microsoft.playwright.options.WaitUntilState;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@Slf4j
@Service
public class PdfGenerateService {

    private static final String TEMPLATE_NAME = "facture";

    private final SpringTemplateEngine templateEngine;
    private final com.example.stock_management.util.NumberUtils numberUtils;

    @Autowired
    public PdfGenerateService(@Qualifier("pdfTemplateEngine") SpringTemplateEngine templateEngine,
                              com.example.stock_management.util.NumberUtils numberUtils) {
        this.templateEngine = templateEngine;
        this.numberUtils = numberUtils;
    }

    // -------------------------------------------------------------------------
    // API publique
    // -------------------------------------------------------------------------

    /**
     * Génère un PDF et l'écrit directement dans la réponse HTTP (template par défaut).
     */
    public void generatePdfFileAPI(Map<String, Object> data, HttpServletResponse response) {
        generatePdfFileAPI(data, response, TEMPLATE_NAME);
    }

    /**
     * Génère un PDF avec un template spécifique et l'écrit dans la réponse HTTP.
     */
    public void generatePdfFileAPI(Map<String, Object> data, HttpServletResponse response, String templateName) {
        try {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + templateName + ".pdf\"");
            generatePdf(data, response.getOutputStream(), templateName);
        } catch (IOException e) {
            log.error("Erreur lors de l'écriture du PDF dans la réponse: {}", e.getMessage(), e);
        }
    }

    /**
     * Génère un PDF et retourne les bytes (pour envoi par email, etc.).
     */
    public byte[] generatePdfToBytes(Map<String, Object> data) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            generatePdf(data, outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            log.error("Erreur lors de la génération du PDF en bytes: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    // -------------------------------------------------------------------------
    // Génération interne via Playwright
    // -------------------------------------------------------------------------

    private void generatePdf(Map<String, Object> data, OutputStream outputStream) {
        generatePdf(data, outputStream, TEMPLATE_NAME);
    }

    /**
     * Méthode centrale : traite le template Thymeleaf puis génère le PDF via Playwright.
     */
    private void generatePdf(Map<String, Object> data, OutputStream outputStream, String templateName) {
        String htmlContent = processTemplate(data, templateName);

        try (Playwright playwright = Playwright.create()) {

            BrowserType.LaunchOptions launchOptions = new BrowserType.LaunchOptions()
                    .setHeadless(true)
                    .setArgs(List.of("--no-sandbox", "--disable-dev-shm-usage"));

            // Si Playwright n'a pas son propre Chromium, utiliser le Chrome/Chromium système
            resolveSystemChromium().ifPresent(launchOptions::setExecutablePath);

            Browser browser = playwright.chromium().launch(launchOptions);

            try (BrowserContext context = browser.newContext();
                 Page page = context.newPage()) {

                // Charge le HTML directement en mémoire
                page.setContent(htmlContent,
                        new Page.SetContentOptions()
                                .setWaitUntil(WaitUntilState.LOAD));

                // Active les règles CSS @media print
                page.emulateMedia(
                        new Page.EmulateMediaOptions()
                                .setMedia(Media.PRINT));

                // Marges via com.microsoft.playwright.options.Margin
                Margin margin = new Margin()
                        .setTop("10mm")
                        .setBottom("10mm")
                        .setLeft("10mm")
                        .setRight("10mm");

                byte[] pdfBytes = page.pdf(
                        new Page.PdfOptions()
                                .setFormat("A4")
                                .setPrintBackground(true)
                                .setMargin(margin));

                outputStream.write(pdfBytes);

            } finally {
                browser.close();
            }

        } catch (IOException e) {
            log.error("Erreur I/O lors de la génération PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        } catch (Exception e) {
            log.error("Erreur Playwright lors de la génération PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    // -------------------------------------------------------------------------
    // Traitement Thymeleaf
    // -------------------------------------------------------------------------

    private String processTemplate(Map<String, Object> data, String templateName) {
        Context context = new Context();
        context.setVariables(data);
        context.setVariable("numbers", numberUtils);
        return templateEngine.process(templateName, context);
    }

    /**
     * Cherche un exécutable Chromium/Chrome installé sur le système.
     * Utilisé comme fallback si Playwright n'a pas téléchargé son propre Chromium.
     */
    private Optional<java.nio.file.Path> resolveSystemChromium() {
        List<String> candidates = List.of(
                "/usr/bin/chromium",
                "/usr/bin/chromium-browser",
                "/usr/bin/google-chrome",
                "/usr/bin/google-chrome-stable",
                "/snap/bin/chromium"
        );
        return candidates.stream()
                .map(java.nio.file.Paths::get)
                .filter(java.nio.file.Files::isExecutable)
                .findFirst()
                .map(p -> {
                    log.info("Playwright: utilisation du Chromium système: {}", p);
                    return p;
                });
    }
}