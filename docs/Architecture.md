# Architecture

## 1. High-Level Architecture

```
Browser :5173 (Vite dev proxy / Nginx prod)
  ├─ /api/* ──▶ Spring Boot :8080 ──▶ PostgreSQL :5432 (pgvector/pgvector:pg17)
  ├─ /ws/* ───▶ Spring Boot STOMP/WS (proxied, currently unwired in src)
  ├─ /uploads/ ▶ Spring Boot static (`file.upload-dir=./uploads`)
  └─ / ───────▶ Nginx `try_files → /index.html` (BrowserRouter)

Spring Boot ──▶ Ollama :11434 (`/api/chat`, `/api/generate`, `/api/embeddings`)
  models: `llama3.2` (reasoning), `nomic-embed-text` (768-dim, fallback deterministic normalized vector)
```

Docker (`docker-compose.yml`): `postgres` (healthy) → `backend` (`/api/health` healthy) → `frontend` (`5173:80`).
`extra_hosts: host.docker.internal:host-gateway` lets backend reach host Ollama.

## 2. Technology Stack
| Layer | Tech (pinned) |
|---|---|
| Backend | Java 21 toolchain, Spring Boot `4.1.1`, `webmvc` + `webflux` (WebClient/SSE), `websocket`, `security` (stateless JWT `jjwt:0.12.6`), `data-jpa`, `validation`, `actuator` (health only), `com.pgvector:pgvector:0.1.6`, `postgresql` runtime, PDFBox `3.0.3` + OpenPDF `2.0.3`, Jackson |
| DB | PostgreSQL 17 + `vector` ext; JPA `ddl-auto=${SPRING_JPA_HIBERNATE_DDL_AUTO:update}`; `spring.sql.init.mode=never` (schema.sql is reference; `VectorDatabaseConfig` creates ext + `document_chunks` at runtime) |
| Frontend | React `19.2.8`, `react-router-dom` `7.18.4`, Vite `8.3.0`, Tailwind `3.4.19`, `lucide-react`, `react-markdown` + `remark-gfm`; `oxlint` |
| AI | Ollama local; `OLLAMA_*` envs override `application.properties` defaults |
| DevOps | Multi-stage Docker (`eclipse-temurin:21` → JRE + `curl`; `node:20-alpine` → `nginx:alpine`), `nginx.conf` (`/api/`, `/ws/`, `/uploads/` proxy, SSE `proxy_buffering off`, 300s/3600s timeouts) |

## 3. Folder Structure
```
backend/ (= junction → ai-chat-app (Backend)/)
  build.gradle, settings.gradle (rootProject.name='ai-chat-app'), Dockerfile, gradlew*
  src/main/java/com/example/ai_chat_app/
    AiChatAppApplication.java (@SpringBootApplication @EnableAsync)
    config/: SecurityConfig, VectorDatabaseConfig, WebClientConfig, FileStorageConfig, WebSocketConfig, DataInitializer
    controller/: Auth, Health (/api/health), Chat, ChatWebSocket, Document, Resume, Media, CodeReview, Note, Task, Workspace, Swarm, AiEvaluation, SelfHealingTest, AdminIdentity
    service/: Auth, Chat, DocumentRAG, DocumentVector (JDBC pgvector), DocumentParser, Embedding, Gemini, AgentExecution, CodeAnalysis, GitHub, Resume, Note, Ticket, ProjectManagement, User, MediaStorage, AiEvaluation, BugTriageSwarm, SupportKnowledge, SelfHealingTest
    model/: User, Conversation, ConversationParticipant(+Id), Message, MessageMention, Channel, ChatMessage, SlackMessage, Note, Project, Task, Ticket, AuditLog, DocumentUpload, DocumentChunk (TEXT fallback), ResumeAnalysis, CodeReview, EvaluationReport, SwarmExecution
    repository/: 19 JpaRepositories (DocumentChunkRepository uses findByDocument_IdOrderByChunkIndexAsc)
    security/: JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
    dto/: Auth*, User*, Chat*, Document*, Resume*, Task*, Eval*, Swarm*, SelfHeal* ...
    event/: HighPriorityBugCreatedEvent
  src/main/resources/: application.properties (env placeholders), schema.sql (reference, VECTOR defs)
  src/test/java/...: AiChatAppApplicationTests (1), NewModulesIntegrationTest (9), RbacAndSubsystemTest (13)
frontend/ (= junction → ai-chat-app (Frontend)/)
  package.json, vite.config.js (proxy /api,/ws,/uploads → :8080), nginx.conf, tailwind.config.js, postcss.config.js
  src/: App.jsx (BrowserRouter, 14 routes), main.jsx, index.css → styles/spatial.css
    context/AuthContext.jsx (token, authHeader, role guards)
    components/auth|layout|dashboard|kanban|chat|notepad|intelligence|projects|teams|admin|settings
docs/: PRD, Architecture, Rules, Desgin, Tasks, Memory
```

## 4. Workflows
- **Auth:** `POST /api/auth/login` → JWT → `Authorization: Bearer` → `JwtAuthenticationFilter` → `@WithMockUser`/RBAC (`/api/admin/users/**` needs ADMIN/MANAGER, else 403; anon 401).
- **Chat publish:** `ChatService.processAndSendMessage` enforces `ONE_TO_MANY` (only ADMIN/MANAGER/LEAD post) else `AccessDeniedException`; extracts `@mentions` → `message_mentions`.
- **Upload doc:** `POST /api/documents/upload` → `DocumentParserService.extractText/chunkText` → `EmbeddingService.generateEmbedding` (Ollama or 768-dim fallback) → `DocumentVectorService.saveChunk` (`?::vector`, upsert on `(document_name,chunk_index)`).
- **RAG query:** embed query → `searchSimilarChunks (?::vector <=>)` → fallback `getOverviewChunks` → build context → Ollama `/api/generate` (3s timeout, non-stream) or SSE `Flux` (`/query/stream` GET+POST) + citations footer; on Ollama error returns grounded extractive fallback.
- **CRITICAL task:** `POST /api/tasks` → `HighPriorityBugCreatedEvent` → `BugTriageSwarmService.executeSwarmTriage` (assign + story points + suspected file + channel dispatch).
- **Health:** Docker `curl -f :8080/api/health`; code also exposes actuator health (permitAll).
