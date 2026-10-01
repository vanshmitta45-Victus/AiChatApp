package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByUserIdOrderByIsPinnedDescCreatedAtDesc(Long userId);

    List<Note> findByUserIdAndIsArchivedOrderByIsPinnedDescCreatedAtDesc(Long userId, Boolean isArchived);

    Optional<Note> findByIdAndUserId(Long id, Long userId);
}
