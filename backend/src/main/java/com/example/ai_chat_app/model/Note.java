package com.example.ai_chat_app.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notes")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password"})
    private User user;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // slate, amber, emerald, blue, indigo, violet, rose
    @Column(length = 20)
    private String color = "slate";

    @Column(name = "is_pinned", nullable = false)
    @JsonProperty("is_pinned")
    @JsonAlias({"is_pinned", "isPinned", "pinned"})
    private Boolean isPinned = false;

    @Column(name = "is_archived", nullable = false)
    @JsonProperty("is_archived")
    @JsonAlias({"is_archived", "isArchived", "archived"})
    private Boolean isArchived = false;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tags", columnDefinition = "text[]")
    private List<String> tags = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Note() {}

    public Note(User user, String title, String content, String color) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.color = (color != null && !color.isBlank()) ? color : "slate";
        this.isPinned = false;
        this.isArchived = false;
        this.tags = new ArrayList<>();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (color == null || color.isBlank()) {
            color = "slate";
        }
        if (isPinned == null) {
            isPinned = false;
        }
        if (isArchived == null) {
            isArchived = false;
        }
        if (tags == null) {
            tags = new ArrayList<>();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (color == null || color.isBlank()) {
            color = "slate";
        }
        if (tags == null) {
            tags = new ArrayList<>();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    @JsonProperty("is_pinned")
    public Boolean getIsPinned() { return isPinned; }
    public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned; }

    @JsonProperty("isPinned")
    public Boolean getIsPinnedCamel() { return isPinned; }

    @JsonProperty("is_archived")
    public Boolean getIsArchived() { return isArchived; }
    public void setIsArchived(Boolean isArchived) { this.isArchived = isArchived; }

    @JsonProperty("isArchived")
    public Boolean getIsArchivedCamel() { return isArchived; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
