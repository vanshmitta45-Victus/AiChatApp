# Spatial AI Workspace OS & Collaboration Platform

> An enterprise-grade, spatial computing (visionOS-inspired) collaboration platform combining the communication power of **Slack & WhatsApp**, the sprint task management of **Jira**, the team notes of **Google Keep**, and an autonomous **AI Intelligence Suite** with local LLMs.

---

## 🚀 Key Highlights & Architectural Modules

### 1. Spatial UI/UX Design System
- **Deep-Space Dark Canvas (`#07090e`)** with subtle ambient indigo and cyan mesh background gradients.
- **Frosted Acrylic Surfaces (Glassmorphism)**: `backdrop-blur-2xl bg-slate-900/60 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]`.
- **Pill Geometry**: 1px specular top-edge highlights (`border-t border-white/20`) and tactile spring clicks (`active:scale-[0.98]`).

### 2. Multi-Topology Real-Time Chat & Rich Media
- **4 Topologies Supported**:
  1. `ONE_TO_ONE`: Direct encrypted peer-to-peer messaging.
  2. `MANY_TO_MANY`: Open team channels with public broadcasting.
  3. `ONE_TO_MANY`: Broadcast announcements channel (Staff read-only; Admin/Manager/Lead can post).
  4. `MANY_TO_ONE`: Escalation / Helpdesk threads routed to designated lead handlers.
- **Rich Media & Telemetry**: Image uploads, video player, voice notes via browser `MediaRecorder` API, PDF attachments, and live GPS geolocation telemetry tags.
- **Slack-Style `@Mentions`**: Real-time suggestion popover and STOMP WebSocket push notifications.

### 3. Jira-Style Spatial Task Board
- **6 Kanban Lanes**: `Backlog`, `To Do`, `In Progress`, `In Review`, `Blocked`, and `Done`.
- **HTML5 Drag-and-Drop**: Smooth drag reordering synced with `PATCH /api/tasks/{id}/status`.
- **Task Inspector**: Translucent slide-over drawer for checklists, assignees, story points, and priority indicators.

### 4. Google Keep-Style Team Notepad
- **Masonry Glass Grid**: Responsive columns with color-coded glass tints (`amber`, `emerald`, `blue`, `indigo`, `violet`, `rose`, `slate`).
- Pin toggles, tag chips, archive management, and instant substring search.

### 5. Enterprise AI Intelligence Suite (Local Ollama)
1. **Document Analyzer (RAG)**: Apache PDFBox text extraction, 500-char overlapping chunks, 768-dim embeddings (`nomic-embed-text`), stored in PostgreSQL `pgvector` with `<=>` cosine distance retrieval and Server-Sent Events (SSE) streaming output with source citations.
2. **Resume Studio**: Ingests resume PDFs, evaluates via `llama3.2` returning strict JSON for ATS scores, line-item critique, and streams an ATS-compliant PDF using OpenPDF.
3. **Code & PR Inspector**: Static AST linter or GitHub PR URL parser detecting vulnerabilities (SQLi, auth bugs) with side-by-side diff previews.
4. **AI Reliability & Evaluation Harness**: Automated Spring Boot benchmark suite verifying Grounding Index, token consumption, and sub-second latency across AI endpoints. Results stored in `evaluation_reports`.
5. **Self-Healing Test Assistant**: Repairs broken Selenium, Playwright, and Cypress locators from failing stack traces and modified DOM contexts.
6. **Autonomous Multi-Agent Swarms**: Event-driven triage for High-Priority bugs:
   - 👔 **Project Manager Agent**: Evaluates team workloads and reassigns tickets.
   - 🔍 **Code Inspector Agent**: Correlates PR diffs to pinpoint culprit files.
   - 💬 **Support Agent**: Dispatches incident escalation cards into `#helpdesk`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Spring Boot 3, Java 21, Spring Security (RBAC), Spring WebSocket (STOMP), Spring WebFlux, PDFBox, OpenPDF |
| **Database** | PostgreSQL 17 + `pgvector` extension for 768-dimensional embeddings |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React icons, React Router DOM |
| **AI / LLM** | Ollama (`llama3.2` for reasoning/critique/code, `nomic-embed-text` for vector embeddings) |
| **DevOps** | Docker, Docker Compose, Nginx Alpine, Multi-stage builds |

---

## ⚡ Quick Start

### Option A: One-Command Docker Setup
Requires Docker & Docker Compose:

```bash
docker compose up --build
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080`
- **PostgreSQL**: `localhost:5432`

---

### Option B: Local Development Setup

#### 1. Prerequisites
- **PostgreSQL** running on port `5432` with database `aichatdb` (`postgres` / `1234`) with `vector` extension.
- **Ollama** running locally on port `11434`:
  ```bash
  ollama pull llama3.2
  ollama pull nomic-embed-text
  ```

#### 2. Start Application
Run the one-click batch launcher:
```cmd
start-app.bat
```

Or start services independently:

**Backend:**
```bash
cd backend
./gradlew bootRun
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Test Accounts (Default Password: `1234`)

| Username | Role | Permissions |
| :--- | :--- | :--- |
| `vansh` / `admin` | `ADMIN` | Full admin & Identity Management access |
| `manager` | `MANAGER` | User management & incident escalation review |
| `lead` / `teamleader` | `TEAM_LEADER` | Broadcast publisher & task assignee |
| `staff` | `STAFF` | Collaborator & ticket reporter |

---

## 🧪 Automated Test Suite

Run the full Gradle test suite (including RBAC, Chat Topologies, RAG Vector Search, and Multi-Agent Swarms):

```bash
cd backend
./gradlew test
```
All 14 integration and unit tests pass with `BUILD SUCCESSFUL`.
