package com.example.ai_chat_app.dto;

import com.example.ai_chat_app.model.SwarmExecution;
import java.time.LocalDateTime;

public class SwarmExecutionDto {
    private Long id;
    private String taskKey;
    private String taskTitle;
    private String priority;
    private String status;
    private String assignedEngineer;
    private String pmRationale;
    private String suspectedFile;
    private String rootCauseAnalysis;
    private String dispatchedChannel;
    private Long executionTimeMs;
    private String stepLogs;
    private LocalDateTime createdAt;

    public SwarmExecutionDto() {}

    public SwarmExecutionDto(SwarmExecution entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.taskKey = entity.getTaskKey();
            this.taskTitle = entity.getTaskTitle();
            this.priority = entity.getPriority();
            this.status = entity.getStatus();
            this.assignedEngineer = entity.getAssignedEngineer();
            this.pmRationale = entity.getPmRationale();
            this.suspectedFile = entity.getSuspectedFile();
            this.rootCauseAnalysis = entity.getRootCauseAnalysis();
            this.dispatchedChannel = entity.getDispatchedChannel();
            this.executionTimeMs = entity.getExecutionTimeMs();
            this.stepLogs = entity.getStepLogs();
            this.createdAt = entity.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTaskKey() { return taskKey; }
    public void setTaskKey(String taskKey) { this.taskKey = taskKey; }

    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedEngineer() { return assignedEngineer; }
    public void setAssignedEngineer(String assignedEngineer) { this.assignedEngineer = assignedEngineer; }

    public String getPmRationale() { return pmRationale; }
    public void setPmRationale(String pmRationale) { this.pmRationale = pmRationale; }

    public String getSuspectedFile() { return suspectedFile; }
    public void setSuspectedFile(String suspectedFile) { this.suspectedFile = suspectedFile; }

    public String getRootCauseAnalysis() { return rootCauseAnalysis; }
    public void setRootCauseAnalysis(String rootCauseAnalysis) { this.rootCauseAnalysis = rootCauseAnalysis; }

    public String getDispatchedChannel() { return dispatchedChannel; }
    public void setDispatchedChannel(String dispatchedChannel) { this.dispatchedChannel = dispatchedChannel; }

    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public String getStepLogs() { return stepLogs; }
    public void setStepLogs(String stepLogs) { this.stepLogs = stepLogs; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
