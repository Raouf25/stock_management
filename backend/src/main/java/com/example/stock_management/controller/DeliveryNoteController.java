package com.example.stock_management.controller;

import com.example.stock_management.dto.DeliveryNoteDTO;
import com.example.stock_management.dto.DeliveryNoteStatus;
import com.example.stock_management.model.Bill;
import com.example.stock_management.model.DeliveryNote;
import com.example.stock_management.service.DeliveryNoteService;
import com.example.stock_management.service.DeliveryNotePdfDataService;
import com.example.stock_management.service.PdfGenerateService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-notes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeliveryNoteController {

    private final DeliveryNoteService deliveryNoteService;
    private final DeliveryNotePdfDataService deliveryNotePdfDataService;
    private final PdfGenerateService pdfGenerateService;

    @GetMapping
    public ResponseEntity<List<DeliveryNote>> getAllDeliveryNotes() {
        return ResponseEntity.ok(deliveryNoteService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryNote> getDeliveryNoteById(@PathVariable Long id) {
        return deliveryNoteService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<DeliveryNote>> getDeliveryNotesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(deliveryNoteService.findByCustomerId(customerId));
    }

    @GetMapping("/not-invoiced")
    public ResponseEntity<List<DeliveryNote>> getNotInvoicedDeliveryNotes() {
        return ResponseEntity.ok(deliveryNoteService.findNotInvoiced());
    }

    @GetMapping("/pending-invoicing")
    public ResponseEntity<List<DeliveryNote>> getPendingInvoicingDeliveryNotes() {
        return ResponseEntity.ok(deliveryNoteService.findPendingInvoicing());
    }

    @PostMapping
    public ResponseEntity<?> createDeliveryNote(@RequestBody DeliveryNoteDTO deliveryNoteDTO) {
        try {
            DeliveryNote created = deliveryNoteService.save(deliveryNoteDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Error creating delivery note"));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<DeliveryNote> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            DeliveryNoteStatus status = DeliveryNoteStatus.valueOf(statusUpdate.get("status"));
            DeliveryNote updated = deliveryNoteService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeliveryNote(@PathVariable Long id) {
        try {
            deliveryNoteService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/convert-to-invoice")
    public ResponseEntity<?> convertToInvoice(@RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> deliveryNoteIds = request.get("deliveryNoteIds");
            if (deliveryNoteIds == null || deliveryNoteIds.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "deliveryNoteIds is required"));
            }
            Bill bill = deliveryNoteService.convertToInvoice(deliveryNoteIds);
            return ResponseEntity.ok(bill);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getKPIs() {
        return ResponseEntity.ok(deliveryNoteService.getKPIs());
    }

    @GetMapping({"/{id}/generate", "/generate/{id}"})
    public void generatePdf(@PathVariable Long id, HttpServletResponse response) {
        Map<String, Object> data = deliveryNotePdfDataService.preparePdfData(id);
        pdfGenerateService.generatePdfFileAPI(data, response, "bon-livraison");
    }
}
