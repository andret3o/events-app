package com.example.demo.security;

import com.example.demo.security.dto.AuthResponse;
import com.example.demo.security.dto.UserLoginRequest;
import com.example.demo.security.dto.UserRegistrationRequest;
import com.example.demo.user.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationRequest request) {
        User user = authService.registerUser(request);

        String jwt = authService.authenticateUser(
                new UserLoginRequest(
                        request.username(),
                        request.password()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(jwt, 604800000));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody UserLoginRequest request) {
        String jwt = authService.authenticateUser(request);
        return ResponseEntity.ok().body(new AuthResponse(jwt, 604800000));
    }
}