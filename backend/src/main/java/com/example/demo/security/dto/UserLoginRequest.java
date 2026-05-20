package com.example.demo.security.dto;

public record UserLoginRequest(
        String username,
        String password
) {
}
