package com.example.ai_chat_app.service;

import com.example.ai_chat_app.model.Project;
import com.example.ai_chat_app.model.Ticket;
import com.example.ai_chat_app.model.User;
import com.example.ai_chat_app.repository.ProjectRepository;
import com.example.ai_chat_app.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProjectManagementService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TicketService ticketService;

    public Map<String, Object> getProjectSummary(String projectKey) {
        String effectiveKey = (projectKey != null && !projectKey.isBlank()) ? projectKey.trim().toUpperCase() : null;

        List<Ticket> tickets = (effectiveKey != null)
                ? ticketRepository.findAllByProject_ProjectKeyIgnoreCaseOrderByCreatedAtDesc(effectiveKey)
                : ticketRepository.findAllByOrderByCreatedAtDesc();

        long openCount = tickets.stream().filter(t -> "OPEN".equalsIgnoreCase(t.getStatus())).count();
        long inProgressCount = tickets.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count();
        long resolvedCount = tickets.stream().filter(t -> "RESOLVED".equalsIgnoreCase(t.getStatus())).count();
        long closedCount = tickets.stream().filter(t -> "CLOSED".equalsIgnoreCase(t.getStatus())).count();

        long unassignedCount = tickets.stream().filter(t -> t.getAssignee() == null && !"CLOSED".equalsIgnoreCase(t.getStatus())).count();

        List<Map<String, String>> blockers = tickets.stream()
                .filter(t -> !"CLOSED".equalsIgnoreCase(t.getStatus()) && !"RESOLVED".equalsIgnoreCase(t.getStatus()))
                .filter(t -> "CRITICAL".equalsIgnoreCase(t.getPriority()) || "HIGH".equalsIgnoreCase(t.getPriority()))
                .map(t -> Map.of(
                        "ticketKey", t.getTicketKey(),
                        "title", t.getTitle(),
                        "priority", t.getPriority(),
                        "status", t.getStatus(),
                        "assignee", t.getAssignee() != null ? t.getAssignee().getFullName() : "Unassigned"
                ))
                .toList();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("projectKey", effectiveKey != null ? effectiveKey : "ALL");
        summary.put("totalTickets", tickets.size());
        summary.put("openTickets", openCount);
        summary.put("inProgressTickets", inProgressCount);
        summary.put("resolvedTickets", resolvedCount);
        summary.put("closedTickets", closedCount);
        summary.put("unassignedTickets", unassignedCount);
        summary.put("highPriorityBlockers", blockers);

        return summary;
    }

    public Ticket rescheduleOrReprioritize(String ticketKey, String newPriority, User currentUser) {
        return ticketService.updatePriority(ticketKey, newPriority, currentUser);
    }
}
