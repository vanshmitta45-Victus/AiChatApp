package com.example.ai_chat_app.dto;

import com.example.ai_chat_app.model.Note;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class NoteDto {

    private Long id;

    @JsonProperty("user_id")
    private Long userId;

    private String username;
    private String title;
    private String content;
    private String color;

    @JsonProperty("is_pinned")
    private Boolean isPinned;

    @JsonProperty("is_archived")
    private Boolean isArchived;

    private List<String> tags = new ArrayList<>();

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    public NoteDto() {}

    public NoteDto(Note note) {
        if (note != null) {
            this.id = note.getId();
            if (note.getUser() != null) {
                this.userId = note.getUser().getId();
                this.username = note.getUser().getUsername();
            }
            this.title = note.getTitle();
            this.content = note.getContent();
            this.color = note.getColor();
            this.isPinned = note.getIsPinned();
            this.isArchived = note.getIsArchived();
            this.tags = note.getTags() != null ? new ArrayList<>(note.getTags()) : new ArrayList<>();
            this.createdAt = note.getCreatedAt();
            this.updatedAt = note.getUpdatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Boolean getIsPinned() { return isPinned; }
    public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned; }

    public Boolean getIsArchived() { return isArchived; }
    public void setIsArchived(Boolean isArchived) { this.isArchived = isArchived; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
