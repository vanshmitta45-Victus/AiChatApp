package com.example.ai_chat_app.controller;

import com.example.ai_chat_app.model.CodeReview;
import com.example.ai_chat_app.service.CodeAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/code")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:4173", "http://127.0.0.1:4173"})
public class CodeReviewController {

    @Autowired
    private CodeAnalysisService codeAnalysisService;

    @PostMapping("/review")
    public ResponseEntity<?> reviewCodeSnippet(
            @RequestBody Map<String, String> request,
            Principal principal) {
        String code = request.get("code");
        String language = request.getOrDefault("language", "java");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Source code cannot be empty."));
        }

        String username = principal != null ? principal.getName() : "vansh";
        Map<String, Object> result = codeAnalysisService.reviewSnippet(code, language, username);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/pr-review")
    public ResponseEntity<?> reviewPullRequest(
            @RequestBody Map<String, String> request,
            Principal principal) {
        String prUrl = request.get("prUrl");
        if (prUrl == null || prUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "GitHub PR URL is required."));
        }

        String username = principal != null ? principal.getName() : "vansh";
        Map<String, Object> result = codeAnalysisService.reviewPullRequest(prUrl, username);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<CodeReview>> getHistory(Principal principal) {
        String username = principal != null ? principal.getName() : "vansh";
        return ResponseEntity.ok(codeAnalysisService.getHistory(username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        CodeReview review = codeAnalysisService.getById(id);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(review);
    }
}
