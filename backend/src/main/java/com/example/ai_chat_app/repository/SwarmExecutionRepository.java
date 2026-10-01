package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.SwarmExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SwarmExecutionRepository extends JpaRepository<SwarmExecution, Long> {

    List<SwarmExecution> findAllByOrderByCreatedAtDesc();

    List<SwarmExecution> findTop30ByOrderByCreatedAtDesc();

    Optional<SwarmExecution> findFirstByTaskKeyOrderByCreatedAtDesc(String taskKey);

    List<SwarmExecution> findByTaskKeyOrderByCreatedAtDesc(String taskKey);
}
