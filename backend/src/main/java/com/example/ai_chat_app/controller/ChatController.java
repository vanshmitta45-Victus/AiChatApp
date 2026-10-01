package com.example.ai_chat_app.controller;

import com.example.ai_chat_app.dto.ChatMessageRequest;
import com.example.ai_chat_app.dto.ChatMessageResponse;
import com.example.ai_chat_app.dto.ChatRequest;
import com.example.ai_chat_app.dto.ConversationDto;
import com.example.ai_chat_app.model.ChatMessage;
import com.example.ai_chat_app.repository.ChatMessageRepository;
import com.example.ai_chat_app.service.ChatService;
import com.example.ai_chat_app.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired(required = false)
    private GeminiService geminiService;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    // --- Multi-Topology Conversation Endpoints ---

    @GetMapping("/conversations")
    public ResponseEntity<?> getUserConversations(Principal principal) {
        String username = principal != null ? principal.getName() : null;
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        try {
            List<ConversationDto> conversations = chatService.getUserConversations(username);
            return ResponseEntity.ok(conversations);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<?> getConversationById(@PathVariable("id") Long id) {
        try {
            ConversationDto dto = chatService.getConversationById(id);
            return ResponseEntity.ok(dto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(@RequestBody ConversationDto dto, Principal principal) {
        String username = principal != null ? principal.getName() : null;
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        try {
            ConversationDto created = chatService.createConversation(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<?> getConversationMessages(@PathVariable("id") Long id) {
        try {
            List<ChatMessageResponse> messages = chatService.getConversationMessages(id);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping({"/messages", "/conversations/{id}/messages"})
    public ResponseEntity<?> sendMessage(
            @PathVariable(value = "id", required = false) Long pathId,
            @RequestBody ChatMessageRequest request,
            Principal principal) {
        if (pathId != null) {
            request.setConversationId(pathId);
        }
        String username = principal != null ? principal.getName() : null;
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        try {
            ChatMessageResponse response = chatService.processAndSendMessage(request, username);
            return ResponseEntity.ok(response);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- AI Chat & SSE Stream Endpoints ---

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChatGet(
            @RequestParam String prompt,
            @RequestParam(required = false) String model,
            @RequestParam(required = false, defaultValue = "true") Boolean useRag) {
        if (geminiService != null) {
            return geminiService.streamChat(prompt, model, useRag);
        }
        return Flux.just("data: AI service unavailable\n\n");
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChatPost(@RequestBody ChatRequest request) {
        if (geminiService != null) {
            return geminiService.streamChat(request.getPrompt(), request.getModel(), request.getUseRag());
        }
        return Flux.just("data: AI service unavailable\n\n");
    }

    @GetMapping("/history")
    public List<ChatMessage> getHistory() {
        return chatMessageRepository.findAllByOrderByTimestampAsc();
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory() {
        if (geminiService != null) {
            geminiService.clearHistory();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/models")
    public List<String> getModels() {
        if (geminiService != null) {
            return geminiService.getAvailableModels();
        }
        return List.of("llama3.2");
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        if (geminiService != null) {
            return geminiService.checkStatus();
        }
        return Map.of("status", "ONLINE");
    }
}