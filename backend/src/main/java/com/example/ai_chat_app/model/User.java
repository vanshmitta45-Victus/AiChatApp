package com.example.ai_chat_app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    // Roles: ADMIN, MANAGER, TEAM_LEADER, STAFF
    @Column(nullable = false, length = 30)
    private String role;

    // Status: ACTIVE, SUSPENDED, DEACTIVATED
    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(length = 100)
    private String department;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public User() {
    }

    public User(String username, String email, String password, String fullName, String role, String department) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = normalizeRole(role);
        this.department = department;
        this.status = "ACTIVE";
    }

    // Backward-compatible constructor
    public User(String email, String password, String fullName, String role, String department) {
        this(email != null && email.contains("@") ? email.split("@")[0] : email, email, password, fullName, role, department);
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
        if (role != null) {
            role = normalizeRole(role);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (role != null) {
            role = normalizeRole(role);
        }
    }

    private String normalizeRole(String rawRole) {
        if (rawRole == null) return "STAFF";
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = normalizeRole(role);
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isActive() {
        return "ACTIVE".equalsIgnoreCase(this.status);
    }
}
