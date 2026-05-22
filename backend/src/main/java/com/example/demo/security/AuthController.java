package com.example.demo.security;

import com.example.demo.security.dto.UserLoginRequest;
import com.example.demo.security.dto.UserRegistrationRequest;
import com.example.demo.user.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;
    // private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationRequest request) {
        User user = authService.registerUser(request);

        String jwt = authService.authenticateUser(
                new UserLoginRequest(
                        request.username(),
                        request.password()
                )
        );

        ResponseCookie cookie = ResponseCookie.from("access_token", jwt)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Lax")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginRequest request) {
        String jwt = authService.authenticateUser(request);
        User user = authService.getUserByUsername(request.username());

        ResponseCookie cookie = ResponseCookie.from("access_token", jwt)
                .httpOnly(true)       // Prevents JavaScript access (XSS protection)
                .secure(false)       // Set to 'true' in production (requires HTTPS)
                .path("/")           // Available for all routes
                .maxAge(24 * 60 * 60) // 24 hours expiration
                .sameSite("Lax")     // CSRF protection
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(false) // Set to true in production
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }
}