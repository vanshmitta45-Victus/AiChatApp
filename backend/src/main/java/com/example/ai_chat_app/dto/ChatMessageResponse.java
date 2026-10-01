package com.example.ai_chat_app.dto;

import com.example.ai_chat_app.model.Message;
import com.example.ai_chat_app.model.MessageMention;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ChatMessageResponse {

    private Long id;

    @JsonProperty("conversation_id")
    private Long conversationId;

    @JsonProperty("sender_id")
    private Long senderId;

    @JsonProperty("sender_username")
    private String senderUsername;

    @JsonProperty("sender_full_name")
    private String senderFullName;

    @JsonProperty("sender_avatar_url")
    private String senderAvatarUrl;

    private String content;

    @JsonProperty("message_type")
    private String messageType;

    @JsonProperty("file_url")
    private String fileUrl;

    @JsonProperty("file_name")
    private String fileName;

    @JsonProperty("file_size")
    private Long fileSize;

    @JsonProperty("mime_type")
    private String mimeType;

    private Double latitude;
    private Double longitude;

    @JsonProperty("location_label")
    private String locationLabel;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    private List<String> mentions = new ArrayList<>();

    public ChatMessageResponse() {}

    public ChatMessageResponse(Message message) {
        if (message != null) {
            this.id = message.getId();
            if (message.getConversation() != null) {
                this.conversationId = message.getConversation().getId();
            }
            if (message.getSender() != null) {
                this.senderId = message.getSender().getId();
                this.senderUsername = message.getSender().getUsername();
                this.senderFullName = message.getSender().getFullName();
                this.senderAvatarUrl = message.getSender().getAvatarUrl();
            }
            this.content = message.getContent();
            this.messageType = message.getMessageType();
            this.fileUrl = message.getFileUrl();
            this.fileName = message.getFileName();
            this.fileSize = message.getFileSize();
            this.mimeType = message.getMimeType();
            this.latitude = message.getLatitude();
            this.longitude = message.getLongitude();
            this.locationLabel = message.getLocationLabel();
            this.createdAt = message.getCreatedAt();

            if (message.getMentions() != null) {
                for (MessageMention m : message.getMentions()) {
                    if (m.getMentionedUser() != null) {
                        this.mentions.add(m.getMentionedUser().getUsername());
                    }
                }
            }
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }

    public String getSenderFullName() { return senderFullName; }
    public void setSenderFullName(String senderFullName) { this.senderFullName = senderFullName; }

    public String getSenderAvatarUrl() { return senderAvatarUrl; }
    public void setSenderAvatarUrl(String senderAvatarUrl) { this.senderAvatarUrl = senderAvatarUrl; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    @JsonProperty("media_url")
    public String getMediaUrl() { return fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getLocationLabel() { return locationLabel; }
    public void setLocationLabel(String locationLabel) { this.locationLabel = locationLabel; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<String> getMentions() { return mentions; }
    public void setMentions(List<String> mentions) { this.mentions = mentions; }
}
