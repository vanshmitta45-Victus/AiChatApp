package com.example.ai_chat_app.dto;

import com.example.ai_chat_app.model.Conversation;
import com.example.ai_chat_app.model.ConversationParticipant;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ConversationDto {

    private Long id;
    private String type;
    private String title;
    private String description;

    @JsonProperty("created_by_id")
    private Long createdById;

    @JsonProperty("created_by_username")
    private String createdByUsername;

    @JsonProperty("target_handler_id")
    private Long targetHandlerId;

    @JsonProperty("target_handler_username")
    private String targetHandlerUsername;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    private List<ParticipantDto> participants = new ArrayList<>();

    public ConversationDto() {}

    public ConversationDto(Conversation conv) {
        if (conv != null) {
            this.id = conv.getId();
            this.type = conv.getType();
            this.title = conv.getTitle();
            this.description = conv.getDescription();
            if (conv.getCreatedBy() != null) {
                this.createdById = conv.getCreatedBy().getId();
                this.createdByUsername = conv.getCreatedBy().getUsername();
            }
            if (conv.getTargetHandler() != null) {
                this.targetHandlerId = conv.getTargetHandler().getId();
                this.targetHandlerUsername = conv.getTargetHandler().getUsername();
            }
            this.createdAt = conv.getCreatedAt();
            if (conv.getParticipants() != null) {
                for (ConversationParticipant p : conv.getParticipants()) {
                    if (p.getUser() != null) {
                        this.participants.add(new ParticipantDto(
                                p.getUser().getId(),
                                p.getUser().getUsername(),
                                p.getUser().getFullName(),
                                p.getUser().getRole(),
                                p.getCanPost()
                        ));
                    }
                }
            }
        }
    }

    public static class ParticipantDto {
        private Long userId;
        private String username;
        private String fullName;
        private String role;
        private Boolean canPost;

        public ParticipantDto() {}

        public ParticipantDto(Long userId, String username, String fullName, String role, Boolean canPost) {
            this.userId = userId;
            this.username = username;
            this.fullName = fullName;
            this.role = role;
            this.canPost = canPost;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public Boolean getCanPost() { return canPost; }
        public void setCanPost(Boolean canPost) { this.canPost = canPost; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }

    public String getCreatedByUsername() { return createdByUsername; }
    public void setCreatedByUsername(String createdByUsername) { this.createdByUsername = createdByUsername; }

    public Long getTargetHandlerId() { return targetHandlerId; }
    public void setTargetHandlerId(Long targetHandlerId) { this.targetHandlerId = targetHandlerId; }

    public String getTargetHandlerUsername() { return targetHandlerUsername; }
    public void setTargetHandlerUsername(String targetHandlerUsername) { this.targetHandlerUsername = targetHandlerUsername; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<ParticipantDto> getParticipants() { return participants; }
    public void setParticipants(List<ParticipantDto> participants) { this.participants = participants; }
}
