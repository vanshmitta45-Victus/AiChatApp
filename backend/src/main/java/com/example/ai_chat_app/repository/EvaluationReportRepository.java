package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.EvaluationReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationReportRepository extends JpaRepository<EvaluationReport, Long> {

    List<EvaluationReport> findAllByOrderByCreatedAtDesc();

    List<EvaluationReport> findByRunBatchIdOrderByCreatedAtAsc(String runBatchId);

    List<EvaluationReport> findTop50ByOrderByCreatedAtDesc();

    long countByStatus(String status);

    @Query("SELECT AVG(e.latencyMs) FROM EvaluationReport e")
    Double getAverageLatencyMs();

    @Query("SELECT AVG(e.groundingScore) FROM EvaluationReport e")
    Double getAverageGroundingScore();

    @Query("SELECT SUM(e.totalTokens) FROM EvaluationReport e")
    Long getTotalTokensConsumed();
}
