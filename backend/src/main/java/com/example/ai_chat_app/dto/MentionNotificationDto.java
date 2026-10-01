package com.example.ai_chat_app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class MentionNotificationDto {

    @JsonProperty("message_id")
    private Long messageId;

    @JsonProperty("conversation_id")
    private Long conversationId;

    @JsonProperty("sender_username")
    private String senderUsername;

    @JsonProperty("sender_full_name")
    private String senderFullName;

    private String content;

    private LocalDateTime timestamp;

    public MentionNotificationDto() {}

    public MentionNotificationDto(Long messageId, Long conversationId, String senderUsername, String senderFullName, String content, LocalDateTime timestamp) {
        this.messageId = messageId;
        this.conversationId = conversationId;
        this.senderUsername = senderUsername;
        this.senderFullName = senderFullName;
        this.content = content;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
    }

    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }

    public String getSenderFullName() { return senderFullName; }
    public void setSenderFullName(String senderFullName) { this.senderFullName = senderFullName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
