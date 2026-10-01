package com.example.ai_chat_app.dto;

import java.time.LocalDateTime;

public class DocumentSummary {
    private String documentName;
    private long chunkCount;
    private LocalDateTime uploadedAt;

    public DocumentSummary() {}

    public DocumentSummary(String documentName, long chunkCount, LocalDateTime uploadedAt) {
        this.documentName = documentName;
        this.chunkCount = chunkCount;
        this.uploadedAt = uploadedAt;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public long getChunkCount() {
        return chunkCount;
    }

    public void setChunkCount(long chunkCount) {
        this.chunkCount = chunkCount;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
