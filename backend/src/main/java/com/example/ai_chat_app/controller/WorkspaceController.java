package com.example.ai_chat_app.controller;

import com.example.ai_chat_app.dto.AgentChatRequest;
import com.example.ai_chat_app.dto.AgentChatResponse;
import com.example.ai_chat_app.dto.UserDto;
import com.example.ai_chat_app.model.*;
import com.example.ai_chat_app.repository.ChannelRepository;
import com.example.ai_chat_app.repository.ProjectRepository;
import com.example.ai_chat_app.repository.SlackMessageRepository;
import com.example.ai_chat_app.repository.UserRepository;
import com.example.ai_chat_app.service.AgentExecutionService;
import com.example.ai_chat_app.service.AuthService;
import com.example.ai_chat_app.service.ProjectManagementService;
import com.example.ai_chat_app.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspace")
public class WorkspaceController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private ProjectManagementService projectManagementService;

    @Autowired
    private SlackMessageRepository slackMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgentExecutionService agentExecutionService;

    @Autowired
    private AuthService authService;

    @GetMapping("/projects")
    public ResponseEntity<List<Project>> getProjects() {
        return ResponseEntity.ok(projectRepository.findAll());
    }

    @GetMapping("/channels")
    public ResponseEntity<List<Channel>> getChannels() {
        return ResponseEntity.ok(channelRepository.findAllByOrderByIdAsc());
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<Ticket>> getTickets(
            @RequestParam(required = false) String projectKey,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(ticketService.listTickets(projectKey, status));
    }

    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(@RequestBody Map<String, String> body) {
        try {
            User currentUser = authService.getCurrentAuthenticatedUser();
            String title = body.get("title");
            String description = body.get("description");
            String category = body.get("category");
            String priority = body.get("priority");
            String projectKey = body.get("projectKey");

            Ticket ticket = ticketService.createTicket(title, description, category, priority, projectKey, currentUser);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/tickets/{ticketKey}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String ticketKey, @RequestBody Map<String, String> body) {
        try {
            User currentUser = authService.getCurrentAuthenticatedUser();
            String newStatus = body.get("status");
            Ticket ticket = ticketService.updateStatus(ticketKey, newStatus, currentUser);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/tickets/{ticketKey}/assign")
    public ResponseEntity<?> assignTicket(@PathVariable String ticketKey, @RequestBody Map<String, String> body) {
        try {
            User currentUser = authService.getCurrentAuthenticatedUser();
            String assignee = body.get("assignee");
            Ticket ticket = ticketService.assignTicket(ticketKey, assignee, currentUser);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/channels/{channelId}/messages")
    public ResponseEntity<List<SlackMessage>> getChannelMessages(@PathVariable Long channelId) {
        return ResponseEntity.ok(slackMessageRepository.findTop50ByChannelIdOrderByCreatedAtAsc(channelId));
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chatWithAgent(@RequestBody AgentChatRequest request) {
        try {
            User currentUser = authService.getCurrentAuthenticatedUser();
            AgentChatResponse response = agentExecutionService.processAgentChat(request, currentUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Agent loop execution failed: " + e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(UserDto::new)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestParam(required = false) String projectKey) {
        return ResponseEntity.ok(projectManagementService.getProjectSummary(projectKey));
    }
}
