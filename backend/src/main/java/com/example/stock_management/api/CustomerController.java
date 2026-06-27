package com.example.stock_management.api;

import com.example.stock_management.dto.CustomerKPIsDTO;
import com.example.stock_management.dto.CustomerWithStatsDTO;
import com.example.stock_management.model.Customer;
import com.example.stock_management.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customer", description = "Gestion des clients")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    @Operation(summary = "Obtenir la liste de tous les clients avec statistiques")
    public List<CustomerWithStatsDTO> getAllClients() {
        return customerService.findAllWithStats();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Rechercher des clients avec statistiques")
    public List<CustomerWithStatsDTO> searchCustomers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String city) {
        // Pour l'instant, retourne tous les clients avec statistiques
        return customerService.findAllWithStats();
    }
    
    @GetMapping("/kpis")
    @Operation(summary = "Obtenir les KPIs des clients")
    public CustomerKPIsDTO getCustomerKPIs() {
        return customerService.getCustomerKPIs();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un client par ID")
    public Optional<Customer> getClientById(@PathVariable Long id) {
        return customerService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau client")
    public Customer createClient(@RequestBody Customer customer) {
        return customerService.save(customer);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un client existant")
    public Customer updateClient(@PathVariable Long id, @RequestBody Customer customerData) {
        Customer existingCustomer = customerService.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé avec l'ID: " + id));
        
        // Mettre à jour les champs modifiables
        existingCustomer.setName(customerData.getName());
        existingCustomer.setFullName(customerData.getFullName());
        existingCustomer.setEmail(customerData.getEmail());
        existingCustomer.setPhone(customerData.getPhone());
        existingCustomer.setFax(customerData.getFax());
        existingCustomer.setAddress(customerData.getAddress());
        existingCustomer.setCity(customerData.getCity());
        existingCustomer.setTvaCode(customerData.getTvaCode());
        existingCustomer.setCin(customerData.getCin());
        existingCustomer.setLicensePlate(customerData.getLicensePlate());
        existingCustomer.setStatus(customerData.getStatus());
        
        // createdAt et customerId restent inchangés
        return customerService.save(existingCustomer);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un client par ID (ADMIN uniquement)")
    public void deleteClient(@PathVariable Long id) {
        customerService.deleteById(id);
    }
}
