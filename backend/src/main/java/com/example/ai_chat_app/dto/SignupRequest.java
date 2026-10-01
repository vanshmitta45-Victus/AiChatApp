package com.example.ai_chat_app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SignupRequest {

    private String username;

    @JsonProperty("full_name")
    private String fullName;

    private String email;
    private String password;

    // ADMIN, MANAGER, TEAM_LEADER, STAFF
    private String role;
    private String department;

    @JsonProperty("avatar_url")
    private String avatarUrl;

    public SignupRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
