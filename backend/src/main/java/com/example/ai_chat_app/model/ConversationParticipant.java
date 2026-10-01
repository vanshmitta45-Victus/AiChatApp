package com.example.ai_chat_app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_participants")
public class ConversationParticipant {

    @EmbeddedId
    private ConversationParticipantId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("conversationId")
    @JoinColumn(name = "conversation_id")
    @JsonIgnoreProperties("participants")
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "can_post", nullable = false)
    private Boolean canPost = true;

    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    public ConversationParticipant() {}

    public ConversationParticipant(Conversation conversation, User user, Boolean canPost) {
        this.conversation = conversation;
        this.user = user;
        this.canPost = canPost != null ? canPost : true;
        this.id = new ConversationParticipantId(
                conversation != null ? conversation.getId() : null,
                user != null ? user.getId() : null
        );
    }

    @PrePersist
    protected void onCreate() {
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
        if (id == null && conversation != null && user != null) {
            id = new ConversationParticipantId(conversation.getId(), user.getId());
        }
    }

    public ConversationParticipantId getId() { return id; }
    public void setId(ConversationParticipantId id) { this.id = id; }

    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Boolean getCanPost() { return canPost; }
    public void setCanPost(Boolean canPost) { this.canPost = canPost; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
