package com.expenseshare.service;

import com.expenseshare.dto.AuthResponse;
import com.expenseshare.dto.LoginRequest;
import com.expenseshare.dto.SignupRequest;
import com.expenseshare.dto.UserResponse;
import com.expenseshare.entity.User;
import com.expenseshare.exception.BadRequestException;
import com.expenseshare.repository.UserRepository;
import com.expenseshare.security.JwtTokenProvider;
import com.expenseshare.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for authentication operations.
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    /**
     * Register a new user with email and password.
     */
    @Transactional
    public AuthResponse registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new BadRequestException("Email address already in use");
        }

        User user = User.builder()
                .name(signupRequest.getName())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .provider(User.AuthProvider.LOCAL)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                UserPrincipal.create(savedUser),
                null,
                UserPrincipal.create(savedUser).getAuthorities()
        );

        String token = tokenProvider.generateToken(authentication);
        UserResponse userResponse = userService.mapToUserResponse(savedUser);

        return new AuthResponse(token, userResponse);
    }

    /**
     * Login user with email and password.
     */
    public AuthResponse loginUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        UserResponse userResponse = userService.mapToUserResponse(user);

        return new AuthResponse(token, userResponse);
    }
}
