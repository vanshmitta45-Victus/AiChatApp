package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.DocumentUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentUploadRepository extends JpaRepository<DocumentUpload, Long> {

    List<DocumentUpload> findByUploaderIdOrderByUploadedAtDesc(Long uploaderId);
}
