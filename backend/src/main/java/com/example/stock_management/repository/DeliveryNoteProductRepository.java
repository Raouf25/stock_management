package com.example.stock_management.repository;

import com.example.stock_management.model.DeliveryNoteProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryNoteProductRepository extends JpaRepository<DeliveryNoteProduct, Long> {
    
    List<DeliveryNoteProduct> findByDeliveryNoteIdDeliveryNote(Long deliveryNoteId);
    
    List<DeliveryNoteProduct> findByProductIdProduct(Long productId);
    
    @Query("SELECT dnp FROM DeliveryNoteProduct dnp WHERE dnp.deliveryNote.idDeliveryNote = :deliveryNoteId")
    List<DeliveryNoteProduct> findProductsByDeliveryNoteId(@Param("deliveryNoteId") Long deliveryNoteId);
}
