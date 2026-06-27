package com.example.stock_management.repository;


import com.example.stock_management.model.Bill;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByIdBillIn(Collection<Long> idBills);

    List<Bill> findByCustomer_CustomerId(Long customerId);

    Optional<Bill> findByIdBill(Long billId);


    @Query("SELECT b FROM Bill b LEFT JOIN FETCH b.billProducts WHERE b.idBill = :id")
    Optional<Bill> findByIdWithProducts(@NonNull Long id);

    @Query("SELECT DISTINCT b FROM Bill b LEFT JOIN FETCH b.billProducts")
    List<Bill> findAllWithProducts();

    @Query(value = "SELECT b FROM Bill b LEFT JOIN FETCH b.billProducts",
           countQuery = "SELECT COUNT(b) FROM Bill b")
    Page<Bill> findAllWithProductsPaged(Pageable pageable);

    @Query("SELECT COALESCE(SUM(b.total), 0) FROM Bill b WHERE b.customer.customerId = :customerId")
    BigDecimal sumTotalByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(b.amountDue), 0) FROM Bill b WHERE b.customer.customerId = :customerId AND b.paymentStatus != 'PAID'")
    BigDecimal sumUnpaidByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(b.total), 0) FROM Bill b")
    BigDecimal sumAllTotal();

    @Query("SELECT COALESCE(SUM(b.amountDue), 0) FROM Bill b WHERE b.paymentStatus != 'PAID'")
    BigDecimal sumAllUnpaid();
}
