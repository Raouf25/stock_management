package com.example.stock_management.api;

import com.example.stock_management.dto.ProductDashboardResponseDTO;
import com.example.stock_management.dto.ProductInventoryDTO;
import com.example.stock_management.model.Product;
import com.example.stock_management.service.ProductDashboardService;
import com.example.stock_management.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product", description = "Gestion des products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductDashboardService productDashboardService;

    @GetMapping
    @Operation(summary = "Obtenir la liste de tous les products")
    public List<Product> getAllProducts() {
        return productService.findAll();
    }


    @GetMapping("/dashboard")
    @Operation(summary = "Obtenir la liste de tous les produits enrichis avec achats, ventes et statistiques")
    public List<ProductDashboardResponseDTO> getAllProductsDashboard() {
        return productDashboardService.getProductsDashboardData();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un product par ID")
    public Optional<Product> getProductById(@PathVariable Long id) {
        return productService.findById(id);
    }

    @GetMapping("/{id}/stock")
    @Operation(summary = "Obtenir le stock actuel d'un product par ID")
    public Integer getStockByProductId(@PathVariable Long id) {
        return productService.getStockByProductId(id);
    }

    @GetMapping("/{id}/vendus")
    @Operation(summary = "Obtenir le nombre total d'articles vendus pour un product")
    public Integer getTotalArticlesSold(@PathVariable Long id) {
        return productService.getTotalArticlesSold(id);
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau product")
    public Product createProduct(@RequestBody Product product) {
        return productService.save(product);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un product existant")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        //  product.setIdProduct(id);
        return productService.save(product);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un produit par ID (ADMIN uniquement)")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteById(id);
    }


    // Nouvel endpoint pour obtenir l'inventaire d'un produit
    @GetMapping("/{id}/inventory")
    @Operation(summary = "Obtenir l'inventaire d'un product par ID avec des dates optionnelles")
    public ProductInventoryDTO getProductInventory(@PathVariable Long id,
                                                   @RequestParam(required = false) LocalDateTime startDate,
                                                   @RequestParam(required = false) LocalDateTime endDate) throws Exception {
        return productService.getProductInventory(id, startDate, endDate);
    }

    // Nouvel endpoint pour obtenir l'inventaire d'un produit
    @GetMapping("/categories")
    @Operation(summary = "Obtenir les differents categories des produits")
    public List<String> getProductCategories() {
        return productService.getProductsCategories();
    }

    // Nouvel endpoint pour obtenir l'inventaire d'un produit
    @GetMapping("/stats/categories")
    @Operation(summary = "Obtenir les differents categories des produits")
    public Map<String, Float> getProductStatesCategories() {
        return productService.getProductsStatesCategories();
    }

    // Nouvel endpoint pour obtenir l'inventaire d'un produit
//    @GetMapping("")
//    @Operation(summary = "Obtenir les differents produits par category")
//    public List<Product> getProductCategories(@RequestParam String category) {
//        return productService.getProductsByCategory(category);
//    }

    @GetMapping("/supplier/{supplierId}")
    @Operation(summary = "Obtenir les produits d'un fournisseur")
    public List<Product> getProductsBySupplier(@PathVariable Long supplierId) {
        return productService.findBySupplierId(supplierId);
    }


}
