<div align="center">

<br/>

<img src="https://img.shields.io/badge/-%F0%9F%A9%BA%20MediVoice%20AI-0a1628?style=for-the-badge&logoColor=white" height="42"/>

<h1>AI Medical Voice Consultation Platform</h1>

<p><strong>Talk to an AI specialist doctor. Get real clinical insights. Download your report.</strong><br/>
Built for the Indian healthcare market — 9 languages, 5 specialist personas, HIPAA-aware, zero-downtime reliability architecture.</p>

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20App-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://majestic-speculoos-f73a91.netlify.app)
[![Backend API](https://img.shields.io/badge/⚡%20Backend%20API-Health%20Check-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ai-medical-voice-agent-ygc5.onrender.com/health)
[![Reliability](https://img.shields.io/badge/🛡️%20Architecture-Cold--Start%20Resilient-blueviolet?style=for-the-badge)](https://github.com/vaibhav-aiml/ai-medical-voice-agent#-production-reliability--resilience-architecture)

<br/>

![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=flat-square&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Streaming-010101?style=flat-square&logo=socket.io&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

<br/>

<img src="https://img.shields.io/badge/AI%20Provider-Groq%20%7C%20llama--3.3--70b-FF6B35?style=flat-square"/>
<img src="https://img.shields.io/badge/STT-AssemblyAI-6B46C1?style=flat-square"/>
<img src="https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat-square"/>
<img src="https://img.shields.io/badge/Deploy-Render%20%2B%20Netlify-brightgreen?style=flat-square"/>

<br/><br/>

</div>

---

## 📌 What Is This?

**MediVoice AI** is a production-grade, full-stack healthcare SaaS platform where patients speak or type their symptoms, and an AI specialist doctor responds in real time — streaming token by token via WebSocket, just like talking to a real doctor.

Every consultation produces a structured **SOAP medical report** (Subjective · Objective · Assessment · Plan) that patients can download as PDF, email to themselves, or share via WhatsApp — in any of **9 Indian languages**.

The platform is architected for enterprise use: multi-tenant clinic management, HIPAA-aware audit logging, Stripe subscriptions, full analytics dashboard for healthcare providers, and a **fault-tolerant reliability pipeline** designed to gracefully handle cloud backend cold starts, network switches, and browser multi-tab syncing.

> ⚠️ **Disclaimer**: MediVoice AI is an AI-assisted informational tool. It does not replace professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.

---

## 🎬 Core User Journey

```
Patient speaks or types symptoms
        │
        ▼
AssemblyAI transcribes voice → text in real time
        │
        ▼
Groq llama-3.3-70b streams clinical response via WebSocket
        │
        ├──► Triage Engine scores urgency  (🔴🟠🟡🟢)
        │
        ├──► RAG Knowledge Base enriches diagnosis context
        │
        └──► SOAP Report → PDF / Email / WhatsApp
```

---

## ✨ Feature Overview

<table>
<tr>
<td width="50%">

### 🎙️ Voice Consultation Engine
- Real-time STT via **AssemblyAI**
- **Streaming WebSocket** responses (token-by-token)
- **10-message conversation memory** — full contextual follow-ups
- Graceful fallback to intelligent pre-built responses
- Consultation timer + voice quality & emotion indicators
- **30s WebSocket heartbeat** for mobile session persistence

</td>
<td width="50%">

### 🩺 5 AI Specialist Doctors
| Specialist | Focus |
|---|---|
| 👨‍⚕️ General Physician | Common illness, medications |
| 🦴 Orthopedic | Joints, spine, RICE protocol |
| ❤️ Cardiologist | Heart, BP, cardiovascular |
| 🧠 Neurologist | Headaches, migraines, nerves |
| 👶 Pediatrician | Infant to teen, fever care |

</td>
</tr>
<tr>
<td width="50%">

### 🚨 Smart Triage Engine
```
Score 90–100 → 🔴 Emergency  → Call 108 (ambulance)
Score 70–89  → 🟠 Urgent     → See doctor in 24h
Score 40–69  → 🟡 Soon       → Consult in 48h
Score 0–39   → 🟢 Routine    → Monitor at home
```
- Age risk adjustment (< 2 yrs, > 65 yrs)
- Pre-existing condition detection
- Mental health crisis escalation

</td>
<td width="50%">

### 📋 Medical Reports
- **SOAP format** (clinical standard)
- **PDF export** via jsPDF + html2pdf
- **Email delivery** via Nodemailer (Gmail SMTP)
- **WhatsApp sharing** integration
- Enhanced print-ready report viewer

</td>
</tr>
<tr>
<td width="50%">

### 🏥 Clinic Management (Multi-Tenant)
- Per-clinic doctor + patient management
- Appointment scheduling with calendar UI
- Role-based access control (RBAC)
- Clinic-scoped analytics dashboard

</td>
<td width="50%">

### 🌐 9 Indian Languages
`English` · `हिंदी` · `தமிழ்` · `తెలుగు`
`<ctrl42>ಕನ್ನಡ` · `മലയാളം` · `বাংলা` · `मराठी` · `ગુજરાતી`

Full UI translation — every label, button, message.

</td>
</tr>
</table>

---

## 🛡️ Production Reliability & Resilience Architecture

The platform features an advanced reliability architecture built specifically to handle serverless/free-tier cold starts (e.g. Render spin-downs), poor network connectivity, mobile carrier switching, and browser tab concurrency.

```mermaid
flowchart TD
    A[User opens app] --> B[App renders immediately - Navbar, Header, Chrome]
    B --> C[CacheService loads stored consultations instantly]
    C --> D[apiClient fires background GET request]
    D --> E{Backend Responds in 25s?}
    E -- Yes --> F[Update State & Sync across tabs via BroadcastChannel]
    E -- No / Timeout --> G[Set backendStatus -> 'waking']
    G --> H[Display Non-Blocking ColdStartBanner]
    H --> I[Poll /health/ping every 4s]
    I --> J{Ping Success?}
    J -- Yes --> K[Backend Awake -> Dismiss Banner & Retry Request]
    J -- No 5x --> L[Circuit Breaker Trips -> Show 'Server Unavailable' + Retry Button]
```

### Key Reliability Features

1. **Centralized Resilient HTTP Client (`apiClient.ts`)**:
   - **25-Second Timeout**: Prevents infinite UI hanging during backend cold starts.
   - **Jittered Exponential Backoff Retry**: Automatic 3-attempt retry for `GET` requests (`2s ± rand`, `4s ± rand`, `8s ± rand`) to avoid thundering herd spikes.
   - **Idempotent POST Retries**: `apiClient.postIdempotent()` attaches client-generated `Idempotency-Key` UUIDs so operations like starting consultations can be safely retried without creating duplicates.
   - **Request Deduplication**: In-flight GET requests map identical URLs to a single shared Promise.
   - **Correlation IDs**: Generates and attaches `X-Request-ID` to every HTTP request and WebSocket event for end-to-end tracing.

2. **Abstract Cache Layer & Multi-Tab Synchronization (`cacheService.ts`)**:
   - Abstract storage layer with TTL support and key namespacing.
   - **Multi-Tab Sync**: Uses `BroadcastChannel` (with fallback to browser `storage` events) so when Tab A updates consultation data, Tab B instantly synchronizes without requiring a page refresh.

3. **Stale-While-Revalidate & Non-Blocking App Shell**:
   - Removed all global application-blocking loading gates (`if (ctx.loading)`).
   - Navigation, header, routes, and page shells render **immediately**.
   - `ConsultationContext` displays cached consultations instantly while refreshing from the API asynchronously.

4. **Cold-Start Detection & Recovery (`backendStatus.ts` & `ColdStartBanner.tsx`)**:
   - **State Machine**: Tracks server state (`unknown` → `awake` → `waking` → `unavailable`).
   - **Inline Banner**: Displays a sticky top notification (`🔄 Starting server... Elapsed: 14s`) with a live progress bar without freezing the page.
   - **Circuit Breaker**: Stops polling after 5 consecutive failures and displays an actionable "Retry Connection" control.

5. **Offline Write Queue (`offlineQueue.ts`)**:
   - Failed POST/PUT write actions (e.g. saving consultation notes) are automatically buffered in `CacheService`.
   - Replays queued requests sequentially when network connection restores or when the backend wakes up (using last-write-wins timestamp conflict resolution).

6. **WebSocket Reliability & Heartbeat (`useVoiceSocket.tsx`)**:
   - Gated connection: Waits for `backendStatus === 'awake'` before initiating WebSocket handshakes.
   - **30s Ping/Pong Heartbeat**: Sends heartbeat frames every 30s. Automatically reconnects after 2 missed beats to recover stale mobile sessions after cell-tower switches or device sleep.

7. **Observability & Error Boundaries**:
   - **Structured Logger & Metrics (`logger.ts`)**: Structured JSON event logger tracking performance metrics (`cold_start_avg_duration_ms`, `api_avg_latency_ms`, `cache_hit_rate`, `retry_success_rate`).
   - **Root Error Boundary (`ErrorBoundary.tsx`)**: Wraps the entire app tree to catch React rendering crashes and provide full recovery controls.

---

## 🔒 Production Hardening & Security

| Category | Control | Implementation |
|---|---|---|
| **Security** | Rate Limiting | Global: 100 req/15 min · AI routes: 20 req/15 min · Auth: 10 req/15 min |
| **Security** | Input Validation | Zod schemas on every POST/PUT route request body |
| **Security** | Helmet & CSP | Strict Content-Security-Policy with `wss://` and Clerk domain allowlist |
| **Security** | Auth Middleware | Clerk JWT verification on all protected REST & WebSocket connections |
| **Security** | Idempotency | `Idempotency-Key` header middleware preventing duplicate POST mutations |
| **Reliability** | Env Validation | Zod schema validates `backend/.env` on server boot — fails fast on missing required keys |
| **Reliability** | Error Handling | Centralized Express error handler + `catchAsync()` wrapper |
| **Reliability** | Process Safety | Global `unhandledRejection` and `uncaughtException` process listeners |
| **Performance** | DB Indexing | `consultations.userId`, `consultations.status`, `voiceSessions.consultationId` |
| **Performance** | Redis Cache | Analytics dashboard cached 5 minutes via `ioredis` singleton |
| **Performance** | Response Compression | `compression` middleware enabled on all HTTP responses |

---

## 🛠️ Tech Stack

### Frontend
| Tech | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5 | Build tool |
| Socket.IO Client | 4.x | Real-time voice streaming |
| Clerk React | 5.x | Authentication & User identity |
| Chart.js + React-Chartjs-2 | 4.x | Analytics visualizations |
| jsPDF + html2pdf.js | latest | PDF report generation |
| Lucide React | latest | Icon library |
| React Hot Toast | 2.x | Notifications |
| Axios | 1.x | Resilient HTTP client (`apiClient`) |

### Backend
| Tech | Version | Purpose |
|---|---|---|
| Node.js + Express | 5.x | REST API server |
| TypeScript | 6.x | Type safety |
| Socket.IO | 4.x | WebSocket voice streaming |
| Groq SDK | 1.x | Primary AI (`llama-3.3-70b-versatile`) |
| OpenAI SDK | 6.x | AI fallback (`gpt-3.5-turbo`) |
| AssemblyAI | 4.x | Speech-to-text transcription |
| Drizzle ORM | 0.45 | Type-safe PostgreSQL queries |
| Zod | 4.x | Schema validation (env + routes) |
| Winston | 3.x | Structured production logging |
| Stripe | 22.x | Subscription billing |
| Twilio | 6.x | SMS medication reminders |
| Nodemailer | 8.x | Email report delivery |
| ioredis | 5.x | Redis caching |
| Vitest | latest | Test suite |

### Infrastructure
| Service | Role |
|---|---|
| **Netlify** | Frontend hosting + SPA routing |
| **Render** | Backend Web Service |
| **Neon** | Serverless PostgreSQL |
| **Redis** | Session + analytics cache |
| **Clerk** | Identity + JWT management |
| **Groq Cloud** | Free LLM inference (`llama-3.3-70b`) |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Frontend (React 18 + Vite)                        │
│                                                                         │
│  ColdStartBanner │ apiClient │ cacheService │ offlineQueue │ Logger      │
│  VoiceRecorder │ StreamingChat │ TriageDisplay │ SOAPReport │ i18n     │
│  ClinicDashboard │ Analytics │ AppointmentBooking │ ErrorBoundary      │
└────────────────────┬────────────────────────────────────────────────────┘
                                     │
                 HTTP (Axios + Retries) + WebSocket (Socket.IO + Heartbeat)
                                     │
┌────────────────────▼────────────────────────────────────────────────────┐
│                    Backend (Express 5 + Socket.IO)                      │
│                                                                         │
│  ┌─────────────────┐  ┌──────────┐  ┌─────────┐  ┌───────────────────┐  │
│  │   voiceSocket   │  │  Triage  │  │   RAG   │  │ Idempotency & Req │  │
│  │  (/health/ping) │  │ Service  │  │   KB    │  │ Correlation Mware │  │
│  └─────────────────┘  └──────────┘  └─────────┘  └───────────────────┘  │
│                                                                         │
│  Rate Limiter → Zod Validator → Clerk Auth → Route Handler              │
│                        ↓                                                │
│              Centralized Error Handler                                  │
│              Winston Structured Logger                                  │
└────────┬───────────────────────────────────────────────┬────────────────┘
         │                                               │
┌────────▼──────────────┐                 ┌──────────────▼──────────────┐
│   AI & Comms APIs     │                 │         Data Layer          │
│                       │                 │                             │
│  Groq llama-3.3-70b   │                 │  Neon PostgreSQL            │
│  OpenAI gpt-3.5       │                 │  Drizzle ORM                │
│  AssemblyAI STT       │                 │  Redis Cache (ioredis)      │
│  Twilio SMS           │                 │  Clerk Identity             │
│  Nodemailer Email     │                 │  Stripe Billing             │
└───────────────────────┘                 └─────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Neon](https://neon.tech) PostgreSQL database (free tier works)
- [Clerk](https://clerk.com) project (free tier works)
- [Groq](https://console.groq.com) API key (free)

### 1. Clone the Repository
```bash
git clone https://github.com/vaibhav-aiml/ai-medical-voice-agent.git
cd ai-medical-voice-agent
```

### 2. Set Up the Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your values — see Environment Variables section below
npm run db:push   # Push schema to Neon PostgreSQL
npm run dev       # Starts at http://localhost:3000
```

Verify backend health: `http://localhost:3000/health/ping`

### 3. Set Up the Frontend
```bash
cd ../frontend
npm install
cp .env.example .env.development
# Add VITE_BACKEND_URL and VITE_CLERK_PUBLISHABLE_KEY
npm run dev       # Starts at http://localhost:5173
```

### 4. Run the Test Suite
```bash
cd backend
npm test          # All Vitest tests should pass
```

---

## 🔑 Environment Variables

### Backend — `backend/.env`

```env
# ── Server ──────────────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ── Database (Required) ─────────────────────────────────────
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# ── Authentication (Required) ───────────────────────────────
CLERK_SECRET_KEY=sk_test_...

# ── AI Providers ────────────────────────────────────────────
GROQ_API_KEY=gsk_...              # Primary — FREE at console.groq.com
OPENAI_API_KEY=sk-...             # Fallback (optional)

# ── Speech-to-Text ──────────────────────────────────────────
ASSEMBLYAI_API_KEY=...            # Optional — enables real voice STT

# ── Cache ───────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379  # Optional — analytics caching

# ── Email (Optional) ────────────────────────────────────────
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password

# ── SMS Reminders (Optional) ────────────────────────────────
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# ── Payments (Optional) ─────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...

# ── CORS & Keep-Awake ───────────────────────────────────────
FRONTEND_URL=http://localhost:5173
KEEP_AWAKE_URL=https://ai-medical-voice-agent-ygc5.onrender.com/health
KEEP_AWAKE_INTERVAL=840000
GIT_COMMIT=dev
```

**Required to start**: `DATABASE_URL`, `CLERK_SECRET_KEY`, `GROQ_API_KEY`  
All other variables are optional — the server starts and degrades gracefully without them.

### Frontend — `frontend/.env.development`
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 📁 Project Structure

```
ai-medical-voice-agent/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts                  # Zod env validation — crashes fast on missing vars
│   │   │   ├── database.ts             # Neon + Drizzle client
│   │   │   └── redis.ts                # ioredis singleton
│   │   │
│   │   ├── db/schema/
│   │   │   └── index.ts                # Drizzle table definitions + indexes
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts                 # Clerk JWT verification
│   │   │   ├── clinicMiddleware.ts     # Multi-tenant clinic scoping
│   │   │   ├── errorHandler.ts         # Centralized Express error handler
│   │   │   ├── rateLimiter.ts          # Global + per-route rate limits
│   │   │   └── validate.ts             # Zod validation middleware factory
│   │   │
│   │   ├── routes/                     # Domain route handlers
│   │   │
│   │   ├── services/                   # Functional services
│   │   │   ├── voice.service.ts        # Groq → OpenAI fallback chain
│   │   │   ├── triageService.ts        # Urgency scoring engine
│   │   │   ├── ragKnowledgeBase.ts     # Medical knowledge retrieval
│   │   │   ├── enhancedSymptomChecker.ts
│   │   │   ├── analyticsService.ts
│   │   │   ├── clinicService.ts
│   │   │   ├── email.service.ts
│   │   │   ├── reminderService.ts
│   │   │   ├── reportGenerator.ts
│   │   │   └── conversationMemory.ts
│   │   │
│   │   ├── sockets/
│   │   │   ├── handlers/               # Modular WS handlers
│   │   │   ├── helpers/
│   │   │   │   └── verification.ts     # Auto-creating user & consultation verifier
│   │   │   └── voiceSocket.ts          # Streaming + non-streaming WS handlers
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts               # Winston — JSON prod / pretty dev
│   │   │   ├── AppError.ts             # Custom error class
│   │   │   └── catchAsync.ts           # Async route wrapper
│   │   │
│   │   ├── validators/
│   │   └── index.ts                    # App entry — routes, CORS, Socket.IO, /health/ping
│   │
│   ├── tests/                          # Vitest test suite
│   ├── render.yaml                     # Render deployment config
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── shared/
    │   │   │   ├── ColdStartBanner.tsx # Non-blocking cold start indicator
    │   │   │   ├── ErrorBoundary.tsx   # Root React error recovery boundary
    │   │   │   ├── Header.tsx
    │   │   │   └── Footer.tsx
    │   │   └── ...                     # Feature components
    │   │
    │   ├── context/
    │   │   ├── ConsultationContext.tsx # Non-blocking cache-first consultation state
    │   │   └── ...
    │   │
    │   ├── hooks/
    │   │   ├── useVoiceSocket.tsx      # Gated WS hook with 30s heartbeat
    │   │   ├── useAuthInterceptor.tsx  # Clerk token attachment to apiClient
    │   │   └── useLanguage.tsx
    │   │
    │   ├── services/
    │   │   ├── apiClient.ts            # Resilient HTTP client (25s timeout, retries, dedup)
    │   │   ├── cacheService.ts         # Abstract cache with BroadcastChannel tab sync
    │   │   ├── backendStatus.ts        # Cold-start state tracker & circuit breaker
    │   │   ├── offlineQueue.ts         # Offline write buffer & auto-replay
    │   │   ├── logger.ts               # Structured logger & aggregate metrics
    │   │   └── consultationService.ts  # Stale-while-revalidate consultation service
    │   │
    │   ├── pages/                      # Page components
    │   ├── translations/               # 9 Indian language translation files
    │   └── App.tsx                     # Main layout & non-blocking App shell
    │
    ├── netlify.toml                    # SPA redirect + build config
    └── package.json
```

---

## 📡 API Reference

### REST Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health/ping` | — | Lightweight ping endpoint returning `apiVersion`, `uptime`, `build` |
| `GET` | `/health` | — | Full health check + database & service status |
| `POST` | `/api/consultations/start` | ✅ | Start a new consultation (supports `Idempotency-Key`) |
| `POST` | `/api/consultations/save` | ✅ | Save/complete a consultation session |
| `GET` | `/api/consultations/user/:userId` | ✅ | Fetch user consultations (deduplicated) |
| `GET` | `/api/consultations/:id` | ✅ | Get single consultation session details |
| `DELETE` | `/api/consultations/:id` | ✅ | Delete consultation record |
| `POST` | `/api/voice` | ✅ | Process voice audio buffer |
| `GET` | `/api/voice/session/:id` | ✅ | Fetch voice session transcript |
| `POST` | `/api/triage/analyze` | ✅ | Analyze symptoms → urgency score |
| `GET` | `/api/triage/guidelines` | — | Triage reference table |
| `POST` | `/api/rag/search` | ✅ | Search medical knowledge base |
| `GET` | `/api/reports` | ✅ | Fetch generated medical reports |
| `POST` | `/api/email/send-report` | ✅ | Email SOAP report to patient |
| `POST` | `/api/audit/log` | ✅ | Log HIPAA audit event |
| `GET` | `/api/audit/logs` | ✅ | Retrieve immutable audit trail |
| `POST` | `/api/analytics/dashboard` | ✅ | Clinic dashboard metrics |
| `POST` | `/api/analytics/trends` | ✅ | 30-day consultation trends |
| `POST` | `/api/clinic/create` | ✅ | Create a clinic tenant |
| `POST` | `/api/clinic/:id/appointments` | ✅ | Book appointment |
| `POST` | `/api/reminder` | ✅ | Set medication reminder (SMS) |
| `POST` | `/api/enhanced-symptom/check` | ✅ | Differential diagnosis engine |

### WebSocket Events (Socket.IO)

| Event | Direction | Description |
|---|---|---|
| `join-consultation` | Client → Server | Join consultation room by ID |
| `get-ai-response-stream` | Client → Server | Request streaming AI response with history |
| `ai-response-chunk` | Server → Client | Streaming token chunk (or full fallback) |
| `get-ai-response` | Client → Server | Request non-streaming response |
| `ai-response` | Server → Client | Complete AI response |
| `ai-response-error` | Server → Client | Error with fallback triggered |
| `ping-heartbeat` | Client → Server | 30s heartbeat frame |
| `pong-heartbeat` | Server → Client | Heartbeat acknowledgement |

---

## 🔒 HIPAA Compliance

| Control | Implementation |
|---|---|
| **Encryption at Rest** | AES-256 on all stored PHI |
| **Encryption in Transit** | TLS 1.3 for all REST & WebSocket communications |
| **Authentication** | Clerk with MFA & cryptographically-verified JWTs |
| **Audit Logging** | Immutable cryptographically-signed audit trail |
| **Log Retention** | 7-year retention policy |
| **Access Control** | Role-based access (RBAC) scoped per clinic tenant |
| **Session Timeout** | Auto-logout & session invalidation |
| **Data Minimization** | Automatic PHI redaction via `phiService` before sending data to LLMs |

Full documentation: [`README-HIPAA.md`](./README-HIPAA.md)

---

## 🚢 Deployment

### Backend → Render
`render.yaml` is pre-configured. Connect the GitHub repo to Render, set env vars in the dashboard — every push to `main` auto-deploys.

```bash
cd backend
npm run build   # TypeScript → dist/
npm start       # Runs dist/index.js
```

### Frontend → Netlify
`netlify.toml` handles SPA routing redirect (`/*` -> `/index.html`).

```bash
cd frontend
npm run build   # Outputs to dist/
```

Set `VITE_BACKEND_URL` and `VITE_CLERK_PUBLISHABLE_KEY` in Netlify environment settings.

---

## 🗺️ Roadmap

- [ ] **Vector DB for RAG** — `pgvector` on Neon for scalable medical retrieval
- [ ] **Video Consultation** — Daily.co / Zoom Video SDK integration
- [ ] **Prescription Generation** — Digital signature + pharmacy integration
- [ ] **EHR Integration** — Native FHIR API for hospital systems
- [ ] **Mobile App** — React Native for iOS & Android
- [ ] **Doctor Portal** — Dedicated clinician interface with patient queue management

---

## 👨‍💻 Author

**Vaibhav** — Full-stack developer building AI applications for healthcare.

[![GitHub](https://img.shields.io/badge/GitHub-vaibhav--aiml-181717?style=flat-square&logo=github)](https://github.com/vaibhav-aiml)

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

```bash
git checkout -b feature/your-feature
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

---

## 📄 License

ISC License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with ❤️ for better healthcare access across India**

*© 2026 MediVoice AI. All rights reserved.*

<br/>

⭐ **If this project helped you, please consider starring the repo!** ⭐

</div>
