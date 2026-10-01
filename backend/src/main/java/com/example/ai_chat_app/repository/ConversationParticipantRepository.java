package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.ConversationParticipant;
import com.example.ai_chat_app.model.ConversationParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, ConversationParticipantId> {

    @Query("SELECT cp FROM ConversationParticipant cp WHERE cp.conversation.id = :conversationId AND cp.user.id = :userId")
    Optional<ConversationParticipant> findByConversationIdAndUserId(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    @Query("SELECT cp FROM ConversationParticipant cp WHERE cp.conversation.id = :conversationId")
    List<ConversationParticipant> findByConversationId(@Param("conversationId") Long conversationId);

    @Query("SELECT cp FROM ConversationParticipant cp WHERE cp.user.id = :userId")
    List<ConversationParticipant> findByUserId(@Param("userId") Long userId);
}
