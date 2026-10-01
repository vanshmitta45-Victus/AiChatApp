package com.example.ai_chat_app.controller;

import com.example.ai_chat_app.dto.ChatMessageRequest;
import com.example.ai_chat_app.dto.ChatMessageResponse;
import com.example.ai_chat_app.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Handles real-time messaging across topologies: ONE_TO_ONE, MANY_TO_MANY, ONE_TO_MANY, MANY_TO_ONE.
     * Enforces broadcast publish restrictions:
     * In ONE_TO_MANY, only ADMIN, MANAGER, and TEAM_LEADER can publish; STAFF can only subscribe.
     * Parses @username mentions, persists them, and routes notifications to /user/{username}/queue/mentions.
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request, Principal principal) {
        String senderUsername = principal != null ? principal.getName() : null;

        try {
            chatService.processAndSendMessage(request, senderUsername);
        } catch (AccessDeniedException e) {
            if (senderUsername != null) {
                messagingTemplate.convertAndSendToUser(
                        senderUsername,
                        "/queue/errors",
                        Map.of(
                                "error", "Forbidden",
                                "message", e.getMessage(),
                                "conversation_id", request.getConversationId() != null ? request.getConversationId() : 0
                        )
                );
            }
        } catch (Exception e) {
            if (senderUsername != null) {
                messagingTemplate.convertAndSendToUser(
                        senderUsername,
                        "/queue/errors",
                        Map.of(
                                "error", "MessageProcessingError",
                                "message", e.getMessage(),
                                "conversation_id", request.getConversationId() != null ? request.getConversationId() : 0
                        )
                );
            }
        }
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public Map<String, String> handleException(Throwable exception) {
        return Map.of("error", "WebSocketError", "message", exception.getMessage());
    }
}
