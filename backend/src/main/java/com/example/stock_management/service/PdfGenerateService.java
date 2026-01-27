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
        // Process template with Thymeleaf
        String htmlContent = templateEngine.process(templateName, context);
        
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
