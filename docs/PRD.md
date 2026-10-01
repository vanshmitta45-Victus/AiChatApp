# PRD — Spatial AI Workspace OS & Collaboration Platform

## 1. Project Overview
Enterprise-grade, spatial-computing (visionOS-inspired) collaboration platform.
Combines Slack/WhatsApp-style communication, Jira-style sprint task management,
Google Keep-style team notes, and an autonomous local-LLM AI Intelligence Suite.

Repo: `AiChatApp` — Spring Boot backend + React/Vite frontend + PostgreSQL pgvector + Ollama.
Entry points: `docker compose up --build` (frontend `http://localhost:5173`, backend `http://localhost:8080`),
or local `start-app.bat` / `package.json` scripts (`frontend` + `backend`).

> Note: `backend/` and `frontend/` are Windows Junctions to `ai-chat-app (Backend)/` and
> `ai-chat-app (Frontend)/`. Edit either side; they resolve to the same files.

## 2. Problem Statement
- Teams juggle 4+ disconnected tools (chat, tasks, notes, AI assistants, admin/audit).
- Cloud-LLM solutions leak proprietary docs/resumes/code; no grounded citations.
- Broadcast vs helpdesk vs DMs need different topologies, not one flat channel.
- Admins need RBAC + immutable audit for SOC2, without losing speed.

## 3. Goals
1. One spatial shell for chat, tasks, notes, AI, admin.
2. Local-first AI (Ollama `llama3.2` + `nomic-embed-text`) with RAG citations and SSE streaming.
3. Strict RBAC (`ADMIN`, `MANAGER`, `TEAM_LEADER`, `STAFF`) + tamper-evident audit.
4. Docker one-command deploy; local dev via Gradle + Vite proxy.
5. Reliable test gate: `cd backend; ./gradlew test` → 23/23 pass; `cd frontend; npm run build` success.

## 4. Target Users
| Role | Test account (pwd `1234`) | Permissions |
|---|---|---|
| `ADMIN` | `vansh` / `admin` | Full admin, Identity Management (`/api/admin/users/**`, `/admin/users`, `/admin/audit`) |
| `MANAGER` | `manager` | User management, escalation review |
| `TEAM_LEADER` | `lead` / `teamleader` | Broadcast publisher, task assignee |
| `STAFF` | `staff` | Collaborator, ticket reporter |

Auth: JWT Bearer (`/api/auth/signup`, `/api/auth/login`, `/api/auth/me`), stateless sessions.
Frontend `AuthContext.jsx` holds token in `localStorage`; no auto backdoor login.

## 5. Core Features (MVP)
1. **Multi-topology chat** (`ONE_TO_ONE`, `MANY_TO_MANY`, `ONE_TO_MANY` broadcast, `MANY_TO_ONE` helpdesk) — rich media (image/video/voice via `MediaRecorder`, PDF, GPS tags), `@mentions` popover.
2. **Jira-style Kanban** — 6 lanes (`Backlog`, `To Do`, `In Progress`, `In Review`, `Blocked`, `Done`), HTML5 drag-drop → `PATCH /api/tasks/{id}/status`, Task Inspector drawer, story points/checklists.
3. **Keep-style Notepad** — masonry glass grid, color tints (`amber/emerald/blue/indigo/violet/rose/slate`), pin/archive/tags/search (`/api/notes` CRUD).
4. **Document Analyzer (RAG)** — PDFBox extract → 500-char/50-overlap chunks → Ollama embeddings (768-dim, normalized fallback) → `document_chunks.embedding VECTOR(768)` with `<=>` cosine search → grounded answer + citations, SSE at `/api/documents/query/stream`.
5. **Resume Studio** — resume PDF → `llama3.2` strict JSON (ATS score, critique) → OpenPDF ATS-compliant PDF (`/api/resumes/*/download-pdf` public).
6. **Code & PR Inspector** — static linter + GitHub PR URL parser (SQLi/auth bugs), side-by-side diff.
7. **AI Evaluation Harness** — benchmark suite (grounding, latency, tokens) → `evaluation_reports` (`/api/evaluation/*`).
8. **Self-Healing Test Assistant** — repairs Selenium/Playwright/Cypress locators from stack trace + DOM (`/api/qa/self-heal/*`).
9. **Multi-Agent Swarm triage** — PM assigns engineer/story points, Code Inspector correlates auth keywords → `security/jwt/task` files, Support dispatches to `#helpdesk` (`/api/swarm/*`, auto on CRITICAL task create).
10. **Admin & Audit** — Identity panel, immutable ledger (`/api/audit`, `/api/admin/users`), health (`GET /api/health → {"status":"UP"}`, actuator `/actuator/health`).
