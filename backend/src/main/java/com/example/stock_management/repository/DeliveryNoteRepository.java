package com.example.stock_management.repository;

import com.example.stock_management.dto.DeliveryNoteStatus;
import com.example.stock_management.model.DeliveryNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryNoteRepository extends JpaRepository<DeliveryNote, Long> {
    
    Optional<DeliveryNote> findByDeliveryNoteNumber(String deliveryNoteNumber);
    
    List<DeliveryNote> findByCustomer_CustomerId(Long customerId);
    
    List<DeliveryNote> findByStatus(DeliveryNoteStatus status);
    
    List<DeliveryNote> findByInvoiced(Boolean invoiced);
    
    List<DeliveryNote> findByDateDeliveryBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(dn) FROM DeliveryNote dn WHERE dn.invoiced = false")
    Long countNotInvoiced();
    
    @Query("SELECT COUNT(dn) FROM DeliveryNote dn WHERE dn.status = :status")
    Long countByStatus(@Param("status") DeliveryNoteStatus status);
    
    @Query("SELECT dn FROM DeliveryNote dn WHERE dn.invoiced = false AND dn.status = 'DELIVERED' ORDER BY dn.dateDelivery ASC")
    List<DeliveryNote> findPendingInvoicing();
    
    @Query("SELECT COALESCE(SUM(dn.totalAmount), 0) FROM DeliveryNote dn WHERE dn.invoiced = false")
    java.math.BigDecimal sumTotalAmountNotInvoiced();
    
    @Query("SELECT dn FROM DeliveryNote dn WHERE YEAR(dn.dateDelivery) = :year AND MONTH(dn.dateDelivery) = :month")
    List<DeliveryNote> findByYearAndMonth(@Param("year") int year, @Param("month") int month);
}
