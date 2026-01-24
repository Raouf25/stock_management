package com.example.stock_management.service;

import jakarta.servlet.http.HttpServletResponse;

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

    private final TemplateEngine templateEngine;
    private final com.example.stock_management.util.NumberUtils numberUtils;
//
//    @Value("${pdf.directory}")
//    private String pdfDirectory;
//
//    public void generatePdfFile(String templateName, Map<String, Object> data, String pdfFileName) {
//        Context context = new Context();
//        context.setVariables(data);
//
//        String htmlContent = templateEngine.process(templateName, context);
//        try {
//            FileOutputStream fileOutputStream = new FileOutputStream(pdfDirectory + pdfFileName);
//            ITextRenderer renderer = new ITextRenderer();
//            renderer.setDocumentFromString(htmlContent);
//            renderer.layout();
//            renderer.createPDF(fileOutputStream, false);
//            renderer.finishPDF();
//        } catch (FileNotFoundException e) {
//            logger.error(e.getMessage(), e);
//        } catch (DocumentException e) {
//            logger.error(e.getMessage(), e);
//        }
//    }


    public void generatePdfFileAPI( Map<String, Object> data, HttpServletResponse response) {
        Context context = new Context();
        context.setVariables(data);
        // expose NumberUtils to template as 'numbers' variable
        context.setVariable("numbers", numberUtils);

        String templateName = "facture";
        // process template (no Thymeleaf expressions expected) and then substitute placeholders
        String htmlContent = templateEngine.process(templateName, context);

        // If products placeholder exists, build rows from data map
        Object productsObj = data.get("products");
        if (productsObj instanceof java.util.List) {
            @SuppressWarnings("unchecked")
            java.util.List<java.util.Map<String, Object>> products = (java.util.List<java.util.Map<String, Object>>) productsObj;
            StringBuilder rows = new StringBuilder();
            int idx = 1;
            for (java.util.Map<String, Object> p : products) {
                rows.append("<tr>");
                rows.append("<td>").append(idx++).append("</td>");
                rows.append("<td>").append(p.getOrDefault("productRef", "")).append("</td>");
                rows.append("<td>").append(p.getOrDefault("productName", "")).append("</td>");
                rows.append("<td>").append(p.getOrDefault("quantity", "")).append("</td>");
                rows.append("<td>").append(p.getOrDefault("unitPriceFormatted", "")).append("</td>");
                rows.append("<td>").append(p.getOrDefault("discountFormatted", "0.000 DNT")).append("</td>");
                rows.append("<td>").append(p.getOrDefault("totalPriceFormatted", "")).append("</td>");
                rows.append("<td>").append(p.getOrDefault("vatRate", "")).append("</td>");
                rows.append("<td>").append(p.getOrDefault("vatAmountFormatted", "")).append("</td>");
                rows.append("<td>").append(p.getOrDefault("totalWithVatFormatted", p.getOrDefault("totalPriceFormatted", ""))).append("</td>");
                rows.append("</tr>");
            }
            htmlContent = htmlContent.replace("{{PRODUCTS_ROWS}}", rows.toString());
        }

        // Replace simple placeholders {{key}} with string values from data
        for (java.util.Map.Entry<String, Object> e : data.entrySet()) {
            String key = e.getKey();
            Object val = e.getValue();
            if (val == null) continue;
            if (val instanceof String || val instanceof Number) {
                htmlContent = htmlContent.replace("{{" + key + "}}", val.toString());
            }
        }
        
        // Debug: save HTML to file
        try {
            java.nio.file.Files.writeString(
                java.nio.file.Paths.get("/tmp/facture_generated.html"), 
                htmlContent
            );
            log.info("=== HTML saved to /tmp/facture_generated.html ===");
            log.info("=== Total HTML length: {} chars, {} lines ===", 
                htmlContent.length(), 
                htmlContent.split("\n").length);
        } catch (Exception e) {
            log.error("Failed to save HTML", e);
        }
        
        try {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + templateName + ".pdf\"");
            ITextRenderer renderer = new ITextRenderer();

            // Resolve base URL to allow relative links (like facture.css) to be loaded
            String baseUrl = null;
            try {
                java.net.URL res = this.getClass().getClassLoader().getResource("pdf-templates/");
                if (res != null) {
                    baseUrl = res.toExternalForm();
                    log.info("Using baseUrl for PDF resources: {}", baseUrl);
                } else {
                    log.warn("Could not resolve pdf-templates resource directory on classpath; relative links may not load.");
                }
            } catch (Exception ex) {
                log.warn("Failed to resolve baseUrl for pdf resources", ex);
            }

            if (baseUrl != null) {
                renderer.setDocumentFromString(htmlContent, baseUrl);
            } else {
                renderer.setDocumentFromString(htmlContent);
            }

            renderer.layout();
            renderer.createPDF(response.getOutputStream(), false);
            renderer.finishPDF();
        } catch (IOException e) {
            log.error(e.getMessage(), e);
        } catch (DocumentException e) {
            log.error(e.getMessage(), e);
        }
    }
}
