package com.expenseshare.controller;

import com.expenseshare.dto.AuthResponse;
import com.expenseshare.dto.LoginRequest;
import com.expenseshare.dto.SignupRequest;
import com.expenseshare.dto.UserResponse;
import com.expenseshare.service.AuthService;
import com.expenseshare.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    /**
     * Register a new user.
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        AuthResponse response = authService.registerUser(signupRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Login user.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.loginUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Get current user details.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        UserResponse user = userService.mapToUserResponse(userService.getCurrentUser());
        return ResponseEntity.ok(user);
    }
}
