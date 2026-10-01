package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByActorUsernameOrderByTimestampDesc(String actorUsername);

    List<AuditLog> findByTargetEntityOrderByTimestampDesc(String targetEntity);

    List<AuditLog> findAllByOrderByTimestampDesc();
}
