package com.example.stock_management.service;

import com.example.stock_management.model.Product;
import com.example.stock_management.model.Supplier;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.SupplierRepository;
import com.opencsv.CSVReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Service
public class CsvDataLoaderService {

    private static final Logger logger = LoggerFactory.getLogger(CsvDataLoaderService.class);

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    /**
     * Charger les données au démarrage de l'application
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void loadDataFromCsv() {
        try {
            // Vérifier si les données existent déjà
            if (productRepository.count() > 0) {
                logger.info("Les données existent déjà. Pas de rechargement.");
                return;
            }

            logger.info("Démarrage du chargement des données depuis les fichiers CSV...");

            // Créer les fournisseurs par défaut
            createDefaultSuppliers();

            // Charger les produits depuis Products.csv
            loadProductsFromCsv();

            logger.info("Chargement des données terminé avec succès!");
        } catch (Exception e) {
            logger.error("Erreur lors du chargement des données CSV : ", e);
        }
    }

    /**
     * Créer les fournisseurs par défaut
     */
    private void createDefaultSuppliers() {
        // Vérifier si les fournisseurs existent déjà
        if (supplierRepository.count() > 0) {
            return;
        }

        Supplier supplier1 = new Supplier();
        supplier1.setName("VALDECO");
        supplier1.setAddress("123 Rue des Fournisseurs");
        supplier1.setPhone("+216 71 123 456");
        supplier1.setEmail("contact@valdeco.tn");
        supplierRepository.save(supplier1);

        Supplier supplier2 = new Supplier();
        supplier2.setName("DEFAULT_SUPPLIER");
        supplier2.setAddress("Adresse par défaut");
        supplier2.setPhone("+216 71 000 000");
        supplier2.setEmail("supplier@example.tn");
        supplierRepository.save(supplier2);

        logger.info("Fournisseurs par défaut créés");
    }

    /**
     * Charger les produits depuis le fichier Products.csv
     */
    private void loadProductsFromCsv() {
        try {
            ClassPathResource resource = new ClassPathResource("Products.csv");
            InputStreamReader isr = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            CSVReader csvReader = new CSVReader(isr);

            String[] line;
            int lineNumber = 0;
            int successCount = 0;

            // Récupérer le fournisseur par défaut
            Supplier defaultSupplier = supplierRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new Exception("Aucun fournisseur disponible"));

            while ((line = csvReader.readNext()) != null) {
                lineNumber++;
                // Sauter la première ligne (headers)
                if (lineNumber == 1) {
                    continue;
                }

                try {
                    // Vérifier que la ligne n'est pas vide
                    if (line.length < 7) {
                        logger.warn("Ligne {} insuffisante", lineNumber);
                        continue;
                    }

                    // Parser les données
                    String category = line[0].trim();
                    String name = line[1].trim();
                    String unit = line[2].trim();
                    Double unitPriceBought = parseDouble(line[3]);
                    Double unitPriceTTC = parseDouble(line[4]);
                    Integer initialQuantity = parseInt(line[5]);
                    Integer currentQuantity = parseInt(line[6]);

                    // Créer le produit
                    Product product = new Product();
                    product.setDesignation(name);
                    product.setName(name);
                    product.setCategory(category);
                    product.setUnit(unit);
                    product.setUnitPriceBought(unitPriceBought);
                    product.setUnitPriceSold(unitPriceTTC);
                    product.setInitialStockQuantity(initialQuantity);
                    product.setCurrentStockQuantity(currentQuantity);
                    product.setInitialStockValue(initialQuantity * unitPriceTTC);
                    product.setCurrentStockValue(currentQuantity * unitPriceTTC);
                    product.setCmp(unitPriceTTC); // CMP initial = prix initial
                    product.setSupplier(defaultSupplier);

                    productRepository.save(product);
                    successCount++;

                } catch (Exception e) {
                    logger.warn("Erreur lors du traitement de la ligne {} : {}", lineNumber, e.getMessage());
                }
            }

            csvReader.close();
            logger.info("{} produits chargés avec succès", successCount);

        } catch (Exception e) {
            logger.error("Erreur lors de la lecture du fichier Products.csv : ", e);
        }
    }

    /**
     * Parser une valeur numérique Double
     */
    private Double parseDouble(String value) {
        try {
            return Double.parseDouble(value.trim().replace(",", "."));
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    /**
     * Parser une valeur numérique Integer
     */
    private Integer parseInt(String value) {
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
