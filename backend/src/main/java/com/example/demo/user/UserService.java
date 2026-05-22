package com.example.demo.user;

import org.springframework.stereotype.Service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.user.dto.UserResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    // Private response, use only for /me
    public UserResponse getUserById(Long id) {
        return UserResponse.from(findOrThrow(id));
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }
}
