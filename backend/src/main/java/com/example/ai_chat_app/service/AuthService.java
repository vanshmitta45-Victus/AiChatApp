package com.example.ai_chat_app.service;

import com.example.ai_chat_app.dto.AuthRequest;
import com.example.ai_chat_app.dto.AuthResponse;
import com.example.ai_chat_app.dto.SignupRequest;
import com.example.ai_chat_app.dto.UserDto;
import com.example.ai_chat_app.model.User;
import com.example.ai_chat_app.repository.UserRepository;
import com.example.ai_chat_app.security.CustomUserDetailsService;
import com.example.ai_chat_app.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponse signup(SignupRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        String username = (request.getUsername() != null && !request.getUsername().isBlank())
                ? request.getUsername().trim()
                : email.split("@")[0];

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username '" + username + "' is already taken");
        }

        String role = validateAndNormalizeRole(request.getRole());

        String department = (request.getDepartment() != null && !request.getDepartment().isBlank())
                ? request.getDepartment().trim()
                : "General";

        String fullName = (request.getFullName() != null && !request.getFullName().isBlank())
                ? request.getFullName().trim()
                : username;

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(fullName);
        user.setRole(role);
        user.setStatus("ACTIVE");
        user.setDepartment(department);
        user.setAvatarUrl(request.getAvatarUrl());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser);

        return new AuthResponse(token, new UserDto(savedUser));
    }

    public AuthResponse login(AuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Identifier and password are required");
        }

        String identifier = request.getEmail().trim();
        User user = userRepository.findByUsernameOrEmailIgnoreCase(identifier)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("Your account has been suspended. Please contact an administrator.");
        }
        if ("DEACTIVATED".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("Your account is deactivated.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtTokenProvider.generateToken(user);
        return new AuthResponse(token, new UserDto(user));
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            if (auth.getPrincipal() instanceof CustomUserDetailsService.CustomUserDetails userDetails) {
                return userDetails.getUser();
            }
            if (auth.getPrincipal() instanceof User user) {
                return user;
            }
            if (auth.getName() != null && !auth.getName().isBlank()) {
                return userRepository.findByUsernameOrEmailIgnoreCase(auth.getName()).orElse(null);
            }
        }
        // Fallback for development if no authentication context
        return userRepository.findAll().stream().findFirst().orElse(null);
    }

    private String validateAndNormalizeRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            return "STAFF";
        }
        String clean = rawRole.trim().toUpperCase();
        if (clean.startsWith("ROLE_")) {
            clean = clean.substring(5);
        }
        return switch (clean) {
            case "ADMIN" -> "ADMIN";
            case "MANAGER", "PROJECT_MANAGER" -> "MANAGER";
            case "TEAM_LEADER", "TEAM_LEAD", "IT_SUPPORT" -> "TEAM_LEADER";
            default -> "STAFF";
        };
    }
}
