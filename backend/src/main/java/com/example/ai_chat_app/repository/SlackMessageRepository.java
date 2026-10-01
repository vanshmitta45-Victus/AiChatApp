package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.SlackMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SlackMessageRepository extends JpaRepository<SlackMessage, Long> {
    List<SlackMessage> findTop50ByChannelIdOrderByCreatedAtAsc(Long channelId);
    List<SlackMessage> findTop10ByChannelIdOrderByCreatedAtDesc(Long channelId);
}
