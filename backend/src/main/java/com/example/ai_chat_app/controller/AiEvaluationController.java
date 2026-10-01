package com.example.ai_chat_app.controller;

import com.example.ai_chat_app.dto.EvaluationBatchResultDto;
import com.example.ai_chat_app.dto.EvaluationRunRequest;
import com.example.ai_chat_app.dto.EvaluationSummaryDto;
import com.example.ai_chat_app.model.EvaluationReport;
import com.example.ai_chat_app.service.AiEvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluation")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:4173", "http://127.0.0.1:4173"})
public class AiEvaluationController {

    @Autowired
    private AiEvaluationService aiEvaluationService;

    @PostMapping("/run")
    public ResponseEntity<EvaluationBatchResultDto> runBenchmarkSuite(@RequestBody(required = false) EvaluationRunRequest request) {
        if (request == null) {
            request = new EvaluationRunRequest("ALL", "llama3.2");
        }
        EvaluationBatchResultDto result = aiEvaluationService.executeBenchmarkSuite(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/summary")
    public ResponseEntity<EvaluationSummaryDto> getSummary() {
        return ResponseEntity.ok(aiEvaluationService.getEvaluationSummary());
    }

    @GetMapping("/reports")
    public ResponseEntity<List<EvaluationReport>> getRecentReports(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(aiEvaluationService.getRecentReports(limit));
    }

    @GetMapping("/reports/{batchId}")
    public ResponseEntity<List<EvaluationReport>> getReportsByBatch(@PathVariable String batchId) {
        return ResponseEntity.ok(aiEvaluationService.getReportsByBatch(batchId));
    }

    @DeleteMapping("/reports")
    public ResponseEntity<?> clearReports() {
        aiEvaluationService.clearAllReports();
        return ResponseEntity.ok(Map.of("message", "Evaluation reports cleared successfully"));
    }
}
