package com.example.ai_chat_app.controller;

import com.example.ai_chat_app.model.ResumeAnalysis;
import com.example.ai_chat_app.model.User;
import com.example.ai_chat_app.repository.ResumeAnalysisRepository;
import com.example.ai_chat_app.repository.UserRepository;
import com.example.ai_chat_app.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:4173", "http://127.0.0.1:4173"})
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private ResumeAnalysisRepository resumeAnalysisRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> analyzeResumeMultipart(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "targetRole", required = false, defaultValue = "Senior Full Stack Engineer") String targetRole,
            Principal principal) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Uploaded resume file is empty."));
            }

            String text = resumeService.extractTextFromUpload(file);
            String username = principal != null ? principal.getName() : "vansh";
            Map<String, Object> result = resumeService.analyzeResume(text, file.getOriginalFilename(), targetRole, username);
            result.put("extractedText", text);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Resume analysis error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to analyze resume: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/analyze", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> analyzeResumeJson(
            @RequestBody Map<String, String> payload,
            Principal principal) {
        try {
            String text = payload.get("text");
            String fileName = payload.getOrDefault("fileName", "resume.txt");
            String targetRole = payload.getOrDefault("targetRole", "Senior Full Stack Engineer");
            if (text == null || text.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Resume text cannot be blank."));
            }

            String username = principal != null ? principal.getName() : "vansh";
            Map<String, Object> result = resumeService.analyzeResume(text, fileName, targetRole, username);
            result.put("extractedText", text);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Resume JSON analysis error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to analyze resume: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/download-pdf")
    public ResponseEntity<byte[]> downloadModernAtsPdf(@PathVariable Long id) {
        try {
            byte[] pdfBytes = resumeService.generateOpenPdfCv(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"modern_ats_resume_" + id + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            System.err.println("Failed to generate PDF: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResumeAnalysis(@PathVariable Long id) {
        return resumeAnalysisRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<ResumeAnalysis>> listUserResumes(Principal principal) {
        String username = principal != null ? principal.getName() : "vansh";
        User user = userRepository.findByUsernameOrEmailIgnoreCase(username).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(resumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }
}
