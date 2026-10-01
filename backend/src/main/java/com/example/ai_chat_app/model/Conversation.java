package com.example.ai_chat_app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Topologies: ONE_TO_ONE, MANY_TO_MANY, ONE_TO_MANY, MANY_TO_ONE
    @Column(nullable = false, length = 30)
    private String type;

    @Column(length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by")
    private User createdBy;

    // Specific handler for MANY_TO_ONE helpdesk
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_handler_id")
    private User targetHandler;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("conversation")
    private List<ConversationParticipant> participants = new ArrayList<>();

    public Conversation() {}

    public Conversation(String type, String title, String description, User createdBy) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.createdBy = createdBy;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public User getTargetHandler() { return targetHandler; }
    public void setTargetHandler(User targetHandler) { this.targetHandler = targetHandler; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<ConversationParticipant> getParticipants() { return participants; }
    public void setParticipants(List<ConversationParticipant> participants) { this.participants = participants; }
}
