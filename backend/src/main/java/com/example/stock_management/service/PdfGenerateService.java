package com.example.stock_management.service;

import jakarta.servlet.http.HttpServletResponse;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.util.Map;

import com.lowagie.text.DocumentException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfGenerateService {

    private static final String TEMPLATE_NAME = "facture";
    private static final String PDF_TEMPLATES_PATH = "pdf-templates/";

    private final TemplateEngine templateEngine;
    private final com.example.stock_management.util.NumberUtils numberUtils;

    /**
     * Génère un PDF et l'écrit directement dans la réponse HTTP
     */
    public void generatePdfFileAPI(Map<String, Object> data, HttpServletResponse response) {
        try {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + TEMPLATE_NAME + ".pdf\"");
            
            generatePdf(data, response.getOutputStream());
        } catch (IOException e) {
            log.error("Erreur lors de l'écriture du PDF dans la réponse: {}", e.getMessage(), e);
        }
    }

    /**
     * Génère un PDF et retourne les bytes (pour envoi par email)
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

    /**
     * Méthode centrale pour la génération du PDF
     */
    private void generatePdf(Map<String, Object> data, OutputStream outputStream) {
        String htmlContent = processTemplate(data);
        
        try {
            ITextRenderer renderer = createRenderer(htmlContent);
            renderer.createPDF(outputStream, false);
            renderer.finishPDF();
        } catch (DocumentException e) {
            log.error("Erreur lors du rendu PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    /**
     * Traite le template Thymeleaf et retourne le HTML
     */
    private String processTemplate(Map<String, Object> data) {
        Context context = new Context();
        context.setVariables(data);
        context.setVariable("numbers", numberUtils);

        return templateEngine.process(TEMPLATE_NAME, context);
    }

    /**
     * Crée et configure le renderer PDF
     */
    private ITextRenderer createRenderer(String htmlContent) {
        ITextRenderer renderer = new ITextRenderer();
        String baseUrl = resolveBaseUrl();

        if (baseUrl != null) {
            renderer.setDocumentFromString(htmlContent, baseUrl);
        } else {
            renderer.setDocumentFromString(htmlContent);
        }

        renderer.layout();
        return renderer;
    }

    /**
     * Résout l'URL de base pour les ressources (CSS, images)
     */
    private String resolveBaseUrl() {
        try {
            java.net.URL res = this.getClass().getClassLoader().getResource(PDF_TEMPLATES_PATH);
            if (res != null) {
                String baseUrl = res.toExternalForm();
                log.debug("Using baseUrl for PDF resources: {}", baseUrl);
                return baseUrl;
            }
            log.warn("Could not resolve pdf-templates resource directory on classpath");
        } catch (Exception ex) {
            log.warn("Failed to resolve baseUrl for pdf resources", ex);
        }
        return null;
    }
}
