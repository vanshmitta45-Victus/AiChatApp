# Memory — Project Memory

## 1. Current Status (2026-10-01, commit `872c768`, `main` clean)
- Backend `23/23` pass (`AiChatAppApplicationTests:1`, `NewModulesIntegrationTest:9`, `RbacAndSubsystemTest:13`); `bootJar` → `build/libs/ai-chat-app-0.0.1-SNAPSHOT.jar`; frontend `vite build` 2181 modules; `docker compose config` valid; `npm run lint` warnings only.
- Pushed to `https://github.com/vanshmitta45-Victus/AiChatApp.git` (`d929c8a..872c768`).
- Docker daemon was offline at test time; live `compose up` + Ollama smoke still pending.

## 2. Complete Tasks
- Launch-path unification, Docker jar fix, `/api/health` + actuator healthcheck (was `/api/auth/me` 401), CORS `*`+credentials fix, `pgvector 0.1.6` + `?::vector` RAG fix, `document_chunks` DDL + upsert, `DocumentChunkRepository` method fix, auth backdoor removal, audit auth header, `/ws/` proxy fix, CI dual-image fix, `spring.sql.init.mode=never` + JPA `TEXT` fallback (fixed `23 failed` vector-extension regression), removed compose `version`.

## 3. In Progress / Next
1. Live deploy check: start Docker, `docker compose up --build`, pull Ollama models, smoke `/api/health`, login, doc upload → `/api/documents/query/stream`.
2. Decide single RAG store (`document_chunks` vs `document_analysis_chunks`) + add HNSW index + Flyway migration.
3. Wire or drop `/ws` STOMP (proxy exists, no client usage); add `VITE_API_BASE_URL` + `apiFetch()`; code-split 716kB bundle.
4. Prod hardening: set `JWT_SECRET`, `SPRING_*`, `OLLAMA_*` envs; add refresh/logout; cache-control for `index.html`.

## 4. Key Decisions & Gotchas
- Junctions, not copies: `backend|frontend` → `ai-chat-app (Backend|Frontend)` (`Get-Item LinkType: Junction`).
- Never `layout.buildDirectory → ~/.gradle-builds` (breaks Docker); OneDrive locks `backend/build/` — `gradlew --stop`, kill `java`, delete `build`, retry.
- `pgvector` Java is `0.1.6` (`0.8.0` doesn't exist on Central).
- Plain local Postgres has no `vector` ext — keep JPA portable, pgvector only in JDBC path with warn-fallback; Docker `pgvector/pg17` required for real similarity.
- Health must be anonymous 200; `curl -f` fails on 401.
