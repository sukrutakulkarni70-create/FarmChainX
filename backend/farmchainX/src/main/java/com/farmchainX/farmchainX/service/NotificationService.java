package com.farmchainX.farmchainX.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.farmchainX.farmchainX.model.Notification;
import com.farmchainX.farmchainX.model.User;
import com.farmchainX.farmchainX.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Create notification
    public void createNotification(User user, String title, String message) {
        Notification notification = new Notification(user, title, message);
        notificationRepository.save(notification);
    }

    // Get top 4 unread
    public List<Notification> getTopNotifications(User user) {
        return notificationRepository.findTop4ByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    // Get all unread
    public List<Notification> getAllNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    // Mark as read
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
    public Notification getById(Long id) {
    return notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
}
}