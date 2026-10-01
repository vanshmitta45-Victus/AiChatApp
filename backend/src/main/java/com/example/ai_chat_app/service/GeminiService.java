package com.example.ai_chat_app.service;

import com.example.ai_chat_app.dto.DocumentSearchMatch;
import com.example.ai_chat_app.model.ChatMessage;
import com.example.ai_chat_app.repository.ChatMessageRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private final WebClient webClient = WebClient.builder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private DocumentVectorService documentVectorService;

    @Value("${ollama.base.url:http://localhost:11434}")
    private String baseUrl;

    @Value("${ollama.api.url:http://localhost:11434/api/chat}")
    private String apiUrl;

    @Value("${ollama.model.name:llama3.2}")
    private String defaultModelName;

    @Value("${ollama.memory.limit:6}")
    private int memoryLimit;

    @Value("${rag.top.k:4}")
    private int ragTopK;

    @Value("${rag.max.distance:0.75}")
    private double maxDistance;

    @Value("${ollama.system.prompt:You are a helpful, knowledgeable, and concise AI assistant. Answer questions accurately using clean Markdown formatting (such as bullet points, bold text, and code blocks where applicable). Maintain conversational continuity and refer to past messages when appropriate.}")
    private String defaultSystemPrompt;

    public Flux<String> streamChat(String prompt, String model, Boolean useRag) {
        String effectiveModel = (model != null && !model.isBlank()) ? model : defaultModelName;
        boolean enableRag = (useRag == null || useRag) && documentVectorService.getTotalChunkCount() > 0;

        // 1. Retrieve recent conversational history from PostgreSQL
        List<ChatMessage> recentMessages;
        try {
            if (memoryLimit <= 6) {
                recentMessages = new ArrayList<>(chatMessageRepository.findTop6ByOrderByTimestampDesc());
            } else {
                recentMessages = new ArrayList<>(chatMessageRepository.findTop10ByOrderByTimestampDesc());
            }
            Collections.reverse(recentMessages);
        } catch (Exception ex) {
            System.err.println("Failed to fetch conversational history: " + ex.getMessage());
            recentMessages = Collections.emptyList();
        }

        // 2. Save current user query to PostgreSQL
        try {
            chatMessageRepository.save(new ChatMessage("user", prompt));
        } catch (Exception ex) {
            System.err.println("Failed to save user query: " + ex.getMessage());
        }

        // 3. RAG Semantic Retrieval & Grounding
        List<DocumentSearchMatch> relevantMatches = Collections.emptyList();
        String systemInstruction = defaultSystemPrompt;
        String userContent = prompt;

        if (enableRag) {
            boolean isOverviewQuery = prompt.matches("(?i).*(check|summariz|summary|overview|what is this|tell me about|who is|about|read|document|pdf|file|resume|content|details).*");

            if (isOverviewQuery) {
                relevantMatches = documentVectorService.getOverviewChunks(ragTopK);
            } else {
                try {
                    List<Double> queryVector = embeddingService.generateEmbedding(prompt);
                    if (!queryVector.isEmpty()) {
                        List<DocumentSearchMatch> rawMatches = documentVectorService.searchSimilarChunks(queryVector, ragTopK);
                        relevantMatches = rawMatches.stream()
                                .filter(m -> m.getDistance() <= 0.88)
                                .collect(Collectors.toList());

                        if (relevantMatches.isEmpty() && !rawMatches.isEmpty()) {
                            relevantMatches = rawMatches.stream().limit(ragTopK).collect(Collectors.toList());
                        }
                    }
                } catch (Exception e) {
                    System.err.println("RAG search failed: " + e.getMessage());
                }
            }

            if (!relevantMatches.isEmpty()) {
                systemInstruction = "You are a grounded and precise AI document assistant.\n" +
                        "CRITICAL INSTRUCTIONS:\n" +
                        "1. Answer the current user question strictly and thoroughly using the provided document context below.\n" +
                        "2. If the user asks to check, summarize, or describe the document, synthesize the key facts from the context.\n" +
                        "3. Do not invent or hallucinate details that are not supported by the context.\n" +
                        "4. Always present facts with clean Markdown formatting (bullet points, bold text, code blocks).";

                StringBuilder contextBuilder = new StringBuilder();
                contextBuilder.append("--- CONTEXT FROM UPLOADED DOCUMENTS ---\n");
                for (DocumentSearchMatch match : relevantMatches) {
                    contextBuilder.append("\n[Document: ").append(match.getDocumentName())
                            .append(", Chunk #").append(match.getChunkIndex()).append("]:\n")
                            .append(match.getContent()).append("\n");
                }
                contextBuilder.append("---------------------------------------\n\n");
                contextBuilder.append("Current Question: ").append(prompt);
                userContent = contextBuilder.toString();
            } else {
                String noMatchResponse = "I could not find any relevant information in the uploaded documents regarding **\"" +
                        prompt + "\"**.\n\nPlease check your question against the uploaded documents, or switch to the General Chat tab.";
                saveAssistantMessage(noMatchResponse);
                return Flux.just(noMatchResponse);
            }
        }

        // 4. Assemble multi-turn message payload
        List<Map<String, String>> messagesPayload = new ArrayList<>();
        messagesPayload.add(Map.of("role", "system", "content", systemInstruction));

        // When RAG is active with specific context, skip past conversational turns so they don't pollute document grounding
        if (!enableRag) {
            for (ChatMessage historyItem : recentMessages) {
                if (historyItem.getRole() != null && historyItem.getContent() != null && !historyItem.getContent().isBlank()) {
                    messagesPayload.add(Map.of("role", historyItem.getRole(), "content", historyItem.getContent()));
                }
            }
        }

        // Current prompt
        messagesPayload.add(Map.of("role", "user", "content", userContent));

        // 5. Prepare request for Ollama /api/chat
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", effectiveModel);
        requestBody.put("messages", messagesPayload);
        requestBody.put("stream", true);

        StringBuilder fullResponse = new StringBuilder();

        Flux<String> llmStream = webClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .flatMap(chunk -> Flux.fromIterable(extractResponseTexts(chunk)))
                .doOnNext(fullResponse::append);

        // Append source citations if RAG chunks were used
        if (!relevantMatches.isEmpty()) {
            Set<String> uniqueSources = relevantMatches.stream()
                    .map(m -> m.getDocumentName() + " (Chunk " + m.getChunkIndex() + ")")
                    .collect(Collectors.toCollection(LinkedHashSet::new));

            String sourcesFooter = "\n\n**Sources Referenced:**\n" +
                    uniqueSources.stream().map(s -> "- `" + s + "`").collect(Collectors.joining("\n"));

            llmStream = Flux.concat(llmStream, Flux.just(sourcesFooter))
                    .doOnNext(fullResponse::append);
        }

        return llmStream
                .doOnComplete(() -> saveAssistantMessage(fullResponse.toString()))
                .doOnCancel(() -> {
                    if (fullResponse.length() > 0) {
                        saveAssistantMessage(fullResponse.toString());
                    }
                })
                .onErrorResume(ex -> {
                    String errorMsg = "\n[Error communicating with AI service: " + ex.getMessage() + "]";
                    saveAssistantMessage(fullResponse.toString() + errorMsg);
                    return Flux.just(errorMsg);
                });
    }

    public Flux<String> streamChat(String prompt, String model) {
        return streamChat(prompt, model, true);
    }

    public Flux<String> streamChat(String prompt) {
        return streamChat(prompt, defaultModelName, true);
    }

    public List<String> getAvailableModels() {
        try {
            String tagsUrl = baseUrl + "/api/tags";
            Map<?, ?> response = webClient.get()
                    .uri(tagsUrl)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(3))
                    .block();

            if (response != null && response.containsKey("models")) {
                List<?> rawList = (List<?>) response.get("models");
                List<String> modelNames = new ArrayList<>();
                for (Object item : rawList) {
                    if (item instanceof Map<?, ?> modelMap && modelMap.containsKey("name")) {
                        modelNames.add(String.valueOf(modelMap.get("name")));
                    }
                }
                if (!modelNames.isEmpty()) {
                    return modelNames;
                }
            }
        } catch (Exception e) {
            System.err.println("Could not query Ollama models: " + e.getMessage());
        }
        return Collections.singletonList(defaultModelName);
    }

    public Map<String, Object> checkStatus() {
        Map<String, Object> statusMap = new HashMap<>();
        boolean ollamaOnline = false;
        List<String> models = Collections.emptyList();

        try {
            models = getAvailableModels();
            ollamaOnline = !models.isEmpty();
        } catch (Exception ignored) {}

        statusMap.put("status", ollamaOnline ? "online" : "offline");
        statusMap.put("database", "connected");
        statusMap.put("models", models);
        statusMap.put("defaultModel", defaultModelName);
        statusMap.put("ragChunksCount", documentVectorService.getTotalChunkCount());
        statusMap.put("documentsCount", documentVectorService.listDocuments().size());
        statusMap.put("embeddingModel", embeddingService.getEmbeddingModel());
        return statusMap;
    }

    public void clearHistory() {
        chatMessageRepository.deleteAll();
    }

    private void saveAssistantMessage(String content) {
        if (content != null && !content.trim().isEmpty()) {
            try {
                chatMessageRepository.save(new ChatMessage("assistant", content));
            } catch (Exception ex) {
                System.err.println("Failed to save assistant message: " + ex.getMessage());
            }
        }
    }

    private List<String> extractResponseTexts(String chunk) {
        List<String> texts = new ArrayList<>();
        if (chunk == null || chunk.isBlank()) {
            return texts;
        }

        String[] lines = chunk.split("\r?\n");
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) {
                continue;
            }
            try {
                JsonNode root = objectMapper.readTree(line);
                if (root.has("message") && root.get("message").has("content")) {
                    texts.add(root.get("message").get("content").asText());
                } else if (root.has("response")) {
                    texts.add(root.get("response").asText());
                }
            } catch (Exception ignored) {
            }
        }
        return texts;
    }
}