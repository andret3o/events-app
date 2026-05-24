package com.example.demo.user.dto;

import com.example.demo.user.User;
import com.example.demo.user.enums.Role;

public record UserResponse(
    Long id,
    String name,
    String username,
    String email,
    Role role
) {
    public static UserResponse from(User user){
        return new UserResponse(
            user.getId(), 
            user.getName(), 
            user.getUsername(), 
            user.getEmail(), 
            user.getRole()
        );
    }
}