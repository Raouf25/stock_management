package com.example.stock_management.service;

import com.example.stock_management.dto.StockMovementDTO;
import com.example.stock_management.model.StockMouvement;
import com.example.stock_management.repository.StockMouvementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StockMovementService {

    @Autowired
    private StockMouvementRepository stockMouvementRepository;

    /**
     * Récupérer tous les mouvements de stock
     */
    public List<StockMouvement> getAllMovements() {
        return stockMouvementRepository.findAll();
    }

    /**
     * Récupérer un mouvement par ID
     */
    public Optional<StockMouvement> getMovementById(Long id) {
        return stockMouvementRepository.findById(id);
    }

    /**
     * Récupérer les mouvements filtrés
     */
    public List<StockMouvement> getMovementsByFilter(Long productId, String type, LocalDate dateFrom, LocalDate dateTo) {
        if (productId != null && type != null && dateFrom != null && dateTo != null) {
            return stockMouvementRepository.findByProductAndType(
                productId, 
                StockMouvement.Type.valueOf(type)
            ).stream()
                .filter(m -> m.getDate().isAfter(dateFrom) && m.getDate().isBefore(dateTo))
                .collect(Collectors.toList());
        } else if (productId != null && dateFrom != null && dateTo != null) {
            return stockMouvementRepository.findByProductAndDateRange(productId, dateFrom, dateTo);
        } else if (productId != null && type != null) {
            return stockMouvementRepository.findByProductAndType(
                productId, 
                StockMouvement.Type.valueOf(type)
            );
        } else if (productId != null) {
            return stockMouvementRepository.findByProduct_IdProduct(productId);
        } else if (type != null) {
            return stockMouvementRepository.findByType(StockMouvement.Type.valueOf(type));
        } else if (dateFrom != null && dateTo != null) {
            return stockMouvementRepository.findByDateRange(dateFrom, dateTo);
        }
        return stockMouvementRepository.findAll();
    }

    /**
     * Récupérer les mouvements pour un produit
     */
    public List<StockMouvement> getMovementsByProduct(Long productId) {
        return stockMouvementRepository.findByProduct_IdProduct(productId);
    }

    /**
     * Récupérer les mouvements par type
     */
    public List<StockMouvement> getMovementsByType(String type) {
        return stockMouvementRepository.findByType(StockMouvement.Type.valueOf(type));
    }

    /**
     * Récupérer les mouvements par source
     */
    public List<StockMouvement> getMovementsBySource(String source) {
        return stockMouvementRepository.findBySource(StockMouvement.Source.valueOf(source));
    }

    /**
     * Convertir une entité StockMouvement en DTO
     */
    public StockMovementDTO convertToDTO(StockMouvement mouvement) {
        StockMovementDTO dto = new StockMovementDTO();
        dto.setId(mouvement.getId());
        dto.setProductId(mouvement.getProduct().getIdProduct());
        dto.setProductName(mouvement.getProduct().getName());
        dto.setProductDesignation(mouvement.getProduct().getDesignation());
        dto.setQuantity(mouvement.getQuantity());
        dto.setDate(mouvement.getDate());
        dto.setType(mouvement.getType().toString());
        dto.setSource(mouvement.getSource().toString());
        dto.setReference(mouvement.getReference());
        return dto;
    }
}
