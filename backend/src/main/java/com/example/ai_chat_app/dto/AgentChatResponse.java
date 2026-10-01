package com.example.ai_chat_app.dto;

import java.util.List;

public class AgentChatResponse {
    private String reply;
    private List<ToolExecutionRecord> toolExecutions;
    private boolean ticketsUpdated;
    private String activeAssistant;
    private Long channelId;

    public AgentChatResponse() {}

    public AgentChatResponse(String reply, List<ToolExecutionRecord> toolExecutions, boolean ticketsUpdated, String activeAssistant, Long channelId) {
        this.reply = reply;
        this.toolExecutions = toolExecutions;
        this.ticketsUpdated = ticketsUpdated;
        this.activeAssistant = activeAssistant;
        this.channelId = channelId;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public List<ToolExecutionRecord> getToolExecutions() { return toolExecutions; }
    public void setToolExecutions(List<ToolExecutionRecord> toolExecutions) { this.toolExecutions = toolExecutions; }

    public boolean isTicketsUpdated() { return ticketsUpdated; }
    public void setTicketsUpdated(boolean ticketsUpdated) { this.ticketsUpdated = ticketsUpdated; }

    public String getActiveAssistant() { return activeAssistant; }
    public void setActiveAssistant(String activeAssistant) { this.activeAssistant = activeAssistant; }

    public Long getChannelId() { return channelId; }
    public void setChannelId(Long channelId) { this.channelId = channelId; }
}
