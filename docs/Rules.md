# Rules — Development Rules

## 1. General Principles
1. Evidence before synthesis: read files (`read`/`grep`) before claiming; include `path:line` refs.
2. Verify by execution: `cd backend; ./gradlew test` (23/23), `cd frontend; npm run build`, `docker compose config`.
3. Prefer edits over new files; keep diffs minimal and reversible.
4. One canonical tree: `backend/` + `frontend/` are Junctions to `ai-chat-app (Backend)/` + `ai-chat-app (Frontend)/` — never duplicate logic; align `package.json`, `start-app.bat`, `docker-compose.yml`, `README.md`.
5. No secrets in repo: use `${ENV:default}` placeholders (`application.properties` pattern); prod overrides via compose env (`SPRING_*`, `OLLAMA_*`, `JWT_SECRET`).
6. Fail gracefully for optional AI/vector: `try/catch` + fallback (deterministic embedding, extractive RAG answer, empty search list) — never 500 on Ollama/vector absence.

## 2. Technology & Coding Standards
- **Backend (Java 21, Boot 4.1.1):** `jakarta.*` only; stateless security (`SessionCreationPolicy.STATELESS`, CSRF off); `permitAll` only for `/api/auth/**`, `/api/health`, `/actuator/health`, `/ws/**`, `/uploads/**`, public resume PDF, `/error`; everything else authenticated + method RBAC.
- **CORS:** never `allowedOrigins("*") + allowCredentials(true)` — use `setAllowedOriginPatterns(["http://localhost:*","http://127.0.0.1:*"])` + `allowCredentials(false)` (`config/SecurityConfig.java:73-83`).
- **DB:** JPA entities portable (`DocumentChunk.embedding` = `TEXT`); pgvector `VECTOR(768)` only in JDBC `document_chunks` via `DocumentVectorService` with parameterized `?::vector` and literal `"[v1,v2,...]"` (`toVectorLiteral`); never string-concat `ARRAY[...]::double precision[]`. Table `document_chunks` has `UNIQUE(document_name,chunk_index)` + `CREATE TABLE IF NOT EXISTS` in both `schema.sql` and `VectorDatabaseConfig` (warn-only on plain Postgres).
- **Migrations:** `spring.sql.init.mode=never`; `schema.sql` is reference for pgvector Docker; runtime DDL lives in `VectorDatabaseConfig` + `ddl-auto=update`.
- **Deps:** `com.pgvector:pgvector:0.1.6` (not `0.8.0`), `spring-boot-starter-actuator` (health only). No custom `layout.buildDirectory` (breaks `Dockerfile:36` jar copy).
- **Frontend (React 19):** relative `fetch('/api/...')` only (works with Vite proxy + Nginx); never hardcode `:8080`. Always send `authHeader()` on protected calls (`AuditStage.jsx:85`). No auto-login backdoors. `BrowserRouter` requires Nginx `try_files $uri $uri/ /index.html`; `/ws/` needs trailing-slash proxy pair.
- **Docker:** backend image needs `curl` for healthcheck; healthcheck must hit anonymous 200 (`/api/health`), never `/api/auth/me` (401).

## 3. Project Structure Rules
- Backend layers: `controller → service → repository/model/dto`; no SQL in controllers; no `System.out` (use `System.err` fallback logs only in AI fallbacks).
- Frontend: `context/` for auth only; no `src/api` client yet — if adding, centralize as `apiFetch()` with `VITE_API_BASE_URL`; keep `App.jsx` route groups (workspace / AI suite / admin-guarded / settings).
- Tests: `@SpringBootTest` + `MockMvc` + `@WithMockUser`; require plain-Postgres portability (no vector ext in CI).
- Git: track `backend/`, `frontend/` (junction view); `ai-chat-app (Backend)/` + `(Frontend)/` stay git-ignored; never commit `build/`, `dist/`, `node_modules/`, `uploads/*`.
