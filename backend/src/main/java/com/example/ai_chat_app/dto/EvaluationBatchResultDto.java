package com.example.ai_chat_app.dto;

import com.example.ai_chat_app.model.EvaluationReport;
import java.util.List;

public class EvaluationBatchResultDto {
    private String batchId;
    private String suite;
    private int totalCases;
    private int passedCases;
    private int failedCases;
    private double passRate;
    private double averageLatencyMs;
    private double averageGroundingScore;
    private long totalTokens;
    private List<EvaluationReport> reports;

    public EvaluationBatchResultDto() {}

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getSuite() { return suite; }
    public void setSuite(String suite) { this.suite = suite; }

    public int getTotalCases() { return totalCases; }
    public void setTotalCases(int totalCases) { this.totalCases = totalCases; }

    public int getPassedCases() { return passedCases; }
    public void setPassedCases(int passedCases) { this.passedCases = passedCases; }

    public int getFailedCases() { return failedCases; }
    public void setFailedCases(int failedCases) { this.failedCases = failedCases; }

    public double getPassRate() { return passRate; }
    public void setPassRate(double passRate) { this.passRate = passRate; }

    public double getAverageLatencyMs() { return averageLatencyMs; }
    public void setAverageLatencyMs(double averageLatencyMs) { this.averageLatencyMs = averageLatencyMs; }

    public double getAverageGroundingScore() { return averageGroundingScore; }
    public void setAverageGroundingScore(double averageGroundingScore) { this.averageGroundingScore = averageGroundingScore; }

    public long getTotalTokens() { return totalTokens; }
    public void setTotalTokens(long totalTokens) { this.totalTokens = totalTokens; }

    public List<EvaluationReport> getReports() { return reports; }
    public void setReports(List<EvaluationReport> reports) { this.reports = reports; }
}
