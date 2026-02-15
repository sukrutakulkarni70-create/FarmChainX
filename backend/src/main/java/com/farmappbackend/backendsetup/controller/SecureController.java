package com.farmappbackend.backendsetup.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SecureController {

    @GetMapping("/api/secure/test")
    public String secureTest() {
        return "You are authenticated!";
    }
}
