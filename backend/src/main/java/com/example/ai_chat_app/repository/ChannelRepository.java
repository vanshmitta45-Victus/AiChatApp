package com.example.ai_chat_app.repository;

import com.example.ai_chat_app.model.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, Long> {
    List<Channel> findAllByOrderByIdAsc();
    Optional<Channel> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
