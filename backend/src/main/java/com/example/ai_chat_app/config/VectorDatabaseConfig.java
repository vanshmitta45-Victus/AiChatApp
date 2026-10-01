package com.example.ai_chat_app.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Configuration
public class VectorDatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(VectorDatabaseConfig.class);

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    public void initVectorExtension() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("CREATE EXTENSION IF NOT EXISTS vector;");
            log.info("PostgreSQL pgvector extension verified / initialized successfully.");
            stmt.execute("CREATE TABLE IF NOT EXISTS document_chunks (" +
                    "id BIGSERIAL PRIMARY KEY, " +
                    "document_name VARCHAR(255) NOT NULL, " +
                    "chunk_index INT NOT NULL, " +
                    "content TEXT NOT NULL, " +
                    "embedding VECTOR(768), " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "UNIQUE (document_name, chunk_index));");
            log.info("document_chunks table verified / initialized successfully.");
        } catch (Exception e) {
            log.warn("pgvector extension check failed (might not be installed or already initialized): {}", e.getMessage());
        }
    }
}
