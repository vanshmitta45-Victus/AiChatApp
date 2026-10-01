package com.example.ai_chat_app.service;

import com.example.ai_chat_app.dto.CreateUserRequest;
import com.example.ai_chat_app.dto.UpdateUserRequest;
import com.example.ai_chat_app.dto.UserDirectoryDto;
import com.example.ai_chat_app.model.User;
import com.example.ai_chat_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserDirectoryDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDirectoryDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDirectoryDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + id));
        return new UserDirectoryDto(user);
    }

    public UserDirectoryDto createUser(CreateUserRequest request) {
        String cleanUsername = request.getUsername().trim();
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsernameIgnoreCase(cleanUsername)) {
            throw new IllegalArgumentException("Username '" + cleanUsername + "' is already taken");
        }
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new IllegalArgumentException("Email '" + cleanEmail + "' is already registered");
        }

        String role = validateAndNormalizeRole(request.getRole());

        User user = new User();
        user.setUsername(cleanUsername);
        user.setEmail(cleanEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        user.setFullName(request.getFullName().trim());
        user.setRole(role);
        user.setStatus("ACTIVE");
        user.setDepartment(request.getDepartment() != null ? request.getDepartment().trim() : "General");
        user.setAvatarUrl(request.getAvatarUrl());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return new UserDirectoryDto(saved);
    }

    public UserDirectoryDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + id));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equalsIgnoreCase(user.getUsername()) && userRepository.existsByUsernameIgnoreCase(newUsername)) {
                throw new IllegalArgumentException("Username '" + newUsername + "' is already taken");
            }
            user.setUsername(newUsername);
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCase(newEmail)) {
                throw new IllegalArgumentException("Email '" + newEmail + "' is already registered");
            }
            user.setEmail(newEmail);
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getPassword().length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            user.setRole(validateAndNormalizeRole(request.getRole()));
        }

        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String status = request.getStatus().trim().toUpperCase();
            if (!status.equals("ACTIVE") && !status.equals("SUSPENDED") && !status.equals("DEACTIVATED")) {
                throw new IllegalArgumentException("Invalid status: " + status + ". Allowed: ACTIVE, SUSPENDED, DEACTIVATED");
            }
            user.setStatus(status);
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);
        return new UserDirectoryDto(updated);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + id));
        userRepository.delete(user);
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
            case "STAFF", "EMPLOYEE" -> "STAFF";
            default -> throw new IllegalArgumentException("Invalid role: " + rawRole + ". Must be ADMIN, MANAGER, TEAM_LEADER, or STAFF");
        };
    }
}
