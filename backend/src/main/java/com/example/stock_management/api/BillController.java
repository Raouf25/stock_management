package com.example.stock_management.api;

import com.example.stock_management.dto.BillDTO;
import com.example.stock_management.dto.BillMapper;
import com.example.stock_management.dto.CreatedBillDTO;
import com.example.stock_management.dto.InvoiceCreationDTO;
import com.example.stock_management.service.BillService;
import com.example.stock_management.service.EmailService;
import com.example.stock_management.service.InvoicePdfDataService;
import com.example.stock_management.service.PdfGenerateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Contrôleur REST pour la gestion des factures.
 * Responsabilité : Gestion des requêtes HTTP uniquement.
 * La logique métier est déléguée aux services appropriés.
 */
@RestController
@RequestMapping("/api/bills")
@Tag(name = "Bill", description = "Bills management")
@RequiredArgsConstructor
public class BillController {

    private final PdfGenerateService pdfGenerateService;
    private final EmailService emailService;
    private final BillService billService;
    private final BillMapper billMapper;
    private final InvoicePdfDataService invoicePdfDataService;

    @GetMapping
    @Operation(summary = "Obtenir la liste de toutes les bills")
    public List<CreatedBillDTO> getAllBills() {
        return billService.findAll().stream()
                .map(billMapper::sourceToDestination)
                .toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une Bill par ID")
    public Optional<CreatedBillDTO> getBillById(@PathVariable Long id) {
        return billService.findById(id)
                .map(billMapper::sourceToDestination);
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle Bill")
    public Optional<CreatedBillDTO> createBill(@RequestBody BillDTO billDTO) {
        return Optional.of(billService.save(billDTO))
                .map(billMapper::sourceToDestination);
    }

    @PostMapping("/create")
    @Operation(summary = "Créer une nouvelle facture avec tous les détails")
    public ResponseEntity<?> createInvoice(@Valid @RequestBody InvoiceCreationDTO invoiceDto) {
        try {
            var bill = billService.createInvoice(invoiceDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(billMapper.sourceToDestination(bill));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating invoice: " + e.getMessage()));
        }
    }

    @GetMapping("/kpis")
    @Operation(summary = "Obtenir les KPIs des factures")
    public Map<String, Object> getInvoiceKPIs() {
        return billService.getInvoiceKPIs();
    }

    @PostMapping("/{id}/send-email")
    @Operation(summary = "Envoyer la facture par email au client")
    public ResponseEntity<?> sendInvoiceByEmail(@PathVariable Long id) {
        try {
            var billOpt = billService.findById(id);
            if (billOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            var bill = billOpt.get();

            if (bill.getCustomer() == null || 
                bill.getCustomer().getEmail() == null || 
                bill.getCustomer().getEmail().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Le client n'a pas d'adresse email configurée"));
            }

            // Déléguer la préparation des données au service
            Map<String, Object> data = invoicePdfDataService.preparePdfData(id);
            byte[] pdfBytes = pdfGenerateService.generatePdfToBytes(data);

            String billNumber = "FAC-" + String.format("%04d", bill.getIdBill());
            String customerName = bill.getCustomer().getName();
            String customerEmail = bill.getCustomer().getEmail();
            String subject = "Votre facture " + billNumber;
            String body = invoicePdfDataService.buildEmailBody(billNumber, customerName, data);

            emailService.sendEmailWithPdfAttachment(
                    customerEmail,
                    subject,
                    body,
                    pdfBytes,
                    billNumber + ".pdf"
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Facture envoyée avec succès à " + customerEmail,
                    "billNumber", billNumber,
                    "customerEmail", customerEmail
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de l'envoi de l'email: " + e.getMessage()));
        }
    }

    @GetMapping("/generate/{id}")
    @Operation(summary = "Générer le PDF d'une facture")
    public void generatePdf(@PathVariable Long id, HttpServletResponse response) {
        Map<String, Object> data = invoicePdfDataService.preparePdfData(id);
        pdfGenerateService.generatePdfFileAPI(data, response);
    }

    @PostMapping("/{id}/register-payment")
    @Operation(summary = "Enregistrer un paiement sur une facture")
    public ResponseEntity<?> registerPayment(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            double amount = Double.parseDouble(payload.getOrDefault("amount", 0).toString());
            var updatedBill = billService.registerPayment(id, amount);
            // Convertir l'entité Bill en DTO pour éviter les problèmes de sérialisation
            var responseDTO = billMapper.sourceToDestination(updatedBill);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de l'enregistrement du paiement: " + e.getMessage()));
        }
    }
}
