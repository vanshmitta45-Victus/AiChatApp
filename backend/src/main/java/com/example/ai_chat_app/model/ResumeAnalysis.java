package com.example.ai_chat_app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume_analyses")
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password"})
    private User user;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "target_role", length = 100)
    private String targetRole;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "ats_score", nullable = false)
    private Integer atsScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "critique_json", nullable = false, columnDefinition = "jsonb")
    private String critiqueJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "improved_resume_json", nullable = false, columnDefinition = "jsonb")
    private String improvedResumeJson;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public ResumeAnalysis() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }

    public String getCritiqueJson() { return critiqueJson; }
    public void setCritiqueJson(String critiqueJson) { this.critiqueJson = critiqueJson; }

    public String getImprovedResumeJson() { return improvedResumeJson; }
    public void setImprovedResumeJson(String improvedResumeJson) { this.improvedResumeJson = improvedResumeJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
