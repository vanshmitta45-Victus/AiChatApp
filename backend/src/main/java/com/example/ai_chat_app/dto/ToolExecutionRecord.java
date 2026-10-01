package com.example.ai_chat_app.dto;

import java.util.Map;

public class ToolExecutionRecord {
    private String toolName;
    private Map<String, Object> arguments;
    private String status; // SUCCESS, ERROR, PERMISSION_DENIED
    private String summary;

    public ToolExecutionRecord() {}

    public ToolExecutionRecord(String toolName, Map<String, Object> arguments, String status, String summary) {
        this.toolName = toolName;
        this.arguments = arguments;
        this.status = status;
        this.summary = summary;
    }

    public String getToolName() { return toolName; }
    public void setToolName(String toolName) { this.toolName = toolName; }

    public Map<String, Object> getArguments() { return arguments; }
    public void setArguments(Map<String, Object> arguments) { this.arguments = arguments; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}
