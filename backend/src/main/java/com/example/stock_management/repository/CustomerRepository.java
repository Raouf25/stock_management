package com.example.stock_management.repository;


import com.example.stock_management.model.Customer;
import com.example.stock_management.model.CustomerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    long countByStatus(CustomerStatus status);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.createdAt >= :startOfMonth")
    long countNewCustomersThisMonth(@Param("startOfMonth") LocalDateTime startOfMonth);

    Optional<Customer> findByNameIgnoreCase(String name);
}
