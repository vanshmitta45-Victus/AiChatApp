# Tasks

Legend: `[x]` done & verified, `[~]` in progress / partial, `[ ]` todo.

## 1. Project Setup
- [x] Junction canonical tree (`backend/`, `frontend/` → `ai-chat-app (Backend|Frontend)/`); align `package.json:6-10`, `start-app.bat:7,10`, `docker-compose.yml:33,68`, `README.md:91-99`
- [x] Remove `layout.buildDirectory` override (`backend/build.gradle:16`) → `bootJar` emits `build/libs/*.jar` for `Dockerfile:36`
- [x] Deps: `pgvector:0.1.6`, `actuator` (`backend/build.gradle:35-36`); `version:` removed from compose
- [x] Env placeholders (`application.properties:4-7,17,26-27,35-36`), `spring.sql.init.mode=never`, actuator health exposed
- [x] CI: `.github/workflows/docker-image.yml:18-21` builds `./backend` + `./frontend` separately
- [x] Verify: `gradlew test 23/23`, `npm run build`, `docker compose config`

## 2. Authentication & RBAC
- [x] JWT stateless (`SecurityConfig.java:49`), `permitAll` allowlist + `/api/health` (`HealthController.java`), fixed CORS (`:75-78`)
- [x] Endpoints `POST /api/auth/signup|login`, `GET /api/auth/me` (401 anon); role guard `ProtectedRoute` for `/admin/*`
- [x] Remove frontend auto-login backdoor (`AuthContext.jsx:41-68`); fix `AuditStage.jsx:85` missing `authHeader()`
- [ ] Add logout/refresh/revoke + server-side token denylist (only localStorage clear today)

## 3. Chat / Kanban / Notes / Projects / Teams
- [x] 4 topologies + `@mentions` + media/location (`ChatService`, `SpatialChatContainer`)
- [x] Kanban 6 lanes + drag-drop `PATCH /api/tasks/{id}/status` + inspector
- [x] Notes masonry CRUD + pin/archive/color/tags (`/api/notes`)
- [x] Projects/Teams/Dashboard/Settings stages routed (`App.jsx:30-64`)
- [~] `/ws` STOMP proxied (`nginx.conf`, `vite.config.js`) but unused in `src/` — wire or remove dead proxy

## 4. AI Suite & Data
- [x] RAG: `DocumentVectorService` parameterized `?::vector` + upsert, `VectorDatabaseConfig` + `schema.sql` ensure `document_chunks VECTOR(768)`; JPA `DocumentChunk` uses portable `TEXT`
- [x] Resume/Code/Eval/SelfHeal/Swarm endpoints + SSE streaming (`DocumentController.java:87-100`)
- [ ] Unify `document_analysis_chunks` (JPA) vs `document_chunks` (JDBC) into one store + HNSW index; add `VITE_API_BASE_URL` + central `apiFetch()`
- [ ] Split 716kB frontend bundle (dynamic `import()`, route code-splitting)

## 5. Release
- [x] Push `872c768` to `origin/main`
- [ ] Live `docker compose up --build` with pgvector + Ollama (`llama3.2`, `nomic-embed-text`) and manual smoke (`/api/health`, login, upload, RAG stream)
