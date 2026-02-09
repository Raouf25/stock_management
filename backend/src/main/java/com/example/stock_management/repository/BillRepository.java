package com.example.stock_management.repository;


import com.example.stock_management.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    
    List<Bill> findByCustomer_CustomerId(Long customerId);
    
    @Query("SELECT COALESCE(SUM(b.total), 0) FROM Bill b WHERE b.customer.customerId = :customerId")
    BigDecimal sumTotalByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT COALESCE(SUM(b.amountDue), 0) FROM Bill b WHERE b.customer.customerId = :customerId AND b.paymentStatus != 'PAID'")
    BigDecimal sumUnpaidByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT COALESCE(SUM(b.total), 0) FROM Bill b")
    BigDecimal sumAllTotal();
    
    @Query("SELECT COALESCE(SUM(b.amountDue), 0) FROM Bill b WHERE b.paymentStatus != 'PAID'")
    BigDecimal sumAllUnpaid();
}
