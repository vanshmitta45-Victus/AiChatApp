package com.example.ai_chat_app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class NoteRequest {

    private String title;

    @NotBlank(message = "Note content cannot be empty")
    private String content;

    // slate, amber, emerald, blue, indigo, violet, rose
    private String color = "slate";

    @JsonProperty("is_pinned")
    private Boolean isPinned = false;

    @JsonProperty("is_archived")
    private Boolean isArchived = false;

    private List<String> tags = new ArrayList<>();

    public NoteRequest() {}

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
}
