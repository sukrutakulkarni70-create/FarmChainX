package com.farmappbackend.backendsetup.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.farmappbackend.backendsetup.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByResetToken(String resetToken);

    boolean existsByEmail(String email);
}
