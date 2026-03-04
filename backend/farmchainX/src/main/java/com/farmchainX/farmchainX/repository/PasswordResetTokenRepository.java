package com.farmchainX.farmchainX.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.farmchainX.farmchainX.model.PasswordResetToken;
import com.farmchainX.farmchainX.model.User;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUser(User user);
}