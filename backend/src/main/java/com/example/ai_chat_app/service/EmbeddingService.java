package com.example.ai_chat_app.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;

@Service
public class EmbeddingService {

    private final WebClient webClient = WebClient.builder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ollama.embedding.url:http://localhost:11434/api/embeddings}")
    private String embeddingUrl;

    @Value("${ollama.embedding.model:all-minilm}")
    private String embeddingModel;

    public List<Double> generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptyList();
        }

        try {
            Map<String, Object> request = Map.of(
                    "model", embeddingModel,
                    "prompt", text
            );

            String responseBody = webClient.post()
                    .uri(embeddingUrl)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            if (responseBody != null) {
                JsonNode root = objectMapper.readTree(responseBody);
                if (root.has("embedding") && root.get("embedding").isArray()) {
                    List<Double> vector = new ArrayList<>();
                    for (JsonNode item : root.get("embedding")) {
                        vector.add(item.asDouble());
                    }
                    return vector;
                }
            }
        } catch (Exception e) {
            System.err.println("Ollama embedding call unavailable (" + e.getMessage() + "), using deterministic 768-dim vector fallback.");
        }

        // Deterministic 768-dimension vector fallback derived from text hashing
        return generateDeterministicVector(text, 768);
    }

    private List<Double> generateDeterministicVector(String text, int dim) {
        List<Double> vector = new ArrayList<>(dim);
        long seed = (long) text.hashCode() + 31L;
        Random rng = new Random(seed);
        double sumSq = 0.0;
        for (int i = 0; i < dim; i++) {
            double val = rng.nextGaussian();
            vector.add(val);
            sumSq += val * val;
        }
        double norm = Math.sqrt(sumSq);
        if (norm > 0) {
            for (int i = 0; i < dim; i++) {
                vector.set(i, vector.get(i) / norm);
            }
        }
        return vector;
    }

    public String getEmbeddingModel() {
        return embeddingModel;
    }
}
