package com.example.stock_management.service;

import com.example.stock_management.dto.ProductInventoryDTO;
import com.example.stock_management.model.Product;
import com.example.stock_management.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public void deleteById(Long id) {
        productRepository.deleteById(id);
    }

    public Integer getTotalArticlesSold(Long idProduct) {
        return productRepository.findTotalArticlesSold(idProduct);
    }

    public Integer getStockByProductId(Long idProduct) {
        return productRepository.findStockByProductId(idProduct);
    }

    // Nouvelle méthode pour obtenir l'inventaire d'un produit avec l'évolution des ventes
    public ProductInventoryDTO getProductInventory(Long productId, LocalDateTime startDate, LocalDateTime endDate) throws Exception {
        // Récupérer le produit depuis la base de données
        Product product = productRepository.findById(productId)
                .orElseThrow(() ->  new Exception(("Produit non trouvé avec id : " + productId)));

        // Créer l'objet DTO pour la réponse
        ProductInventoryDTO productInventoryDTO = new ProductInventoryDTO();
        productInventoryDTO.setProductId(product.getIdProduct());
        productInventoryDTO.setProductName(product.getName());
        productInventoryDTO.setInitialStock(product.getInitialStockQuantity());
        productInventoryDTO.setCurrentStock(product.getCurrentStockQuantity());

        // Obtenir l'évolution des ventes (sales evolution) via la requête HQL modifiée
        List<ProductInventoryDTO.SalesEvolution> salesEvolution = productRepository.findSalesEvolution(productId, startDate, endDate);

        // Affecter les résultats au DTO
        productInventoryDTO.setSalesEvolution(salesEvolution);

        return productInventoryDTO;
    }

    public List<String> getProductsCategories() {
        return productRepository.getProductsCategories();
    }

    public Map<String,Float> getProductsStatesCategories() {
        return productRepository.getProductsStatesCategories();
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.getProductsByCategory(category);
    }

    public List<Product> findBySupplierId(Long supplierId) {
        return productRepository.findBySupplierId(supplierId);
    }
}
