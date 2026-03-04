package com.farmchainX.farmchainX.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.farmchainX.farmchainX.model.Notification;
import com.farmchainX.farmchainX.model.User;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get unread notifications for a user (latest first)
    List<Notification> findTop4ByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    // Get all unread notifications (for "View All")
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
}