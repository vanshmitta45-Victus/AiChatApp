package com.example.ai_chat_app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "swarm_executions")
public class SwarmExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_key", nullable = false, length = 50)
    private String taskKey;

    @Column(name = "task_title", nullable = false, length = 255)
    private String taskTitle;

    @Column(nullable = false, length = 30)
    private String priority;

    @Column(nullable = false, length = 30)
    private String status = "COMPLETED"; // COMPLETED, IN_PROGRESS, FAILED

    @Column(name = "assigned_engineer", length = 120)
    private String assignedEngineer;

    @Column(name = "pm_rationale", columnDefinition = "TEXT")
    private String pmRationale;

    @Column(name = "suspected_file", length = 255)
    private String suspectedFile;

    @Column(name = "root_cause_analysis", columnDefinition = "TEXT")
    private String rootCauseAnalysis;

    @Column(name = "dispatched_channel", length = 120)
    private String dispatchedChannel;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs = 0L;

    @Column(name = "step_logs", columnDefinition = "TEXT")
    private String stepLogs;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public SwarmExecution() {}

    public SwarmExecution(String taskKey, String taskTitle, String priority, String status,
                          String assignedEngineer, String pmRationale, String suspectedFile,
                          String rootCauseAnalysis, String dispatchedChannel,
                          Long executionTimeMs, String stepLogs) {
        this.taskKey = taskKey;
        this.taskTitle = taskTitle;
        this.priority = priority;
        this.status = status;
        this.assignedEngineer = assignedEngineer;
        this.pmRationale = pmRationale;
        this.suspectedFile = suspectedFile;
        this.rootCauseAnalysis = rootCauseAnalysis;
        this.dispatchedChannel = dispatchedChannel;
        this.executionTimeMs = executionTimeMs != null ? executionTimeMs : 0L;
        this.stepLogs = stepLogs;
        this.createdAt = LocalDateTime.now();
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
