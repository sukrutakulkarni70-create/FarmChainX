package com.farmchainX.farmchainX.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.farmchainX.farmchainX.model.PasswordResetToken;
import com.farmchainX.farmchainX.model.User;
import com.farmchainX.farmchainX.repository.PasswordResetTokenRepository;
import com.farmchainX.farmchainX.repository.UserRepository;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                EmailService emailService,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    public void createPasswordResetToken(String email) {

        userRepository.findByEmail(email).ifPresent(user -> {

            // Delete old tokens
            tokenRepository.deleteByUser(user);

            String token = UUID.randomUUID().toString();

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(token);
            resetToken.setExpiryTime(LocalDateTime.now().plusMinutes(5));
            resetToken.setUsed(false);

            tokenRepository.save(resetToken);

            String resetLink = "http://localhost:4200/reset-password?token=" + token;

            emailService.sendPasswordResetEmail(email, resetLink);
        });
    }

    public void resetPassword(String token, String newPassword) {

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Token already used");
        }

        if (resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}