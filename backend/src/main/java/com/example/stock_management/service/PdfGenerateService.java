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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class PdfGenerateService {

    private static final String TEMPLATE_NAME = "facture_v3";

    /**
     * Résolution du chemin Chromium selon l'environnement :
     *
     *  1. Variable d'env PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH (Docker/Railway)
     *     → chemin fixe défini dans le Dockerfile
     *
     *  2. Chemins système connus (Linux, macOS)
     *     → détection automatique sur la machine du développeur
     *
     *  3. null → Playwright télécharge son propre Chromium dans ~/.cache/ms-playwright
     *     (premier lancement uniquement, mis en cache ensuite)
     */
    private static final Path CHROMIUM_PATH = resolveChromiumPath();

    private static Path resolveChromiumPath() {
        // Priorité 1 : variable d'environnement (Docker / Railway)
        String envPath = System.getenv("PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH");
        if (envPath != null && !envPath.isBlank()) {
            Path p = Paths.get(envPath);
            if (Files.isExecutable(p)) {
                log.info("[Playwright] Chromium via env: {}", p);
                return p;
            }
            log.warn("[Playwright] PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH défini mais introuvable: {}", envPath);
        }

        // Priorité 2 : chemins système communs (Linux + macOS)
        List<String> candidates = List.of(
                // Linux (Debian/Ubuntu)
                "/usr/bin/chromium",
                "/usr/bin/chromium-browser",
                "/usr/bin/google-chrome-stable",
                "/usr/bin/google-chrome",
                // macOS (Homebrew)
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "/Applications/Chromium.app/Contents/MacOS/Chromium",
                "/opt/homebrew/bin/chromium"
        );

        Optional<Path> found = candidates.stream()
                .map(Paths::get)
                .filter(Files::isExecutable)
                .findFirst();

        if (found.isPresent()) {
            log.info("[Playwright] Chromium système trouvé: {}", found.get());
            return found.get();
        }

        // Priorité 3 : laisser Playwright gérer (téléchargement automatique)
        log.info("[Playwright] Aucun Chromium système trouvé — Playwright utilisera son propre Chromium (~/.cache/ms-playwright)");
        return null;
    }

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

    public void generatePdfFileAPI(Map<String, Object> data, HttpServletResponse response) {
        generatePdfFileAPI(data, response, TEMPLATE_NAME);
    }

    public void generatePdfFileAPI(Map<String, Object> data, HttpServletResponse response, String templateName) {
        try {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + templateName + ".pdf\"");
            generatePdf(data, response.getOutputStream(), templateName);
        } catch (IOException e) {
            log.error("Erreur lors de l'écriture du PDF dans la réponse: {}", e.getMessage(), e);
        }
    }

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

    private void generatePdf(Map<String, Object> data, OutputStream outputStream, String templateName) {
        String htmlContent = processTemplate(data, templateName);

        try (Playwright playwright = Playwright.create()) {

            BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
                    .setHeadless(true)
                    .setArgs(List.of(
                            "--no-sandbox",
                            "--disable-dev-shm-usage",
                            "--disable-gpu",
                            "--disable-setuid-sandbox"
                    ));

            // Chemin fixe seulement si résolu — sinon Playwright utilise le sien
            if (CHROMIUM_PATH != null) {
                options.setExecutablePath(CHROMIUM_PATH);
            }

            Browser browser = playwright.chromium().launch(options);

            try (BrowserContext context = browser.newContext();
                 Page page = context.newPage()) {

                page.setContent(htmlContent,
                        new Page.SetContentOptions()
                                .setWaitUntil(WaitUntilState.LOAD));

                page.emulateMedia(
                        new Page.EmulateMediaOptions()
                                .setMedia(Media.PRINT));

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
     * Génère et retourne le contenu HTML brut d'une facture sous forme de String.
     *
     * @param data Les données requises par le template Thymeleaf (totaux, produits, client, etc.)
     * @return La page HTML complète calculée par le moteur de rendu
     */
    public String generateHtmlPreview(Map<String, Object> data) {
        return processTemplate(data, TEMPLATE_NAME);
    }
}