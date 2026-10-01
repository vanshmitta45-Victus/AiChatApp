package com.example.ai_chat_app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "slack_messages")
public class SlackMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long channelId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id")
    private User sender;

    private String senderName;

    // "user", "assistant", "system", "tool"
    @Column(nullable = false)
    private String senderRole;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // Stored JSON metadata describing tool execution (e.g. toolName, args, result)
    @Column(columnDefinition = "TEXT")
    private String toolMeta;

    private LocalDateTime createdAt = LocalDateTime.now();

    public SlackMessage() {}

    public SlackMessage(Long channelId, User sender, String senderName, String senderRole, String content, String toolMeta) {
        this.channelId = channelId;
        this.sender = sender;
        this.senderName = senderName;
        this.senderRole = senderRole;
        this.content = content;
        this.toolMeta = toolMeta;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getChannelId() { return channelId; }
    public void setChannelId(Long channelId) { this.channelId = channelId; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getToolMeta() { return toolMeta; }
    public void setToolMeta(String toolMeta) { this.toolMeta = toolMeta; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
