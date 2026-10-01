package com.example.ai_chat_app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_reports")
public class EvaluationReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "run_batch_id", nullable = false, length = 64)
    private String runBatchId;

    @Column(name = "test_suite_name", nullable = false, length = 120)
    private String testSuiteName;

    @Column(name = "test_case_name", nullable = false, length = 255)
    private String testCaseName;

    @Column(name = "endpoint_tested", nullable = false, length = 150)
    private String endpointTested;

    @Column(name = "model_used", nullable = false, length = 80)
    private String modelUsed;

    @Column(nullable = false, length = 30)
    private String status = "PASSED"; // PASSED, FAILED, WARNING

    @Column(name = "latency_ms", nullable = false)
    private Long latencyMs = 0L;

    @Column(name = "prompt_tokens")
    private Integer promptTokens = 0;

    @Column(name = "completion_tokens")
    private Integer completionTokens = 0;

    @Column(name = "total_tokens")
    private Integer totalTokens = 0;

    @Column(name = "grounding_score")
    private Double groundingScore = 1.0;

    @Column(name = "relevancy_score")
    private Double relevancyScore = 1.0;

    @Column(name = "input_payload", columnDefinition = "TEXT")
    private String inputPayload;

    @Column(name = "output_payload", columnDefinition = "TEXT")
    private String outputPayload;

    @Column(name = "assertion_results", columnDefinition = "TEXT")
    private String assertionResults;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public EvaluationReport() {}

    public EvaluationReport(String runBatchId, String testSuiteName, String testCaseName,
                            String endpointTested, String modelUsed, String status,
                            Long latencyMs, Integer promptTokens, Integer completionTokens,
                            Integer totalTokens, Double groundingScore, Double relevancyScore,
                            String inputPayload, String outputPayload, String assertionResults,
                            String errorMessage) {
        this.runBatchId = runBatchId;
        this.testSuiteName = testSuiteName;
        this.testCaseName = testCaseName;
        this.endpointTested = endpointTested;
        this.modelUsed = modelUsed;
        this.status = status;
        this.latencyMs = latencyMs != null ? latencyMs : 0L;
        this.promptTokens = promptTokens != null ? promptTokens : 0;
        this.completionTokens = completionTokens != null ? completionTokens : 0;
        this.totalTokens = totalTokens != null ? totalTokens : (this.promptTokens + this.completionTokens);
        this.groundingScore = groundingScore != null ? groundingScore : 1.0;
        this.relevancyScore = relevancyScore != null ? relevancyScore : 1.0;
        this.inputPayload = inputPayload;
        this.outputPayload = outputPayload;
        this.assertionResults = assertionResults;
        this.errorMessage = errorMessage;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRunBatchId() { return runBatchId; }
    public void setRunBatchId(String runBatchId) { this.runBatchId = runBatchId; }

    public String getTestSuiteName() { return testSuiteName; }
    public void setTestSuiteName(String testSuiteName) { this.testSuiteName = testSuiteName; }

    public String getTestCaseName() { return testCaseName; }
    public void setTestCaseName(String testCaseName) { this.testCaseName = testCaseName; }

    public String getEndpointTested() { return endpointTested; }
    public void setEndpointTested(String endpointTested) { this.endpointTested = endpointTested; }

    public String getModelUsed() { return modelUsed; }
    public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getLatencyMs() { return latencyMs; }
    public void setLatencyMs(Long latencyMs) { this.latencyMs = latencyMs; }

    public Integer getPromptTokens() { return promptTokens; }
    public void setPromptTokens(Integer promptTokens) { this.promptTokens = promptTokens; }

    public Integer getCompletionTokens() { return completionTokens; }
    public void setCompletionTokens(Integer completionTokens) { this.completionTokens = completionTokens; }

    public Integer getTotalTokens() { return totalTokens; }
    public void setTotalTokens(Integer totalTokens) { this.totalTokens = totalTokens; }

    public Double getGroundingScore() { return groundingScore; }
    public void setGroundingScore(Double groundingScore) { this.groundingScore = groundingScore; }

    public Double getRelevancyScore() { return relevancyScore; }
    public void setRelevancyScore(Double relevancyScore) { this.relevancyScore = relevancyScore; }

    public String getInputPayload() { return inputPayload; }
    public void setInputPayload(String inputPayload) { this.inputPayload = inputPayload; }

    public String getOutputPayload() { return outputPayload; }
    public void setOutputPayload(String outputPayload) { this.outputPayload = outputPayload; }

    public String getAssertionResults() { return assertionResults; }
    public void setAssertionResults(String assertionResults) { this.assertionResults = assertionResults; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
