package com.example.ai_chat_app.dto;

public class ChatRequest {
    private String prompt;
    private String model;
    private Boolean useRag = true;

    public ChatRequest() {}

    public ChatRequest(String prompt, String model) {
        this.prompt = prompt;
        this.model = model;
        this.useRag = true;
    }

    public ChatRequest(String prompt, String model, Boolean useRag) {
        this.prompt = prompt;
        this.model = model;
        this.useRag = useRag != null ? useRag : true;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Boolean getUseRag() {
        return useRag;
    }

    public void setUseRag(Boolean useRag) {
        this.useRag = useRag;
    }
}
