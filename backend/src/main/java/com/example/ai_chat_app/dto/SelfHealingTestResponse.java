package com.example.ai_chat_app.dto;

import java.util.List;

public class SelfHealingTestResponse {
    private String primaryHealedLocator;
    private String locatorType;
    private List<String> alternativeLocators;
    private Double confidenceScore;
    private String rootCauseAnalysis;
    private String explanation;
    private String healedCodeSnippet;
    private String resilientBestPractices;
    private Long executionLatencyMs;

    public SelfHealingTestResponse() {}

    public String getPrimaryHealedLocator() { return primaryHealedLocator; }
    public void setPrimaryHealedLocator(String primaryHealedLocator) { this.primaryHealedLocator = primaryHealedLocator; }

    public String getLocatorType() { return locatorType; }
    public void setLocatorType(String locatorType) { this.locatorType = locatorType; }

    public List<String> getAlternativeLocators() { return alternativeLocators; }
    public void setAlternativeLocators(List<String> alternativeLocators) { this.alternativeLocators = alternativeLocators; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getRootCauseAnalysis() { return rootCauseAnalysis; }
    public void setRootCauseAnalysis(String rootCauseAnalysis) { this.rootCauseAnalysis = rootCauseAnalysis; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getHealedCodeSnippet() { return healedCodeSnippet; }
    public void setHealedCodeSnippet(String healedCodeSnippet) { this.healedCodeSnippet = healedCodeSnippet; }

    public String getResilientBestPractices() { return resilientBestPractices; }
    public void setResilientBestPractices(String resilientBestPractices) { this.resilientBestPractices = resilientBestPractices; }

    public Long getExecutionLatencyMs() { return executionLatencyMs; }
    public void setExecutionLatencyMs(Long executionLatencyMs) { this.executionLatencyMs = executionLatencyMs; }
}
