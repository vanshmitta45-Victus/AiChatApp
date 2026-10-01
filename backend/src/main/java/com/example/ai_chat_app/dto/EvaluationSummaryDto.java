package com.example.ai_chat_app.dto;

import java.util.Map;

public class EvaluationSummaryDto {
    private long totalRuns;
    private long passedRuns;
    private long failedRuns;
    private double passRate;
    private double averageLatencyMs;
    private double averageGroundingScore;
    private double averageRelevancyScore;
    private long totalTokensConsumed;
    private String latestBatchId;
    private Map<String, Long> runsBySuite;

    public EvaluationSummaryDto() {}

    public long getTotalRuns() { return totalRuns; }
    public void setTotalRuns(long totalRuns) { this.totalRuns = totalRuns; }

    public long getPassedRuns() { return passedRuns; }
    public void setPassedRuns(long passedRuns) { this.passedRuns = passedRuns; }

    public long getFailedRuns() { return failedRuns; }
    public void setFailedRuns(long failedRuns) { this.failedRuns = failedRuns; }

    public double getPassRate() { return passRate; }
    public void setPassRate(double passRate) { this.passRate = passRate; }

    public double getAverageLatencyMs() { return averageLatencyMs; }
    public void setAverageLatencyMs(double averageLatencyMs) { this.averageLatencyMs = averageLatencyMs; }

    public double getAverageGroundingScore() { return averageGroundingScore; }
    public void setAverageGroundingScore(double averageGroundingScore) { this.averageGroundingScore = averageGroundingScore; }

    public double getAverageRelevancyScore() { return averageRelevancyScore; }
    public void setAverageRelevancyScore(double averageRelevancyScore) { this.averageRelevancyScore = averageRelevancyScore; }

    public long getTotalTokensConsumed() { return totalTokensConsumed; }
    public void setTotalTokensConsumed(long totalTokensConsumed) { this.totalTokensConsumed = totalTokensConsumed; }

    public String getLatestBatchId() { return latestBatchId; }
    public void setLatestBatchId(String latestBatchId) { this.latestBatchId = latestBatchId; }

    public Map<String, Long> getRunsBySuite() { return runsBySuite; }
    public void setRunsBySuite(Map<String, Long> runsBySuite) { this.runsBySuite = runsBySuite; }
}
