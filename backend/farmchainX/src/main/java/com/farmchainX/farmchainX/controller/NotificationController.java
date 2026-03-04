package com.farmchainX.farmchainX.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmchainX.farmchainX.model.Notification;
import com.farmchainX.farmchainX.model.User;
import com.farmchainX.farmchainX.repository.UserRepository;
import com.farmchainX.farmchainX.service.NotificationService;
import com.farmchainX.farmchainX.service.AuthService;
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService,
                                  UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // Get top 4 unread notifications
    @GetMapping
    public List<Notification> getTopNotifications(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationService.getTopNotifications(user);
    }

    // Get all unread notifications
    @GetMapping("/all")
    public List<Notification> getAllNotifications(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationService.getAllNotifications(user);
    }

   @PutMapping("/{id}/read")
public void markAsRead(@PathVariable Long id, Principal principal) {

    User user = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

    Notification notification = notificationService.getById(id);

    if (!notification.getUser().getId().equals(user.getId())) {
        throw new RuntimeException("Unauthorized access");
    }

    notificationService.markAsRead(id);
}

}