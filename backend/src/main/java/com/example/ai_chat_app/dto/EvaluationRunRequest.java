package com.example.ai_chat_app.dto;

public class EvaluationRunRequest {
    private String suite; // ALL, RAG, RESUME, CODE, MEMORY
    private String model; // default llama3.2

    public EvaluationRunRequest() {}

    public EvaluationRunRequest(String suite, String model) {
        this.suite = suite;
        this.model = model;
    }

    public String getSuite() { return suite != null ? suite : "ALL"; }
    public void setSuite(String suite) { this.suite = suite; }

    public String getModel() { return model != null ? model : "llama3.2"; }
    public void setModel(String model) { this.model = model; }
}
