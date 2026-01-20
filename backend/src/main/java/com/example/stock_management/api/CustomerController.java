package com.example.stock_management.api;

import com.example.stock_management.model.Customer;
import com.example.stock_management.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
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
    @Operation(summary = "Obtenir la liste de tous les clients")
    public List<Customer> getAllClients() {
        return customerService.findAll();
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
    public Customer updateClient(@PathVariable Long id, @RequestBody Customer customer) {
//        client.setIdClient(id);
        return customerService.save(customer);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un client par ID")
    public void deleteClient(@PathVariable Long id) {
        customerService.deleteById(id);
    }
}
