package com.example.ai_chat_app.dto;

import com.example.ai_chat_app.model.Task;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class TaskDto {
    private Long id;
    private String key;
    private String taskKey;
    private String projectKey;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String assignee;
    private Long assigneeId;
    private String reporter;
    private LocalDate dueDate;
    private Integer storyPoints;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TaskDto() {}

    public TaskDto(Task task) {
        if (task != null) {
            this.id = task.getId();
            this.taskKey = task.getTaskKey();
            this.key = task.getTaskKey();
            if (task.getProject() != null) {
                this.projectKey = task.getProject().getKey();
            }
            this.title = task.getTitle();
            this.description = task.getDescription();
            this.status = task.getStatus();
            this.priority = task.getPriority();
            if (task.getAssignee() != null) {
                this.assignee = task.getAssignee().getFullName() != null 
                        ? task.getAssignee().getFullName() 
                        : task.getAssignee().getUsername();
                this.assigneeId = task.getAssignee().getId();
            }
            if (task.getReporter() != null) {
                this.reporter = task.getReporter().getFullName() != null 
                        ? task.getReporter().getFullName() 
                        : task.getReporter().getUsername();
            }
            this.dueDate = task.getDueDate();
            this.storyPoints = task.getStoryPoints() != null ? task.getStoryPoints() : 0;
            this.createdAt = task.getCreatedAt();
            this.updatedAt = task.getUpdatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getKey() { return key != null ? key : taskKey; }
    public void setKey(String key) { this.key = key; this.taskKey = key; }

    public String getTaskKey() { return taskKey != null ? taskKey : key; }
    public void setTaskKey(String taskKey) { this.taskKey = taskKey; this.key = taskKey; }

    public String getProjectKey() { return projectKey; }
    public void setProjectKey(String projectKey) { this.projectKey = projectKey; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }

    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }

    public String getReporter() { return reporter; }
    public void setReporter(String reporter) { this.reporter = reporter; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
