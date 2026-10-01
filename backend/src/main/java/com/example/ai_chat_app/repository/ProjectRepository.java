package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByKey(String key);
    Optional<Project> findByKeyIgnoreCase(String key);
    Optional<Project> findByProjectKeyIgnoreCase(String projectKey);
    boolean existsByProjectKeyIgnoreCase(String projectKey);
}
