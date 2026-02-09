package com.example.stock_management.service;

import com.example.stock_management.dto.CustomerKPIsDTO;
import com.example.stock_management.dto.CustomerWithStatsDTO;
import com.example.stock_management.model.Customer;
import com.example.stock_management.model.CustomerStatus;
import com.example.stock_management.repository.BillRepository;
import com.example.stock_management.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private BillRepository billRepository;

    public List<Customer> findAll() {
        return customerRepository.findAll();
    }
    
    public List<CustomerWithStatsDTO> findAllWithStats() {
        return customerRepository.findAll().stream()
                .map(this::enrichCustomerWithStats)
                .collect(Collectors.toList());
    }

    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }

    public Customer save(Customer customer) {
        return customerRepository.save(customer);
    }

    public void deleteById(Long id) {
        customerRepository.deleteById(id);
    }
    
    public CustomerKPIsDTO getCustomerKPIs() {
        long totalCustomers = customerRepository.count();
        long activeCustomers = customerRepository.countByStatus(CustomerStatus.ACTIVE);
        long blockedCustomers = customerRepository.countByStatus(CustomerStatus.BLOCKED);
        
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        long newCustomersThisMonth = customerRepository.countNewCustomersThisMonth(startOfMonth);
        
        BigDecimal totalRevenue = billRepository.sumAllTotal();
        BigDecimal totalOutstanding = billRepository.sumAllUnpaid();
        
        BigDecimal averageRevenuePerCustomer = totalCustomers > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalCustomers), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        
        return new CustomerKPIsDTO(
                totalCustomers,
                activeCustomers,
                blockedCustomers,
                newCustomersThisMonth,
                totalRevenue,
                averageRevenuePerCustomer,
                totalOutstanding
        );
    }
    
    private CustomerWithStatsDTO enrichCustomerWithStats(Customer customer) {
        BigDecimal totalCA = billRepository.sumTotalByCustomerId(customer.getCustomerId());
        BigDecimal unpaidAmount = billRepository.sumUnpaidByCustomerId(customer.getCustomerId());
        return new CustomerWithStatsDTO(customer, totalCA, unpaidAmount);
    }
}
