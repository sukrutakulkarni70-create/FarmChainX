package com.farmchainX.farmchainX.controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmchainX.farmchainX.model.DispatchOffer;
import com.farmchainX.farmchainX.model.Product;
import com.farmchainX.farmchainX.model.RetailerInventory;
import com.farmchainX.farmchainX.model.SupplyChainLog;
import com.farmchainX.farmchainX.model.User;
import com.farmchainX.farmchainX.repository.DispatchOfferRepository;
import com.farmchainX.farmchainX.repository.ProductRepository;
import com.farmchainX.farmchainX.repository.RetailerInventoryRepository;
import com.farmchainX.farmchainX.repository.SupplyChainLogRepository;
import com.farmchainX.farmchainX.repository.UserRepository;

@RestController
@RequestMapping("/api/dispatch")
public class DispatchController {

    private final DispatchOfferRepository dispatchOfferRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final RetailerInventoryRepository retailerInventoryRepository;
    private final SupplyChainLogRepository supplyChainLogRepository;

    public DispatchController(
            DispatchOfferRepository dispatchOfferRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            RetailerInventoryRepository retailerInventoryRepository,
            SupplyChainLogRepository supplyChainLogRepository) {

        this.dispatchOfferRepository = dispatchOfferRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.retailerInventoryRepository = retailerInventoryRepository;
        this.supplyChainLogRepository = supplyChainLogRepository;
    }

    // 🔹 Create offer
    @PostMapping("/create")
    @PreAuthorize("hasRole('DISTRIBUTOR')")
    @Transactional
    public ResponseEntity<?> createOffer(@RequestBody Map<String, Object> body, Principal principal) {
    try {
        User distributor = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Distributor not found"));

        Long productId = Long.valueOf(body.get("productId").toString());

        // Verify distributor owns the product
        SupplyChainLog lastLog = supplyChainLogRepository
                .findTopByProductIdOrderByTimestampDesc(productId)
                .orElse(null);

        if (lastLog == null || !lastLog.getToUserId().equals(distributor.getId())
                || !lastLog.isConfirmed()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error",
                            "You do not have confirmed possession of this product"));
        }

        // Check if there's already a pending offer for this product
        if (dispatchOfferRepository.existsByProductIdAndStatus(productId, "PENDING")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error",
                            "A pending dispatch offer already exists for this product"));
        }

        DispatchOffer offer = new DispatchOffer();

        // existing fields
        offer.setProductId(productId);
        offer.setDistributorId(distributor.getId());
        offer.setLocation((String) body.get("location"));
        offer.setNotes((String) body.get("notes"));

        
        offer.setTargetRetailerId(
            Long.valueOf(body.get("retailerId").toString())
        );

        if (body.containsKey("quantity")) {
            offer.setQuantity(Double.valueOf(body.get("quantity").toString()));
        }

        System.out.println("[CREATE OFFER] Dispatch created for product " + productId 
            + " to retailer " + offer.getTargetRetailerId() 
            + " with quantity " + offer.getQuantity());

        dispatchOfferRepository.save(offer);

        return ResponseEntity.ok(Map.of("message", "Dispatch offer created"));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Dispatch failed: " + e.getMessage()));
    }
}

    // 🔹 Retailer market
    @GetMapping("/market")
@PreAuthorize("hasRole('RETAILER')")
public List<Map<String, Object>> getMarket(Principal principal) {

    User retailer = userRepository.findByEmail(principal.getName()).orElseThrow();

    return dispatchOfferRepository
            .findByStatusAndTargetRetailerIdOrderByCreatedAtDesc("PENDING", retailer.getId())
            .stream().map(offer -> {

                Product product = productRepository.findById(offer.getProductId()).orElse(null);
                if (product == null) return null;

                User distributor = userRepository
                        .findById(offer.getDistributorId())
                        .orElse(null);

                Map<String, Object> map = new HashMap<>();

                map.put("offerId", offer.getId());
                map.put("productId", product.getId());

                map.put("cropName", product.getCropName());
                map.put("imagePath", product.getImagePath());
                map.put("price", product.getPrice());
                map.put("quantity", offer.getQuantity() != null ? offer.getQuantity() : product.getQuantity());
                map.put("dispatchQuantity", offer.getQuantity());

                map.put("farmerName", product.getFarmer().getName());

                // ADD DISTRIBUTOR NAME
                map.put("distributorName", distributor != null ? distributor.getName() : "Unknown");

                map.put("location", offer.getLocation());

                return map;

            }).filter(m -> m != null).toList();
}

    // 🔹 Accept offer
    @PostMapping("/accept/{id}")
    @PreAuthorize("hasRole('RETAILER')")
    @Transactional
    public ResponseEntity<?> accept(@PathVariable Long id, Principal principal) {

        User retailer = userRepository.findByEmail(principal.getName()).orElseThrow();
        DispatchOffer offer = dispatchOfferRepository.findById(id).orElseThrow();
        Product product = productRepository.findById(offer.getProductId()).orElseThrow();

        offer.setStatus("ACCEPTED");
        offer.setAcceptedBy(retailer.getId());
        offer.setAcceptedAt(LocalDateTime.now());
        dispatchOfferRepository.save(offer);

        // Move to inventory
        RetailerInventory inventory = new RetailerInventory();
        inventory.setRetailerId(retailer.getId());
        inventory.setProductId(offer.getProductId());
        Double dispatchQuantity = offer.getQuantity() != null ? offer.getQuantity() : 100.0;
        inventory.setQuantity(dispatchQuantity);
        inventory.setPricePerUnit(product.getPrice() != null ? product.getPrice() : 0.0);
        inventory.setSourceDistributorId(offer.getDistributorId());

        System.out.println("[ACCEPT] Creating inventory for product " + offer.getProductId() 
            + " with quantity " + dispatchQuantity);

        retailerInventoryRepository.save(inventory);

        return ResponseEntity.ok(Map.of(
            "message", "Accepted",
            "inventoryId", inventory.getId(),
            "quantity", inventory.getQuantity(),
            "status", inventory.getStatus()
        ));
    }

    // 🔹 Reject offer
    @PostMapping("/reject/{id}")
    @PreAuthorize("hasRole('RETAILER')")
    @Transactional
    public ResponseEntity<?> reject(@PathVariable Long id, Principal principal) {

        User retailer = userRepository.findByEmail(principal.getName()).orElseThrow();
        DispatchOffer offer = dispatchOfferRepository.findById(id).orElseThrow();

        offer.setStatus("REJECTED");
        dispatchOfferRepository.save(offer);

        return ResponseEntity.ok(Map.of("message", "Rejected"));
    }
    @GetMapping("/retailer/inventory")
@PreAuthorize("hasRole('RETAILER')")
public List<RetailerInventory> getRetailerInventory(Principal principal) {

    User retailer = userRepository.findByEmail(principal.getName()).orElseThrow();

    return retailerInventoryRepository.findByRetailerId(retailer.getId());
}
}