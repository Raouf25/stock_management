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

        String templateName = "facture";
        String htmlContent = templateEngine.process(templateName, context);
        try {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + templateName + ".pdf\"");
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
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
