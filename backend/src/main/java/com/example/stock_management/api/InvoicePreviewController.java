package com.example.stock_management.api;


import com.example.stock_management.service.InvoicePdfDataService;
import com.example.stock_management.service.PdfGenerateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList; // Pour l'exemple de simulation des articles

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoicePreviewController {

    @Autowired
    private PdfGenerateService pdfGenerateService;

    @Autowired
  private InvoicePdfDataService invoicePdfDataService;

    /**
     * Produit et expose le rendu HTML direct du template facture_v3
     * pour l'intégration de la prévisualisation temps-réel dans l'iframe Angular.
     */
    @GetMapping(value = "/preview/{billId}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getInvoiceHtmlPreview(@PathVariable Long billId) {
        try {
            // 1. Récupération de l'objet facture depuis votre base de données
            // Bill bill = billService.findById(billId);

            // 2. Préparation du contexte de données (Doit matcher les variables th:text de facture_v3.html)
            Map<String, Object> templateData = invoicePdfDataService.preparePdfData(billId);

            // 3. Demande de compilation au moteur Thymeleaf
            String htmlOutput = pdfGenerateService.generateHtmlPreview(templateData);

            return ResponseEntity.ok()
                    .header("X-Frame-Options",            "ALLOWALL")
                    .header("Content-Security-Policy",
                            "frame-ancestors 'self' https://bhouri-stock.com https://www.bhouri-stock.com https://*.vercel.app http://localhost:4200")
                    .contentType(MediaType.TEXT_HTML)
                    .body(htmlOutput);

        } catch (Exception e) {
            // Génère un conteneur HTML d'erreur standardisé encapsulé dans l'iframe en cas de panne
            String errorHtml = "<html><body style='font-family:sans-serif; padding:2rem; background:#fee2e2; color:#991b1b;'>"
                    + "<h3>⚠️ Impossible de charger la prévisualisation</h3>"
                    + "<p>Détail de l'incident : " + e.getMessage() + "</p>"
                    + "</body></html>";
            return ResponseEntity.status(500)
                    .contentType(MediaType.TEXT_HTML)
                    .body(errorHtml);
        }
    }
}