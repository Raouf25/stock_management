package com.example.stock_management.api;

import com.example.stock_management.dto.BillDTO;
import com.example.stock_management.dto.BillMapper;
import com.example.stock_management.dto.CreatedBillDTO;
import com.example.stock_management.model.Bill;
import com.example.stock_management.service.BillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.*;

@RestController
@RequestMapping("/api/bills")
@Tag(name = "Bill", description = "Bills management")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    private final BillMapper billMapper;

    @GetMapping
    @Operation(summary = "Obtenir la liste de toutes les bills")
    public List<CreatedBillDTO> getAllBills() {
        return billService.findAll().stream()
                .map(billMapper::sourceToDestination)
                .toList();
    }

    @GetMapping("/2/{id}")
    @Operation(summary = "Obtenir une Bill par ID")
    public ResponseEntity<byte[]>  getPDFBillById(@PathVariable Long id) {
        try {
            // Récupération de la facture via le service local
            Optional<Bill> optionalBill = billService.findById(id);

            if (!optionalBill.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            Bill bill = optionalBill.get();

            // Préparer les données sous forme de DataSource pour Jasper
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(Collections.singletonList(bill));

            // Charger le modèle Jasper (.jrxml)
            InputStream jasperStream = this.getClass().getResourceAsStream("/templates/bill_template.jrxml");
            JasperReport jasperReport = JasperCompileManager.compileReport(jasperStream);

            // Paramètres à passer au rapport (si nécessaire)
            Map<String, Object> parameters = new HashMap<>();

            // Remplir le rapport avec les données
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            // Générer le fichier PDF
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
            byte[] pdfBytes = outputStream.toByteArray();

            // Retourner le PDF
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bill_" + id + ".pdf");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
        return Optional.of(billService.save(billDTO)).map(billMapper::sourceToDestination);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une Bill par ID")
    public void deleteBill(@PathVariable Long id) {
        billService.deleteById(id);
    }


}
