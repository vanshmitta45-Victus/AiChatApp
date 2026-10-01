package com.example.ai_chat_app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "code_reviews")
public class CodeReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    @JsonIgnoreProperties({"password"})
    private User author;

    @Column(name = "repo_url", columnDefinition = "TEXT")
    private String repoUrl;

    @Column(name = "pr_number")
    private Integer prNumber;

    @Column(name = "pr_title", length = 255)
    private String prTitle;

    @Column(length = 50)
    private String language;

    @Column(name = "input_code", columnDefinition = "TEXT")
    private String inputCode;

    @Column(name = "analysis_summary", nullable = false, columnDefinition = "TEXT")
    private String analysisSummary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "detected_errors", columnDefinition = "jsonb")
    private String detectedErrors;

    @Column(name = "improved_code", nullable = false, columnDefinition = "TEXT")
    private String improvedCode;

    @Column(length = 30)
    private String status = "COMPLETED";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public CodeReview() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "COMPLETED";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public String getRepoUrl() { return repoUrl; }
    public void setRepoUrl(String repoUrl) { this.repoUrl = repoUrl; }

    public Integer getPrNumber() { return prNumber; }
    public void setPrNumber(Integer prNumber) { this.prNumber = prNumber; }

    public String getPrTitle() { return prTitle; }
    public void setPrTitle(String prTitle) { this.prTitle = prTitle; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getInputCode() { return inputCode; }
    public void setInputCode(String inputCode) { this.inputCode = inputCode; }

    public String getAnalysisSummary() { return analysisSummary; }
    public void setAnalysisSummary(String analysisSummary) { this.analysisSummary = analysisSummary; }

    public String getDetectedErrors() { return detectedErrors; }
    public void setDetectedErrors(String detectedErrors) { this.detectedErrors = detectedErrors; }

    public String getImprovedCode() { return improvedCode; }
    public void setImprovedCode(String improvedCode) { this.improvedCode = improvedCode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
