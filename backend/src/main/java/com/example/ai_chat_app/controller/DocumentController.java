package com.example.ai_chat_app.controller;

import com.example.ai_chat_app.dto.DocumentSummary;
import com.example.ai_chat_app.service.DocumentParserService;
import com.example.ai_chat_app.service.DocumentRAGService;
import com.example.ai_chat_app.service.DocumentVectorService;
import com.example.ai_chat_app.service.EmbeddingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:4173", "http://127.0.0.1:4173"})
public class DocumentController {

    @Autowired
    private DocumentParserService documentParserService;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private DocumentVectorService documentVectorService;

    @Autowired
    private DocumentRAGService documentRAGService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file is empty."));
        }

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.txt";

        try {
            // 1. Extract raw text from file
            String rawText = documentParserService.extractText(file);
            if (rawText.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No readable text found in document."));
            }

            // 2. Split into overlapping chunks
            List<String> chunks = documentParserService.chunkText(rawText);

            // 3. Delete existing chunks for this document if re-uploading
            documentVectorService.deleteDocument(fileName);

            // 4. Generate embeddings and persist chunks
            int savedCount = 0;
            for (int i = 0; i < chunks.size(); i++) {
                String chunk = chunks.get(i);
                List<Double> vector = embeddingService.generateEmbedding(chunk);
                if (!vector.isEmpty()) {
                    documentVectorService.saveChunk(fileName, i + 1, chunk, vector);
                    savedCount++;
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("documentName", fileName);
            response.put("chunksCount", savedCount);
            response.put("status", "success");
            response.put("message", "Document successfully parsed, embedded, and indexed.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Document upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to process document: " + e.getMessage()));
        }
    }

    @PostMapping("/query")
    public ResponseEntity<?> queryDocuments(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        if (query == null || query.isBlank()) {
            query = request.get("prompt");
        }
        Map<String, Object> response = documentRAGService.queryGroundedRAG(query);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/query/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public reactor.core.publisher.Flux<String> streamQueryGet(@RequestParam(name = "query", required = false) String query, @RequestParam(name = "prompt", required = false) String prompt) {
        String q = query != null && !query.isBlank() ? query : prompt;
        return documentRAGService.streamGroundedRAG(q);
    }

    @PostMapping(value = "/query/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public reactor.core.publisher.Flux<String> streamQueryPost(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        if (query == null || query.isBlank()) {
            query = request.get("prompt");
        }
        return documentRAGService.streamGroundedRAG(query);
    }

    @GetMapping
    public List<DocumentSummary> listDocuments() {
        return documentVectorService.listDocuments();
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<Void> deleteDocument(@PathVariable String name) {
        documentVectorService.deleteDocument(name);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearAllDocuments() {
        documentVectorService.clearAllDocuments();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return Map.of(
                "totalChunks", documentVectorService.getTotalChunkCount(),
                "documentsCount", documentVectorService.listDocuments().size(),
                "embeddingModel", embeddingService.getEmbeddingModel()
        );
    }
}
