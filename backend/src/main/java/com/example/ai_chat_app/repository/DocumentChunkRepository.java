package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    List<DocumentChunk> findByDocument_IdOrderByChunkIndexAsc(Long documentId);
}
