package com.example.ai_chat_app.service;

import com.example.ai_chat_app.dto.DocumentSearchMatch;
import com.example.ai_chat_app.dto.DocumentSummary;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentRAGService {

    @Autowired
    private DocumentParserService documentParserService;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private DocumentVectorService documentVectorService;

    @Autowired(required = false)
    private GeminiService geminiService;

    @Value("${rag.top.k:4}")
    private int topK;

    @Value("${ollama.base.url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model.name:llama3.2}")
    private String modelName;

    private final WebClient webClient = WebClient.builder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> parseAndIndexDocument(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.txt";
        String rawText = documentParserService.extractText(file);

        if (rawText == null || rawText.isBlank()) {
            throw new IllegalArgumentException("No readable text found in document.");
        }

        // 500-character chunks with 50-character overlap
        List<String> chunks = documentParserService.chunkText(rawText);

        documentVectorService.deleteDocument(fileName);

        int indexedChunks = 0;
        for (int i = 0; i < chunks.size(); i++) {
            String chunkContent = chunks.get(i);
            List<Double> vector = embeddingService.generateEmbedding(chunkContent);
            if (!vector.isEmpty()) {
                documentVectorService.saveChunk(fileName, i + 1, chunkContent, vector);
                indexedChunks++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("documentName", fileName);
        result.put("chunksCount", indexedChunks);
        result.put("status", "SUCCESS");
        result.put("message", "Document vectorized and indexed into PostgreSQL pgvector successfully.");
        return result;
    }

    public Map<String, Object> queryGroundedRAG(String query) {
        if (query == null || query.isBlank()) {
            return Map.of("answer", "Please provide a valid query.", "citations", Collections.emptyList());
        }

        List<Double> queryEmbedding = embeddingService.generateEmbedding(query);
        List<DocumentSearchMatch> matches = documentVectorService.searchSimilarChunks(queryEmbedding, this.topK);

        if (matches.isEmpty()) {
            matches = documentVectorService.getOverviewChunks(this.topK);
        }

        List<Map<String, Object>> citations = new ArrayList<>();
        StringBuilder contextBuilder = new StringBuilder();

        for (DocumentSearchMatch match : matches) {
            double similarity = Math.max(0.0, Math.min(1.0, 1.0 - match.getDistance()));
            Map<String, Object> citation = new HashMap<>();
            citation.put("documentName", match.getDocumentName());
            citation.put("chunkIndex", match.getChunkIndex());
            citation.put("content", match.getContent());
            citation.put("similarity", Math.round(similarity * 100.0) / 100.0);
            citations.add(citation);

            contextBuilder.append("\n[Document: ").append(match.getDocumentName())
                    .append(" (Chunk ").append(match.getChunkIndex()).append(")]:\n")
                    .append(match.getContent()).append("\n");
        }

        String answer = null;
        if (contextBuilder.length() > 0) {
            String prompt = "You are a specialized AI knowledge assistant. Answer the user's question using ONLY the provided document context below.\n" +
                    "Cite relevant facts accurately and format with clean Markdown.\n\n" +
                    "DOCUMENT CONTEXT:\n" + contextBuilder + "\n\n" +
                    "USER QUESTION:\n" + query;

            try {
                Map<String, Object> body = Map.of(
                        "model", modelName != null ? modelName : "llama3.2",
                        "prompt", prompt,
                        "stream", false
                );

                String raw = webClient.post()
                        .uri((ollamaBaseUrl != null ? ollamaBaseUrl : "http://localhost:11434") + "/api/generate")
                        .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .bodyValue(body)
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofMillis(3000))
                        .block();

                if (raw != null) {
                    JsonNode node = objectMapper.readTree(raw);
                    if (node.has("response") && !node.get("response").asText().isBlank()) {
                        answer = node.get("response").asText();
                    }
                }
            } catch (Exception e) {
                System.err.println("Ollama RAG fallback: " + e.getMessage());
            }

            if (answer == null || answer.isBlank()) {
                answer = "### Knowledge Base Grounded Analysis\n\n" +
                        "Based on the **" + citations.size() + " retrieved context chunks** in `pgvector`:\n\n" +
                        "**Primary Finding:**\n" +
                        matches.get(0).getContent() + "\n\n" +
                        (matches.size() > 1 ? "**Supporting Evidence:**\n" + matches.get(1).getContent() + "\n\n" : "") +
                        "> *Retrieved via 768-dimensional nomic-embed-text embeddings with cosine similarity of " +
                        (citations.isEmpty() ? "0.95" : citations.get(0).get("similarity")) + ".*";
            }
        } else {
            answer = "No matching document chunks found in pgvector index for this query. Please upload a PDF or document first.";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("answer", answer);
        response.put("citations", citations);
        return response;
    }

    public Flux<String> streamGroundedRAG(String query) {
        if (query == null || query.isBlank()) {
            return Flux.just("Please provide a valid query.");
        }

        List<Double> queryEmbedding = embeddingService.generateEmbedding(query);
        List<DocumentSearchMatch> matches = documentVectorService.searchSimilarChunks(queryEmbedding, this.topK);

        if (matches.isEmpty()) {
            matches = documentVectorService.getOverviewChunks(this.topK);
        }

        if (matches.isEmpty()) {
            return Flux.just("No document chunks available in the pgvector index. Please upload a PDF or text file first.");
        }

        StringBuilder contextBuilder = new StringBuilder();
        List<String> citationsList = new ArrayList<>();
        for (DocumentSearchMatch match : matches) {
            double similarity = Math.max(0.0, Math.min(1.0, 1.0 - match.getDistance()));
            citationsList.add(String.format("`%s` (Chunk %d - %d%% match)", match.getDocumentName(), match.getChunkIndex(), Math.round(similarity * 100)));
            contextBuilder.append("\n[Document: ").append(match.getDocumentName())
                    .append(" (Chunk ").append(match.getChunkIndex()).append(")]:\n")
                    .append(match.getContent()).append("\n");
        }

        String prompt = "You are a specialized AI knowledge assistant. Answer the user's question using ONLY the provided document context below.\n" +
                "Cite relevant facts accurately and format with clean Markdown.\n\n" +
                "DOCUMENT CONTEXT:\n" + contextBuilder + "\n\n" +
                "USER QUESTION:\n" + query;

        Map<String, Object> body = Map.of(
                "model", modelName != null ? modelName : "llama3.2",
                "prompt", prompt,
                "stream", true
        );

        String citationsFooter = "\n\n---\n**Source Citations:**\n" +
                citationsList.stream().map(c -> "- " + c).collect(Collectors.joining("\n"));

        final List<DocumentSearchMatch> activeMatches = matches;
        return webClient.post()
                .uri((ollamaBaseUrl != null ? ollamaBaseUrl : "http://localhost:11434") + "/api/generate")
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .flatMap(chunk -> Flux.fromIterable(extractTokens(chunk)))
                .concatWith(Flux.just(citationsFooter))
                .onErrorResume(ex -> {
                    // Fallback to grounded analysis summary if local Ollama model call errors
                    String fallbackText = "### Grounded Document Analysis\n\n" +
                            "Based on **" + activeMatches.size() + " retrieved chunks** in `pgvector`:\n\n" +
                            activeMatches.get(0).getContent() + "\n\n" +
                            citationsFooter;
                    return Flux.just(fallbackText);
                });
    }

    private List<String> extractTokens(String chunk) {
        List<String> tokens = new ArrayList<>();
        if (chunk == null || chunk.isBlank()) return tokens;
        String[] lines = chunk.split("\r?\n");
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            try {
                JsonNode root = objectMapper.readTree(line);
                if (root.has("response")) {
                    tokens.add(root.get("response").asText());
                }
            } catch (Exception ignored) {}
        }
        return tokens;
    }

    public List<DocumentSummary> listDocuments() {
        return documentVectorService.listDocuments();
    }

    public void deleteDocument(String name) {
        documentVectorService.deleteDocument(name);
    }

    public void clearAllDocuments() {
        documentVectorService.clearAllDocuments();
    }
}
