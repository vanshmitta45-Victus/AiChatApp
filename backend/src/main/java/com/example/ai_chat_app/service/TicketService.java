package com.example.ai_chat_app.service;

import com.example.ai_chat_app.model.Project;
import com.example.ai_chat_app.model.Ticket;
import com.example.ai_chat_app.model.User;
import com.example.ai_chat_app.repository.ProjectRepository;
import com.example.ai_chat_app.repository.TicketRepository;
import com.example.ai_chat_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Ticket createTicket(String title, String description, String category, String priority, String projectKey, User reporter) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Ticket title cannot be empty");
        }

        String effectiveKey = (projectKey != null && !projectKey.isBlank()) ? projectKey.trim().toUpperCase() : "INFRA";
        Project project = projectRepository.findByProjectKeyIgnoreCase(effectiveKey)
                .orElseGet(() -> projectRepository.findAll().stream().findFirst()
                        .orElseGet(() -> projectRepository.save(new Project("INFRA", "Infrastructure Operations", "Default IT Project"))));

        // Generate next ticket key, e.g. INFRA-101, INFRA-102
        long count = ticketRepository.countByProject_ProjectKeyIgnoreCase(project.getProjectKey());
        String ticketKey = project.getProjectKey() + "-" + (101 + count);

        // Ensure uniqueness
        while (ticketRepository.findByTicketKeyIgnoreCase(ticketKey).isPresent()) {
            count++;
            ticketKey = project.getProjectKey() + "-" + (101 + count);
        }

        String validPriority = normalizePriority(priority);
        String validCategory = normalizeCategory(category);

        Ticket ticket = new Ticket(
                ticketKey,
                title.trim(),
                (description != null && !description.isBlank()) ? description.trim() : title.trim(),
                "OPEN",
                validPriority,
                validCategory,
                project,
                reporter
        );

        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket updateStatus(String ticketKey, String newStatus, User currentUser) {
        Ticket ticket = ticketRepository.findByTicketKeyIgnoreCase(ticketKey.trim())
                .orElseThrow(() -> new NoSuchElementException("Ticket not found: " + ticketKey));

        String validStatus = normalizeStatus(newStatus);
        ticket.setStatus(validStatus);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket assignTicket(String ticketKey, String assigneeIdentifier, User currentUser) {
        Ticket ticket = ticketRepository.findByTicketKeyIgnoreCase(ticketKey.trim())
                .orElseThrow(() -> new NoSuchElementException("Ticket not found: " + ticketKey));

        if (assigneeIdentifier == null || assigneeIdentifier.isBlank()) {
            ticket.setAssignee(null);
            return ticketRepository.save(ticket);
        }

        String cleanIdentifier = assigneeIdentifier.trim().toLowerCase();
        User assignee = userRepository.findByEmail(cleanIdentifier)
                .or(() -> userRepository.findByFullNameIgnoreCase(cleanIdentifier))
                .or(() -> userRepository.findAll().stream()
                        .filter(u -> u.getFullName().toLowerCase().contains(cleanIdentifier) || u.getEmail().toLowerCase().contains(cleanIdentifier))
                        .findFirst())
                .orElseThrow(() -> new NoSuchElementException("Assignee user not found: " + assigneeIdentifier));

        ticket.setAssignee(assignee);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket updatePriority(String ticketKey, String newPriority, User currentUser) {
        Ticket ticket = ticketRepository.findByTicketKeyIgnoreCase(ticketKey.trim())
                .orElseThrow(() -> new NoSuchElementException("Ticket not found: " + ticketKey));

        ticket.setPriority(normalizePriority(newPriority));
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public Ticket getTicketDetails(String ticketKey) {
        return ticketRepository.findByTicketKeyIgnoreCase(ticketKey.trim())
                .orElseThrow(() -> new NoSuchElementException("Ticket not found: " + ticketKey));
    }

    public List<Ticket> listTickets(String projectKey, String status) {
        List<Ticket> list;
        if (projectKey != null && !projectKey.isBlank()) {
            list = ticketRepository.findAllByProject_ProjectKeyIgnoreCaseOrderByCreatedAtDesc(projectKey.trim());
        } else {
            list = ticketRepository.findAllByOrderByCreatedAtDesc();
        }

        if (status != null && !status.isBlank()) {
            String filterStatus = status.trim().toUpperCase();
            return list.stream()
                    .filter(t -> t.getStatus().equalsIgnoreCase(filterStatus))
                    .toList();
        }

        return list;
    }

    private String normalizePriority(String priority) {
        if (priority == null) return "MEDIUM";
        String p = priority.trim().toUpperCase();
        return switch (p) {
            case "LOW", "MEDIUM", "HIGH", "CRITICAL" -> p;
            case "URGENT", "BLOCKER" -> "CRITICAL";
            default -> "MEDIUM";
        };
    }

    private String normalizeCategory(String category) {
        if (category == null) return "TASK";
        String c = category.trim().toUpperCase();
        return switch (c) {
            case "IT_HARDWARE", "HARDWARE" -> "IT_HARDWARE";
            case "ACCESS", "PERMISSION", "LOGIN" -> "ACCESS";
            case "BUG", "DEFECT", "ERROR", "INCIDENT" -> "BUG";
            default -> "TASK";
        };
    }

    private String normalizeStatus(String status) {
        if (status == null) return "OPEN";
        String s = status.trim().toUpperCase();
        return switch (s) {
            case "OPEN", "TODO" -> "OPEN";
            case "IN_PROGRESS", "INPROGRESS", "PROGRESS", "WORKING" -> "IN_PROGRESS";
            case "RESOLVED", "DONE", "COMPLETED", "FIXED" -> "RESOLVED";
            case "CLOSED" -> "CLOSED";
            default -> "OPEN";
        };
    }
}
