package com.example.stock_management.api;

import com.example.stock_management.model.Product;
import com.example.stock_management.model.Supplier;
import com.example.stock_management.repository.ProductRepository;
import com.example.stock_management.repository.PurchaseRepository;
import com.example.stock_management.repository.SupplierRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PurchaseStockSummaryApiIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @BeforeEach
    void cleanData() {
        purchaseRepository.deleteAll();
        productRepository.deleteAll();
        supplierRepository.deleteAll();
    }

    @Test
    void postPurchase_increasesFinalQuantityInStockSummary_forTargetProduct() throws Exception {
        PurchaseFixture fixture = fixtureBuilder().seedSupplierAndProduct("Supplier A", "SKU-A", 10, 100.0);

        mockMvc.perform(post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture.purchasePayload("BL-001", 5, 20.0, "Cycle 1")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.quantity").value(5))
            .andExpect(jsonPath("$.unitPriceTTC").value(20.0))
            .andExpect(jsonPath("$.totalAmountTTC").value(100.0));

        MvcResult summaryResult = mockMvc.perform(get("/api/stock/summary"))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode productSummary = findSummaryForProduct(summaryResult, fixture.product().getIdProduct());
        assertThat(productSummary).isNotNull();
        assertThat(productSummary.get("finalQuantity").asInt()).isEqualTo(15);
        assertThat(productSummary.get("totalPurchasesAmount").asDouble()).isEqualTo(100.0);
        assertThat(productSummary.get("finalStockValue").asDouble()).isEqualTo(200.0);
        assertThat(productSummary.get("cmp").asDouble()).isCloseTo(200.0 / 15.0, within(1e-9));
    }

    @Test
    void postTwoPurchases_updatesFinalStockValueAndCmpInStockSummary() throws Exception {
        PurchaseFixture fixture = fixtureBuilder().seedSupplierAndProduct("Supplier B", "SKU-B", 10, 100.0);

        createPurchase(fixture, "BL-101", 5, 20.0);
        createPurchase(fixture, "BL-102", 10, 30.0);

        MvcResult summaryResult = mockMvc.perform(get("/api/stock/summary"))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode root = objectMapper.readTree(summaryResult.getResponse().getContentAsString(StandardCharsets.UTF_8));
        JsonNode productSummary = findSummaryForProduct(root, fixture.product().getIdProduct());

        assertThat(productSummary).isNotNull();
        assertThat(productSummary.get("finalQuantity").asInt()).isEqualTo(25);
        assertThat(productSummary.get("totalPurchasesAmount").asDouble()).isEqualTo(400.0);
        assertThat(productSummary.get("finalStockValue").asDouble()).isEqualTo(500.0);
        assertThat(productSummary.get("cmp").asDouble()).isEqualTo(20.0);

        JsonNode totals = root.get("totals");
        assertThat(totals.get("totalPurchasesAmount").asDouble()).isEqualTo(400.0);
    }

    @Test
    void getOnePurchase_withUnknownId_returnsStructured404() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/purchases/999999"))
            .andExpect(status().isNotFound())
            .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        assertThat(body.get("timestamp")).isNotNull();
        assertThat(body.get("timestamp").isNull()).isFalse();
        assertThat(body.get("status").asInt()).isEqualTo(404);
        assertThat(body.get("code").asText()).isEqualTo("NOT_FOUND");
        assertThat(body.get("message").asText()).contains("999999");
        assertThat(body.get("path").asText()).isEqualTo("/api/purchases/999999");
        assertThat(body.get("errors").isArray()).isTrue();
        assertThat(body.get("errors").size()).isEqualTo(0);
    }

    @Test
    void getOnePurchase_withExistingId_returnsExpectedPurchaseDto() throws Exception {
        PurchaseFixture fixture = fixtureBuilder().seedSupplierAndProduct("Supplier-I", "SKU-I", 0, 0.0);
        Long createdId = createPurchaseAndReturnId(fixture, "BL-GET-1", 4, 12.5, "read-path");

        mockMvc.perform(get("/api/purchases/{id}", createdId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(createdId))
            .andExpect(jsonPath("$.supplierId").value(fixture.supplier().getId()))
            .andExpect(jsonPath("$.productId").value(fixture.product().getIdProduct()))
            .andExpect(jsonPath("$.invoiceNumber").value("BL-GET-1"))
            .andExpect(jsonPath("$.quantity").value(4))
            .andExpect(jsonPath("$.unitPriceTTC").value(12.5))
            .andExpect(jsonPath("$.totalAmountTTC").value(50.0))
            .andExpect(jsonPath("$.comment").value("read-path"));
    }

    @Test
    void getPurchases_returnsListContainingCreatedPurchase() throws Exception {
        PurchaseFixture fixture = fixtureBuilder().seedSupplierAndProduct("Supplier-H", "SKU-H", 0, 0.0);

        createPurchase(fixture, "BL-READ-1", 3, 15.0);

        mockMvc.perform(get("/api/purchases"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].invoiceNumber").value("BL-READ-1"))
            .andExpect(jsonPath("$[0].quantity").value(3))
            .andExpect(jsonPath("$[0].unitPriceTTC").value(15.0))
            .andExpect(jsonPath("$[0].totalAmountTTC").value(45.0))
            .andExpect(jsonPath("$[0].supplierId").value(fixture.supplier().getId()))
            .andExpect(jsonPath("$[0].productId").value(fixture.product().getIdProduct()));
    }

    @Test
    void postPurchase_doesNotAffectSiblingProduct_inStockSummary() throws Exception {
        PurchaseFixture fixtureA = fixtureBuilder().seedSupplierAndProduct("Supplier-F", "SKU-F", 10, 100.0);
        PurchaseFixture fixtureB = fixtureBuilder().seedSupplierAndProduct("Supplier-G", "SKU-G", 8, 80.0);

        createPurchase(fixtureA, "BL-ISO-1", 5, 20.0);

        MvcResult summaryResult = mockMvc.perform(get("/api/stock/summary"))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode root = objectMapper.readTree(summaryResult.getResponse().getContentAsString(StandardCharsets.UTF_8));

        JsonNode summaryA = findSummaryForProduct(root, fixtureA.product().getIdProduct());
        assertThat(summaryA).isNotNull();
        assertThat(summaryA.get("finalQuantity").asInt()).isEqualTo(15);  // 10 initial + 5 purchased

        JsonNode summaryB = findSummaryForProduct(root, fixtureB.product().getIdProduct());
        assertThat(summaryB).isNotNull();
        assertThat(summaryB.get("finalQuantity").asInt()).isEqualTo(8);   // initial only, untouched
        assertThat(summaryB.get("totalPurchasesAmount").asDouble()).isEqualTo(0.0);
    }

    @Test
    void postPurchase_withInvalidProductId_returnsBadRequestWithExpectedMessageShape() throws Exception {
        PurchaseFixture fixture = fixtureBuilder().seedSupplierAndProduct("Supplier C", "SKU-C", 0, 0.0);

        ResultActions response = mockMvc.perform(post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(purchasePayload(fixture.supplier().getId(), 999_999L, "BL-ERR-1", 1, 10.0, null)));

        assertBadRequestJsonMessageContains(response, "Produit non trouv\u00e9 avec l'ID : 999999");
    }

    @Test
    void postPurchase_withInvalidSupplierId_returnsBadRequestWithExpectedMessageShape() throws Exception {
        PurchaseFixture fixture = fixtureBuilder().seedSupplierAndProduct("Supplier D", "SKU-D", 0, 0.0);

        ResultActions response = mockMvc.perform(post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(purchasePayload(999_999L, fixture.product().getIdProduct(), "BL-ERR-2", 1, 10.0, null)));

        assertBadRequestJsonMessageContains(response, "Fournisseur non trouv\u00e9 avec l'ID : 999999");
    }

    @Test
    void postPurchase_withMissingQuantity_returnsBadRequestWithExpectedMessageShape() throws Exception {
        PurchaseFixture fixture = fixtureBuilder().seedSupplierAndProduct("Supplier E", "SKU-E", 0, 0.0);

        ResultActions response = mockMvc.perform(post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(purchasePayloadMissingQuantity(fixture.supplier().getId(), fixture.product().getIdProduct(), "BL-ERR-3", 10.0)));

        assertValidationError(response, "quantity", "quantity is required");
    }

    @Test
    void postPurchase_withNullIds_returnsBadRequestWithExpectedMessageShape() throws Exception {
        ResultActions response = mockMvc.perform(post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(purchasePayloadWithNullIds("BL-ERR-4", 1, 10.0)));

        assertValidationError(response, "supplierId", "supplierId is required");
        assertValidationError(response, "productId", "productId is required");
    }

    private void createPurchase(PurchaseFixture fixture, String invoiceNumber, int quantity, double unitPrice) throws Exception {
        String payload = fixture.purchasePayload(invoiceNumber, quantity, unitPrice, null);

        mockMvc.perform(post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isCreated());
    }

    private Long createPurchaseAndReturnId(PurchaseFixture fixture, String invoiceNumber, int quantity, double unitPrice, String comment) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/purchases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fixture.purchasePayload(invoiceNumber, quantity, unitPrice, comment)))
            .andExpect(status().isCreated())
            .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        return body.get("id").asLong();
    }

    private void assertBadRequestJsonMessageContains(ResultActions response, String... expectedMessageFragments) throws Exception {
        MvcResult result = response
            .andExpect(status().isBadRequest())
            .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        assertThat(body.get("timestamp")).isNotNull();
        assertThat(body.get("timestamp").isNull()).isFalse();
        assertThat(body.get("status").asInt()).isEqualTo(400);
        assertThat(body.get("code").asText()).isEqualTo("BAD_REQUEST");
        String message = body.get("message").asText();
        for (String fragment : expectedMessageFragments) {
            assertThat(message).contains(fragment);
        }
        assertThat(body.get("path").asText()).isEqualTo("/api/purchases");
        assertThat(body.get("errors").isArray()).isTrue();
        assertThat(body.get("errors").size()).isEqualTo(0);
    }

    private void assertValidationError(ResultActions response, String field, String message) throws Exception {
        MvcResult result = response
            .andExpect(status().isBadRequest())
            .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        assertThat(body.get("status").asInt()).isEqualTo(400);
        assertThat(body.get("code").asText()).isEqualTo("VALIDATION_ERROR");
        assertThat(body.get("message").asText()).isEqualTo("Validation failed");
        assertThat(body.get("path").asText()).isEqualTo("/api/purchases");

        JsonNode errors = body.get("errors");
        assertThat(errors.isArray()).isTrue();

        boolean found = false;
        for (JsonNode error : errors) {
            if (field.equals(error.get("field").asText()) && message.equals(error.get("message").asText())) {
                found = true;
                break;
            }
        }
        assertThat(found).isTrue();
    }

    private PurchaseFixtureBuilder fixtureBuilder() {
        return new PurchaseFixtureBuilder();
    }

    private JsonNode findSummaryForProduct(MvcResult summaryResult, Long productId) throws Exception {
        JsonNode root = objectMapper.readTree(summaryResult.getResponse().getContentAsString(StandardCharsets.UTF_8));
        return findSummaryForProduct(root, productId);
    }

    private JsonNode findSummaryForProduct(JsonNode root, Long productId) {
        for (JsonNode productSummary : root.get("products")) {
            if (productSummary.get("productId").asLong() == productId) {
                return productSummary;
            }
        }
        return null;
    }

    private Supplier createSupplier(String name) {
        Supplier supplier = new Supplier();
        supplier.setName(name);
        return supplierRepository.save(supplier);
    }

    private Product createProduct(Supplier supplier, int initialQuantity, double initialValue, String designation) {
        Product product = new Product();
        product.setSupplier(supplier);
        product.setDesignation(designation);
        product.setInitialStockQuantity(initialQuantity);
        product.setInitialStockValue(initialValue);
        return productRepository.save(product);
    }

    private class PurchaseFixtureBuilder {
        private Supplier supplier;
        private Product product;

        PurchaseFixture seedSupplierAndProduct(String supplierName, String productDesignation, int initialQuantity, double initialValue) {
            this.supplier = createSupplier(supplierName);
            this.product = createProduct(supplier, initialQuantity, initialValue, productDesignation);
            return new PurchaseFixture(supplier, product);
        }
    }

    private record PurchaseFixture(Supplier supplier, Product product) {
        String purchasePayload(String invoiceNumber, int quantity, double unitPrice, String comment) {
            return PurchaseStockSummaryApiIT.purchasePayload(
                supplier.getId(),
                product.getIdProduct(),
                invoiceNumber,
                quantity,
                unitPrice,
                comment
            );
        }
    }

    private static String purchasePayload(Long supplierId, Long productId, String invoiceNumber, int quantity, double unitPrice, String comment) {
        if (comment != null) {
            return """
                {
                  "supplierId": %d,
                  "productId": %d,
                  "invoiceNumber": "%s",
                  "quantity": %d,
                  "unitPriceTTC": %.1f,
                  "comment": "%s"
                }
                """.formatted(supplierId, productId, invoiceNumber, quantity, unitPrice, comment);
        }

        return """
            {
              "supplierId": %d,
              "productId": %d,
              "invoiceNumber": "%s",
              "quantity": %d,
              "unitPriceTTC": %.1f
            }
            """.formatted(supplierId, productId, invoiceNumber, quantity, unitPrice);
    }

    private static String purchasePayloadMissingQuantity(Long supplierId, Long productId, String invoiceNumber, double unitPrice) {
        return """
            {
              "supplierId": %d,
              "productId": %d,
              "invoiceNumber": "%s",
              "unitPriceTTC": %.1f
            }
            """.formatted(supplierId, productId, invoiceNumber, unitPrice);
    }

    private static String purchasePayloadWithNullIds(String invoiceNumber, int quantity, double unitPrice) {
        return """
            {
              "supplierId": null,
              "productId": null,
              "invoiceNumber": "%s",
              "quantity": %d,
              "unitPriceTTC": %.1f
            }
            """.formatted(invoiceNumber, quantity, unitPrice);
    }
}

