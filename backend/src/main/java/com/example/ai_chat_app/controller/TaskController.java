package com.example.ai_chat_app.controller;

import com.example.ai_chat_app.dto.TaskDto;
import com.example.ai_chat_app.model.Project;
import com.example.ai_chat_app.model.Task;
import com.example.ai_chat_app.model.User;
import com.example.ai_chat_app.repository.ProjectRepository;
import com.example.ai_chat_app.repository.TaskRepository;
import com.example.ai_chat_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:4173", "http://127.0.0.1:4173"})
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @GetMapping
    public ResponseEntity<List<TaskDto>> getTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String projectKey,
            @RequestParam(required = false) String priority
    ) {
        List<Task> tasks = taskRepository.findAll();

        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            tasks = tasks.stream()
                    .filter(t -> status.equalsIgnoreCase(t.getStatus()))
                    .collect(Collectors.toList());
        }
        if (projectKey != null && !projectKey.isBlank()) {
            tasks = tasks.stream()
                    .filter(t -> t.getProject() != null && projectKey.equalsIgnoreCase(t.getProject().getKey()))
                    .collect(Collectors.toList());
        }
        if (priority != null && !priority.isBlank() && !"ALL".equalsIgnoreCase(priority)) {
            tasks = tasks.stream()
                    .filter(t -> priority.equalsIgnoreCase(t.getPriority()))
                    .collect(Collectors.toList());
        }

        List<TaskDto> dtos = tasks.stream().map(TaskDto::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable Long id) {
        return taskRepository.findById(id)
                .map(t -> ResponseEntity.ok(new TaskDto(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody TaskDto dto, Principal principal) {
        try {
            String projectKey = dto.getProjectKey() != null ? dto.getProjectKey() : "INFRA";
            Project project = projectRepository.findByKey(projectKey).orElseGet(() -> {
                return projectRepository.findAll().stream().findFirst().orElseGet(() -> {
                    Project defaultProj = new Project(projectKey, "Core Workspace", "Default project", null);
                    return projectRepository.save(defaultProj);
                });
            });

            String username = principal != null ? principal.getName() : "vansh";
            User reporter = userRepository.findByUsernameOrEmailIgnoreCase(username)
                    .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));

            User assignee = null;
            if (dto.getAssignee() != null && !dto.getAssignee().isBlank()) {
                assignee = userRepository.findByUsernameOrEmailIgnoreCase(dto.getAssignee())
                        .orElse(null);
            }
            if (assignee == null) {
                assignee = reporter;
            }

            long nextIndex = taskRepository.count() + 101;
            String key = dto.getKey() != null && !dto.getKey().isBlank() 
                    ? dto.getKey() 
                    : "NEX-" + nextIndex;

            Task task = new Task();
            task.setTaskKey(key);
            task.setProject(project);
            task.setTitle(dto.getTitle() != null ? dto.getTitle() : "Untitled Task");
            task.setDescription(dto.getDescription() != null ? dto.getDescription() : "");
            task.setStatus(normalizeStatus(dto.getStatus()));
            task.setPriority(dto.getPriority() != null ? dto.getPriority().toUpperCase() : "MEDIUM");
            task.setStoryPoints(dto.getStoryPoints() != null ? dto.getStoryPoints() : 3);
            task.setDueDate(dto.getDueDate() != null ? dto.getDueDate() : LocalDate.now().plusDays(7));
            task.setReporter(reporter);
            task.setAssignee(assignee);
            task.setCreatedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());

            Task saved = taskRepository.save(task);

            String prio = saved.getPriority() != null ? saved.getPriority().toUpperCase() : "MEDIUM";
            String titleLower = saved.getTitle() != null ? saved.getTitle().toLowerCase() : "";
            boolean isHighBug = "HIGH".equals(prio) || "CRITICAL".equals(prio) || "URGENT".equals(prio)
                    || titleLower.contains("bug") || titleLower.contains("fix") || titleLower.contains("error");
            if (isHighBug) {
                eventPublisher.publishEvent(new com.example.ai_chat_app.event.HighPriorityBugCreatedEvent(saved, "KANBAN_CREATION"));
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(new TaskDto(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create task: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody TaskDto dto) {
        return taskRepository.findById(id).map(task -> {
            if (dto.getTitle() != null) task.setTitle(dto.getTitle());
            if (dto.getDescription() != null) task.setDescription(dto.getDescription());
            if (dto.getStatus() != null) task.setStatus(normalizeStatus(dto.getStatus()));
            if (dto.getPriority() != null) task.setPriority(dto.getPriority().toUpperCase());
            if (dto.getStoryPoints() != null) task.setStoryPoints(dto.getStoryPoints());
            if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
            if (dto.getAssignee() != null) {
                userRepository.findByUsernameOrEmailIgnoreCase(dto.getAssignee()).ifPresent(task::setAssignee);
            }
            task.setUpdatedAt(LocalDateTime.now());
            Task saved = taskRepository.save(task);
            return ResponseEntity.ok(new TaskDto(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }
        return taskRepository.findById(id).map(task -> {
            task.setStatus(normalizeStatus(status));
            task.setUpdatedAt(LocalDateTime.now());
            Task saved = taskRepository.save(task);
            return ResponseEntity.ok(new TaskDto(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        if (!taskRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        taskRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully", "id", id));
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) return "TODO";
        String s = status.trim().toUpperCase();
        if ("IN_REVIEW".equals(s)) return "REVIEW";
        return switch (s) {
            case "BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "BLOCKED", "DONE" -> s;
            default -> "TODO";
        };
    }
}
