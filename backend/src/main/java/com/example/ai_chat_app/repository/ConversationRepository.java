package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByType(String type);

    @Query("SELECT DISTINCT c FROM Conversation c LEFT JOIN c.participants p WHERE c.createdBy.id = :userId OR p.user.id = :userId ORDER BY c.createdAt DESC")
    List<Conversation> findAllForUser(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE c.type = 'ONE_TO_ONE' AND ((c.createdBy.id = :u1 AND EXISTS (SELECT p FROM ConversationParticipant p WHERE p.conversation = c AND p.user.id = :u2)) OR (c.createdBy.id = :u2 AND EXISTS (SELECT p FROM ConversationParticipant p WHERE p.conversation = c AND p.user.id = :u1)))")
    List<Conversation> findOneToOneBetween(@Param("u1") Long u1, @Param("u2") Long u2);
}
