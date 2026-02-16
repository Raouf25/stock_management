package com.example.stock_management.util;

import com.example.stock_management.model.Sale;
import com.example.stock_management.model.Customer;
import com.example.stock_management.repository.SaleRepository;
import com.example.stock_management.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SaleCustomerMigration implements CommandLineRunner {
    @Autowired
    private SaleRepository saleRepository;
    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public void run(String... args) {
        List<Sale> sales = saleRepository.findAll();
        for (Sale sale : sales) {
            if (sale.getCustomer() == null) {
                // Tentative de retrouver le client par heuristique (ex: nom dans commentaire, à adapter)
                String possibleName = sale.getComment();
                if (possibleName != null && !possibleName.isEmpty()) {
                    Customer customer = customerRepository.findAll().stream()
                        .filter(c -> c.getName() != null && c.getName().equalsIgnoreCase(possibleName))
                        .findFirst().orElse(null);
                    if (customer != null) {
                        sale.setCustomer(customer);
                        saleRepository.save(sale);
                        System.out.println("[MIGRATION] Vente " + sale.getId() + " associée au client " + customer.getName());
                    }
                }
            }
        }
    }
}
