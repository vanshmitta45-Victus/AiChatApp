package com.example.ai_chat_app.controller;

import com.example.ai_chat_app.dto.SwarmExecutionDto;
import com.example.ai_chat_app.model.SwarmExecution;
import com.example.ai_chat_app.model.Task;
import com.example.ai_chat_app.repository.SwarmExecutionRepository;
import com.example.ai_chat_app.repository.TaskRepository;
import com.example.ai_chat_app.service.BugTriageSwarmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/swarm")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:4173", "http://127.0.0.1:4173"})
public class SwarmController {

    @Autowired
    private SwarmExecutionRepository swarmExecutionRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private BugTriageSwarmService bugTriageSwarmService;

    @GetMapping("/executions")
    public ResponseEntity<List<SwarmExecutionDto>> listExecutions() {
        List<SwarmExecutionDto> dtos = swarmExecutionRepository.findTop30ByOrderByCreatedAtDesc()
                .stream()
                .map(SwarmExecutionDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/executions/{taskKey}")
    public ResponseEntity<?> getExecutionByTaskKey(@PathVariable String taskKey) {
        return swarmExecutionRepository.findFirstByTaskKeyOrderByCreatedAtDesc(taskKey)
                .map(e -> ResponseEntity.ok(new SwarmExecutionDto(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/trigger/{taskId}")
    public ResponseEntity<?> triggerSwarmForTask(@PathVariable Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return ResponseEntity.notFound().build();
        }
        SwarmExecution execution = bugTriageSwarmService.executeSwarmTriage(task, true);
        return ResponseEntity.ok(new SwarmExecutionDto(execution));
    }
}
