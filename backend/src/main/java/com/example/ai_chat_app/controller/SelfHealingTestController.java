package com.example.ai_chat_app.controller;

import com.example.ai_chat_app.dto.SelfHealingTestRequest;
import com.example.ai_chat_app.dto.SelfHealingTestResponse;
import com.example.ai_chat_app.service.SelfHealingTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qa/self-heal")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:4173", "http://127.0.0.1:4173"})
public class SelfHealingTestController {

    @Autowired
    private SelfHealingTestService selfHealingTestService;

    @PostMapping
    public ResponseEntity<SelfHealingTestResponse> healTest(@RequestBody SelfHealingTestRequest request) {
        SelfHealingTestResponse response = selfHealingTestService.healBrokenTest(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/samples")
    public ResponseEntity<List<Map<String, Object>>> getSamples() {
        return ResponseEntity.ok(selfHealingTestService.getPrebuiltSamples());
    }
}
