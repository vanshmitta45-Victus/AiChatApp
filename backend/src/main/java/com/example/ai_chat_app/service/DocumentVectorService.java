package com.example.ai_chat_app.service;

import com.example.ai_chat_app.dto.DocumentSearchMatch;
import com.example.ai_chat_app.dto.DocumentSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentVectorService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void saveChunk(String documentName, int chunkIndex, String content, List<Double> embedding) {
        String vectorLiteral = toVectorLiteral(embedding);
        String sql = "INSERT INTO document_chunks (document_name, chunk_index, content, embedding) VALUES (?, ?, ?, ?::vector) " +
                "ON CONFLICT (document_name, chunk_index) DO UPDATE SET content = EXCLUDED.content, embedding = EXCLUDED.embedding";
        jdbcTemplate.update(sql, documentName, chunkIndex, content, vectorLiteral);
    }

    public List<DocumentSearchMatch> searchSimilarChunks(List<Double> queryEmbedding, int topK) {
        if (queryEmbedding == null || queryEmbedding.isEmpty()) {
            return Collections.emptyList();
        }

        String vectorLiteral = toVectorLiteral(queryEmbedding);
        String sql = "SELECT document_name, chunk_index, content, (embedding <=> ?::vector) AS distance " +
                     "FROM document_chunks " +
                     "ORDER BY embedding <=> ?::vector ASC " +
                     "LIMIT ?";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> new DocumentSearchMatch(
                    rs.getString("document_name"),
                    rs.getInt("chunk_index"),
                    rs.getString("content"),
                    rs.getDouble("distance")
            ), vectorLiteral, vectorLiteral, topK);
        } catch (Exception e) {
            System.err.println("Error executing similarity search: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<DocumentSearchMatch> getOverviewChunks(int limit) {
        String sql = "SELECT document_name, chunk_index, content, 0.0 AS distance " +
                     "FROM document_chunks " +
                     "ORDER BY chunk_index ASC " +
                     "LIMIT ?";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> new DocumentSearchMatch(
                    rs.getString("document_name"),
                    rs.getInt("chunk_index"),
                    rs.getString("content"),
                    rs.getDouble("distance")
            ), limit);
        } catch (Exception e) {
            System.err.println("Error fetching overview chunks: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<DocumentSummary> listDocuments() {
        String sql = "SELECT document_name, COUNT(*) AS chunk_count, MIN(created_at) AS uploaded_at " +
                     "FROM document_chunks " +
                     "GROUP BY document_name " +
                     "ORDER BY document_name ASC";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("uploaded_at");
                return new DocumentSummary(
                        rs.getString("document_name"),
                        rs.getLong("chunk_count"),
                        ts != null ? ts.toLocalDateTime() : null
                );
            });
        } catch (Exception e) {
            System.err.println("Error querying documents: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public void deleteDocument(String documentName) {
        jdbcTemplate.update("DELETE FROM document_chunks WHERE document_name = ?", documentName);
    }

    public void clearAllDocuments() {
        jdbcTemplate.update("DELETE FROM document_chunks");
    }

    public long getTotalChunkCount() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM document_chunks", Long.class);
        return count != null ? count : 0L;
    }

    private String toVectorLiteral(List<Double> list) {
        if (list == null || list.isEmpty()) {
            return "[0]";
        }
        return "[" + list.stream().map(String::valueOf).collect(Collectors.joining(",")) + "]";
    }
}
