package com.example.stock_management.repository;


import com.example.stock_management.model.HistoricBill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoricBillRepository extends JpaRepository<HistoricBill, Long> {
}
