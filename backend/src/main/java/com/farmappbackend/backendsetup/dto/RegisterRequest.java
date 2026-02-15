package com.farmappbackend.backendsetup.dto;

import com.farmappbackend.backendsetup.entity.Role;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phoneNumber;

    private Role role;
}
