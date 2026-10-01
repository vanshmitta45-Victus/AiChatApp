package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketKeyIgnoreCase(String ticketKey);

    List<Ticket> findAllByOrderByCreatedAtDesc();

    List<Ticket> findAllByProject_ProjectKeyIgnoreCaseOrderByCreatedAtDesc(String projectKey);

    long countByStatusIgnoreCase(String status);

    long countByProject_ProjectKeyIgnoreCaseAndStatusIgnoreCase(String projectKey, String status);

    long countByProject_ProjectKeyIgnoreCase(String projectKey);

    Optional<Ticket> findTopByProject_ProjectKeyIgnoreCaseOrderByIdDesc(String projectKey);

    List<Ticket> findAllByAssignee_EmailIgnoreCaseOrderByCreatedAtDesc(String email);

    @Query("SELECT t FROM Ticket t WHERE LOWER(t.status) != 'closed' AND LOWER(t.priority) IN ('high', 'critical') ORDER BY t.createdAt DESC")
    List<Ticket> findBlockers();
}
