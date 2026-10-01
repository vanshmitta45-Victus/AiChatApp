package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.MessageMention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageMentionRepository extends JpaRepository<MessageMention, Long> {

    List<MessageMention> findByMentionedUserIdAndIsReadFalse(Long userId);

    List<MessageMention> findByMentionedUserIdOrderByCreatedAtDesc(Long userId);

    Long countByMentionedUserIdAndIsReadFalse(Long userId);
}
