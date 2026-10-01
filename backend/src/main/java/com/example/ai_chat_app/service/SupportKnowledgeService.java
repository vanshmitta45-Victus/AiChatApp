package com.example.ai_chat_app.service;

import com.example.ai_chat_app.dto.DocumentSearchMatch;
import com.example.ai_chat_app.model.Ticket;
import com.example.ai_chat_app.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SupportKnowledgeService {

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private DocumentVectorService documentVectorService;

    @Autowired
    private TicketService ticketService;

    public Map<String, Object> searchKnowledgeBase(String query) {
        if (query == null || query.isBlank()) {
            return Map.of("matches", List.of(), "message", "Query was empty");
        }

        try {
            List<Double> queryEmbedding = embeddingService.generateEmbedding(query);
            List<DocumentSearchMatch> matches = documentVectorService.searchSimilarChunks(queryEmbedding, 3);

            if (matches.isEmpty()) {
                // Check if any overview chunks exist
                List<DocumentSearchMatch> overview = documentVectorService.getOverviewChunks(2);
                if (!overview.isEmpty()) {
                    matches = overview;
                }
            }

            List<Map<String, Object>> results = matches.stream().map(m -> {
                Map<String, Object> map = new HashMap<>();
                map.put("documentName", m.getDocumentName());
                map.put("chunkIndex", m.getChunkIndex());
                map.put("content", m.getContent());
                map.put("similarity", Math.round((1.0 - m.getDistance()) * 100.0) / 100.0);
                return map;
            }).toList();

            return Map.of(
                    "matches", results,
                    "totalFound", results.size(),
                    "query", query
            );
        } catch (Exception e) {
            return Map.of(
                    "matches", List.of(),
                    "message", "Document search unavailable: " + e.getMessage()
            );
        }
    }

    public Ticket escalateToHuman(String issueOrTicketKey, String reason, User currentUser) {
        // If it refers to an existing ticket, update it to CRITICAL
        try {
            Ticket existing = ticketService.getTicketDetails(issueOrTicketKey);
            ticketService.updatePriority(existing.getTicketKey(), "CRITICAL", currentUser);
            return existing;
        } catch (Exception ignored) {}

        // Otherwise create an escalation ticket
        String title = "Escalated: " + issueOrTicketKey;
        String desc = (reason != null && !reason.isBlank()) ? reason : "Issue was escalated to a human engineer.";
        return ticketService.createTicket(title, desc, "BUG", "CRITICAL", "INFRA", currentUser);
    }
}
