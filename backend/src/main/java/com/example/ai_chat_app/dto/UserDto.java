package com.example.ai_chat_app.dto;

import com.example.ai_chat_app.model.User;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String status;
    private String department;
    private String avatarUrl;

    public UserDto() {}

    public UserDto(User user) {
        if (user != null) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.role = user.getRole();
            this.status = user.getStatus();
            this.department = user.getDepartment();
            this.avatarUrl = user.getAvatarUrl();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    @JsonProperty("full_name")
    public String getFullNameSnake() { return fullName; }

    @JsonProperty("fullName")
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    @JsonProperty("avatar_url")
    public String getAvatarUrlSnake() { return avatarUrl; }

    @JsonProperty("avatarUrl")
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
