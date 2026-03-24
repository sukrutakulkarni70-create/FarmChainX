package com.farmchainX.farmchainX.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmchainX.farmchainX.model.DispatchOffer;

@Repository
public interface DispatchOfferRepository extends JpaRepository<DispatchOffer, Long> {

    List<DispatchOffer> findByStatusOrderByCreatedAtDesc(String status);

    Optional<DispatchOffer> findByProductIdAndStatus(Long productId, String status);

    List<DispatchOffer> findByDistributorIdOrderByCreatedAtDesc(Long distributorId);

    boolean existsByProductIdAndStatus(Long productId, String status);

    // 🔥 ADD THIS
    List<DispatchOffer> findByStatusAndTargetRetailerIdOrderByCreatedAtDesc(String status, Long retailerId);
}