package com.example.ai_chat_app.dto;

public class AgentChatRequest {
    private String prompt;
    private Long channelId;
    private String assistant; // "@helpdesk", "@pm", "@support", or null
    private String model;

    public AgentChatRequest() {}

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public Long getChannelId() { return channelId; }
    public void setChannelId(Long channelId) { this.channelId = channelId; }

    public String getAssistant() { return assistant; }
    public void setAssistant(String assistant) { this.assistant = assistant; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
}
