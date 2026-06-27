package com.example.stock_management.service;

import com.example.stock_management.dto.SaleDTO;
import com.example.stock_management.model.BillProduct;
import com.example.stock_management.model.Sale;
import com.example.stock_management.model.Product;
import com.example.stock_management.repository.BillProductRepository;
import com.example.stock_management.repository.SaleRepository;
import com.example.stock_management.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class SaleService {
    @Autowired
    private com.example.stock_management.repository.CustomerRepository customerRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BillProductRepository billProductRepository;

    @Autowired
    private ProductDashboardService productDashboardService;

    @Transactional
    public Sale createSale(SaleDTO saleDTO) throws Exception {
        Product product = productRepository.findById(saleDTO.getProductId())
            .orElseThrow(() -> new Exception("Produit non trouvé avec l'ID : " + saleDTO.getProductId()));

        com.example.stock_management.model.Customer customer = null;
        if (saleDTO.getCustomerName() != null && !saleDTO.getCustomerName().isEmpty()) {
            customer = customerRepository.findByNameIgnoreCase(saleDTO.getCustomerName())
                .orElseThrow(() -> new Exception("Client non trouvé : " + saleDTO.getCustomerName()));
        }

        if (product.getCurrentStockQuantity() == null || product.getCurrentStockQuantity() < saleDTO.getQuantitySold()) {
            throw new Exception("Quantité insuffisante en stock. Stock disponible : " +
                (product.getCurrentStockQuantity() != null ? product.getCurrentStockQuantity() : 0) +
                ", Quantité demandée : " + saleDTO.getQuantitySold());
        }

        Sale sale = new Sale();
        sale.setDateSale(saleDTO.getDateSale() != null ? saleDTO.getDateSale() : LocalDate.now());
        sale.setProduct(product);
        if (customer != null) sale.setCustomer(customer);
        sale.setQuantitySold(saleDTO.getQuantitySold());
        sale.setUnitSalePrice(saleDTO.getUnitSalePrice());
        sale.setTotalSaleAmount(
            BigDecimal.valueOf(saleDTO.getQuantitySold()).multiply(saleDTO.getUnitSalePrice())
        );
        sale.setInvoiceNumber(saleDTO.getInvoiceNumber());
        sale.setDeliveryNoteNumber(saleDTO.getDeliveryNoteNumber());

        Sale savedSale = saleRepository.save(sale);
        updateProductStock(product, saleDTO.getQuantitySold(), false);
        productDashboardService.onDataChanged();
        return savedSale;
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public Optional<Sale> getSaleById(Long id) {
        return saleRepository.findById(id);
    }

    public List<Sale> getSalesByFilter(LocalDate dateFrom, LocalDate dateTo) {
        if (dateFrom != null && dateTo != null) {
            return saleRepository.findByDateRange(dateFrom, dateTo);
        }
        return saleRepository.findAll();
    }

    public List<Sale> getSalesByProduct(Long productId) {
        return saleRepository.findByProduct_IdProduct(productId);
    }

    public SaleDTO convertToDTO(Sale sale) {
        SaleDTO dto = new SaleDTO();
        dto.setId(sale.getId());
        dto.setDateSale(sale.getDateSale());
        dto.setProductId(sale.getProduct().getIdProduct());
        dto.setProductName(sale.getProduct().getName());
        dto.setProductDesignation(sale.getProduct().getDesignation());
        dto.setCustomerName(sale.getCustomer() != null ? sale.getCustomer().getName() : null);
        dto.setQuantitySold(sale.getQuantitySold());
        dto.setUnitSalePrice(sale.getUnitSalePrice());
        dto.setTotalSaleAmount(sale.getTotalSaleAmount());
        dto.setInvoiceNumber(sale.getInvoiceNumber());
        dto.setDeliveryNoteNumber(sale.getDeliveryNoteNumber());
        return dto;
    }

    public List<SaleDTO> convertToDTO(List<Sale> sales) {
        return sales.stream()
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    private void updateProductStock(Product product, Integer quantity, boolean isAdjustment) {
        BigDecimal currentValue = Objects.requireNonNullElse(product.getCurrentStockValue(), BigDecimal.ZERO);
        BigDecimal cmp         = Objects.requireNonNullElse(product.getCmp(), BigDecimal.ZERO);
        int        currentQty  = Objects.requireNonNullElse(product.getCurrentStockQuantity(), 0);

        int        newQty      = Math.max(0, currentQty - quantity);
        BigDecimal deducted    = BigDecimal.valueOf(quantity).multiply(cmp);
        BigDecimal newValue    = currentValue.subtract(deducted).max(BigDecimal.ZERO);

        product.setCurrentStockQuantity(newQty);
        product.setCurrentStockValue(newValue);
        product.setCmp(newQty > 0
            ? newValue.divide(BigDecimal.valueOf(newQty), 3, RoundingMode.HALF_UP)
            : BigDecimal.ZERO);

        productRepository.save(product);
    }

    public List<SaleDTO> getAllSalesCombined() {
        List<SaleDTO> result = new ArrayList<>(convertToDTO(saleRepository.findAll()));

        billProductRepository.findAllWithBillAndProduct().stream()
            .filter(bp -> bp.getBill() != null && bp.getProduct() != null)
            .map(bp -> {
                SaleDTO dto = new SaleDTO();
                dto.setId(bp.getId());
                dto.setDateSale(bp.getBill().getDateBill() != null
                        ? bp.getBill().getDateBill().toLocalDate() : null);
                dto.setProductId(bp.getProduct().getIdProduct());
                dto.setProductName(bp.getProduct().getName());
                dto.setProductDesignation(bp.getProduct().getDesignation());
                dto.setCustomerName(bp.getBill().getCustomer() != null
                        ? bp.getBill().getCustomer().getName() : null);
                dto.setQuantitySold(bp.getQuantity());
                BigDecimal unitPrice = (bp.getQuantity() != null && bp.getQuantity() > 0
                        && bp.getTotalProductPrice() != null)
                    ? bp.getTotalProductPrice().divide(BigDecimal.valueOf(bp.getQuantity()), 3, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
                dto.setUnitSalePrice(unitPrice);
                dto.setTotalSaleAmount(bp.getTotalProductPrice());
                dto.setInvoiceNumber(String.valueOf(bp.getBill().getIdBill()));
                return dto;
            })
            .forEach(result::add);

        result.sort(Comparator.comparing(SaleDTO::getDateSale,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return result;
    }

    public BigDecimal getTotalSalesAmount(Long productId) {
        return saleRepository.findTotalSalesAmountByProduct(productId);
    }

    public Integer getTotalSalesQuantity(Long productId) {
        return saleRepository.findTotalSalesQuantityByProduct(productId);
    }
}
