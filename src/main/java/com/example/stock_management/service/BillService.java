package com.example.stock_management.service;

import com.example.stock_management.dto.BillDTO;
import com.example.stock_management.model.Bill;
import com.example.stock_management.model.BillProduct;
import com.example.stock_management.model.Customer;
import com.example.stock_management.model.Product;
import com.example.stock_management.repository.BillRepository;
import com.example.stock_management.repository.CustomerRepository;
import com.example.stock_management.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;

    private final ProductRepository productRepository;

    private final CustomerRepository customerRepository;


    public List<Bill> findAll() {
        return billRepository.findAll();
    }

    public Optional<Bill> findById(Long id) {
        return billRepository.findById(id);
    }

    @Transactional
    public Bill save(BillDTO billDto) {
        // Vérifier que le client existe
        Customer customer = customerRepository.findById(billDto.getIdClient()).orElseThrow(() -> new RuntimeException("Client not found with ID: " + billDto.getIdClient()));

        Bill bill = new Bill();
        // Associer le client à la facture
        bill.setCustomer(customer);

        // Mettre à jour la date de la facture à l'heure actuelle
        bill.setDateBill(LocalDateTime.now());


        // Traiter les produits associés (BillProduct)
        List<BillProduct> billProducts = billDto.getProducts().stream().map(billProductDTO -> {
            // Charger le produit depuis le repository
            Product product = productRepository.findById(billProductDTO.getIdProduct()).orElseThrow(() -> new RuntimeException("Product not found with ID: " + billProductDTO.getIdProduct()));

            BillProduct billProduct = new BillProduct();
            // Associer l'objet produit récupéré à BillProduct
            billProduct.setProduct(product);
            billProduct.setQuantity(billProductDTO.getQuantite());
            productRepository.updateStock(billProductDTO.getIdProduct(), billProductDTO.getQuantite());
            billProduct.setTotalProductPrice(billProductDTO.getQuantite() * product.getUnitPriceHt());

            bill.setTotal(bill.getTotal() + billProduct.getTotalProductPrice());
            // Associer la facture aux produits
            billProduct.setBill(bill);

            return billProduct;
        }).toList();

        bill.setBillProducts(billProducts);
        // Sauvegarder la facture dans la base de données
        return billRepository.save(bill);
    }


    public void deleteById(Long id) {
        billRepository.deleteById(id);
    }
}
