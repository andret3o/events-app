package com.example.demo.security;

import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.security.dto.UserLoginRequest;
import com.example.demo.security.dto.UserRegistrationRequest;
import com.example.demo.user.User;
import com.example.demo.user.UserRepository;
import com.example.demo.user.enums.Role;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    public User registerUser(UserRegistrationRequest dto) {
        if (userRepository.existsByEmail(dto.email()))  {
            throw new DuplicateResourceException("Email '" + dto.email() + "' is already registered.");
        }

        if (userRepository.existsByUsername(dto.username())) {
            throw new DuplicateResourceException("Username '" + dto.username() + "' is already registered.");
        }

        User user = User.builder()
                .name(dto.name())
                .username(dto.username().toLowerCase())
                .email(dto.email())
                .password(passwordEncoder.encode(dto.password()))
                .role(Role.USER)
                .build();


        return userRepository.save(user);
    }

    public String authenticateUser(UserLoginRequest dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        dto.username(),
                        dto.password()
                )
        );
        return jwtUtil.generateToken(dto.username());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }
}