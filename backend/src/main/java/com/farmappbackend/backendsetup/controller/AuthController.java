package com.farmappbackend.backendsetup.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmappbackend.backendsetup.dto.AuthResponse;
import com.farmappbackend.backendsetup.dto.LoginRequest;
import com.farmappbackend.backendsetup.dto.RegisterRequest;
import com.farmappbackend.backendsetup.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return "User Registered Successfully";
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return "Reset token generated";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam String token,
                                @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return "Password reset successful";
    }
}
