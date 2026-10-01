package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findAllByOrderByTimestampAsc();
    List<ChatMessage> findTop6ByOrderByTimestampDesc();
    List<ChatMessage> findTop10ByOrderByTimestampDesc();
}