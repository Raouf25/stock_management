package com.example.stock_management.api;

import com.example.stock_management.dto.BillDTO;
import com.example.stock_management.dto.BillMapper;
import com.example.stock_management.dto.CreatedBillDTO;
import com.example.stock_management.service.BillService;
import com.example.stock_management.service.PdfGenerateService;
import com.example.stock_management.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/bills")
@Tag(name = "Bill", description = "Bills management")
@RequiredArgsConstructor
public class BillController {

    private final PdfGenerateService pdfGenerateService;

    private final SupplierService supplierService;
    private final BillService billService;

    private final BillMapper billMapper;

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
        return Optional.of(billService.save(billDTO)).map(billMapper::sourceToDestination);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une Bill par ID")
    public void deleteBill(@PathVariable Long id) {
        billService.deleteById(id);
    }


//    curl -X 'GET'  'http://localhost:8080/api/bills/generate/5'
    @GetMapping("/generate/{id}")
    public void generatePdf(@PathVariable Long id, HttpServletResponse response) {

        // Ajoutez les données nécessaires à la carte 'data'
        Map<String, Object> data = new HashMap<>();
        supplierService.findById(3L).ifPresent(supplier -> data.put("supplier", supplier));
        billService.findById(id).ifPresent(bill -> {
            data.put("customer", bill.getCustomer());
            data.put("products", bill.getBillProducts());
            data.put("total", bill.getTotal());
        });

        pdfGenerateService.generatePdfFileAPI(data, response);
    }

}
