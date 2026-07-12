<div align="center">

<br/>

<img src="https://img.shields.io/badge/-%F0%9F%A9%BA%20MediVoice%20AI-0a1628?style=for-the-badge&logoColor=white" height="42"/>

<h1>AI Medical Voice Consultation Platform</h1>

<p><strong>Talk to an AI specialist doctor. Get real clinical insights. Download your report.</strong><br/>
Built for the Indian healthcare market — 9 languages, 5 specialist personas, HIPAA-aware.</p>

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20App-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://majestic-speculoos-f73a91.netlify.app)
[![Backend API](https://img.shields.io/badge/⚡%20Backend%20API-Health%20Check-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ai-medical-voice-agent-ygc5.onrender.com/health)

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

The platform is architected for enterprise use: multi-tenant clinic management, HIPAA-aware audit logging, Stripe subscriptions, and a full analytics dashboard for healthcare providers.

> ⚠️ **Disclaimer**: MediVoice AI is an AI-assisted informational tool. It does not replace professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.

---

## 🎬 Core User Journey

```
Patient speaks symptoms
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
- Consultation timer + voice quality indicator

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
`ಕನ್ನಡ` · `മലയാളം` · `বাংলা` · `मराठी` · `ગુજરાતી`

Full UI translation — every label, button, message.

</td>
</tr>
</table>

---

## 🔐 Production Hardening

This project was refactored from a working prototype into a production-ready system. Here is what changed:

### Security
| What | How |
|---|---|
| Rate limiting | Global: 100 req/15 min · AI routes: 20 req/15 min · Auth: 10 req/15 min |
| Input validation | Zod schemas on every POST/PUT endpoint body |
| Helmet CSP | Strict Content-Security-Policy with `wss://` and Clerk domain allowlist |
| Auth middleware | Clerk JWT verification on all protected routes |
| Secret hygiene | Real credentials removed from git history, `.env.example` uses placeholders only |

### Reliability
| What | How |
|---|---|
| Env validation | Zod schema crashes server fast on missing required vars before any route loads |
| Error handling | Centralized Express error handler + `catchAsync()` wrapper |
| Unhandled rejections | Global `process.on('unhandledRejection')` + `uncaughtException` handlers |
| DB persistence | Consultations wired to Neon PostgreSQL — replaced localStorage write path |
| Write-through cache | localStorage kept as offline fallback; Postgres is source of truth |

### Performance
| What | How |
|---|---|
| DB indexes | `consultations.userId`, `consultations.status`, `voiceSessions.consultationId` |
| Redis caching | Analytics dashboard cached 5 minutes via ioredis singleton |
| Compression | `compression` middleware on all responses |
| Connection pooling | Neon serverless pool configured |

### Code Quality
| What | How |
|---|---|
| Class → Function | All 10 backend service classes converted to functional modules |
| Structured logging | Winston replaces all `console.log` — JSON in prod, pretty in dev |
| Dead code removed | `index-working.ts`, `App-with-clerk.tsx`, unused imports deleted |
| Test suite | Vitest unit + integration + WebSocket tests — 100% pass rate |

---

## 🛠️ Tech Stack

### Frontend
| Tech | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5 | Build tool |
| Socket.IO Client | 4.x | Real-time voice streaming |
| Clerk React | 5.x | Authentication |
| Chart.js + React-Chartjs-2 | 4.x | Analytics visualizations |
| jsPDF + html2pdf.js | latest | PDF report generation |
| Lucide React | latest | Icon library |
| React Hot Toast | 2.x | Notifications |
| Axios | 1.x | HTTP client |

### Backend
| Tech | Version | Purpose |
|---|---|---|
| Node.js + Express | 5.x | REST API server |
| TypeScript | 6.x | Type safety |
| Socket.IO | 4.x | WebSocket voice streaming |
| Groq SDK | 1.x | Primary AI (llama-3.3-70b-versatile) |
| OpenAI SDK | 6.x | AI fallback (gpt-3.5-turbo) |
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
| **Groq Cloud** | Free LLM inference (llama-3.3-70b) |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Frontend (React 18 + Vite)                  │
│                                                              │
│  VoiceRecorder │ StreamingChat │ TriageDisplay │ SOAPReport  │
│  ClinicDashboard │ Analytics │ AppointmentBooking │ i18n     │
└──────────────────────────┬───────────────────────────────────┘
                           │
              HTTP (Axios) + WebSocket (Socket.IO)
                           │
┌──────────────────────────▼───────────────────────────────────┐
│              Backend (Express 5 + Socket.IO)                 │
│                                                              │
│  ┌─────────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  │
│  │ voiceSocket │  │  Triage  │  │   RAG   │  │Analytics │  │
│  │  (stream)   │  │ Service  │  │   KB    │  │ Service  │  │
│  └─────────────┘  └──────────┘  └─────────┘  └──────────┘  │
│                                                              │
│  Rate Limiter → Zod Validator → Clerk Auth → Route Handler   │
│                        ↓                                     │
│              Centralized Error Handler                       │
│              Winston Structured Logger                       │
└──────┬─────────────────────────────────────┬────────────────┘
       │                                     │
┌──────▼──────────────┐        ┌─────────────▼──────────────┐
│   AI & Comms APIs   │        │        Data Layer          │
│                     │        │                            │
│  Groq llama-3.3-70b │        │  Neon PostgreSQL           │
│  OpenAI gpt-3.5     │        │  Drizzle ORM               │
│  AssemblyAI STT     │        │  Redis Cache (ioredis)     │
│  Twilio SMS         │        │  Clerk Identity            │
│  Nodemailer Email   │        │  Stripe Billing            │
└─────────────────────┘        └────────────────────────────┘
```

### Database Schema
```
users ──────────────────────── consultations ── voiceSessions
  │   clerkId, email, tier          │               transcript[]
  │   subscriptionEndsAt            │               aiResponses[]
  │                                 │
  └── subscriptions          medicalReports
        stripeSubscriptionId     symptoms, diagnosis
        plan, status             recommendations[]
        currentPeriodEnd         followUpDate
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Neon](https://neon.tech) PostgreSQL database (free tier works)
- [Clerk](https://clerk.com) project (free tier works)
- [Groq](https://console.groq.com) API key (completely free)

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

Verify it's running: `http://localhost:3000/health`

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

# ── CORS ────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
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
│   │   ├── routes/                     # 15 domain route files
│   │   │
│   │   ├── services/                   # All functional modules (zero classes)
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
│   │   │   └── voiceSocket.ts          # Streaming + non-streaming WS handlers
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.ts               # Winston — JSON prod / pretty dev
│   │   │   ├── AppError.ts             # Custom error class with statusCode
│   │   │   └── catchAsync.ts           # Async route wrapper
│   │   │
│   │   ├── validators/
│   │   │   ├── consultation.validator.ts
│   │   │   ├── triage.validator.ts
│   │   │   └── voice.validator.ts
│   │   │
│   │   └── index.ts                    # App entry — routes, CORS, Socket.IO
│   │
│   ├── tests/                          # Vitest test suite
│   ├── render.yaml                     # Render deployment config
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/                 # 40+ React functional components
    │   ├── context/                    # Language, Subscription, Theme providers
    │   ├── hooks/                      # useConsultation, useVoiceSocket, useLanguage
    │   ├── pages/                      # Full page views
    │   ├── services/                   # Axios client + consultationService
    │   └── translations/               # en / hi / ta / te / kn / ml / bn / mr / gu
    │
    ├── netlify.toml                    # SPA redirect + build config
    └── package.json
```

---

## 📡 API Reference

### REST Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Health check + service status |
| `POST` | `/api/consultations` | ✅ | Start a new consultation |
| `GET` | `/api/consultations` | ✅ | List user consultations |
| `POST` | `/api/voice` | ✅ | Process voice audio buffer |
| `POST` | `/api/triage/analyze` | ✅ | Analyze symptoms → urgency score |
| `GET` | `/api/triage/guidelines` | — | Triage reference table |
| `POST` | `/api/rag/search` | ✅ | Search medical knowledge base |
| `GET` | `/api/reports` | ✅ | Fetch generated reports |
| `POST` | `/api/email/send-report` | ✅ | Email report to patient |
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
| `join-consultation` | Client → Server | Join a consultation room by ID |
| `get-ai-response-stream` | Client → Server | Request streaming AI response with history |
| `ai-response-chunk` | Server → Client | Streaming token chunk (or full fallback) |
| `get-ai-response` | Client → Server | Request non-streaming response |
| `ai-response` | Server → Client | Complete AI response |
| `ai-response-error` | Server → Client | Error with fallback triggered |

---

## 🔒 HIPAA Compliance

| Control | Implementation |
|---|---|
| **Encryption at Rest** | AES-256 on all stored PHI |
| **Encryption in Transit** | TLS 1.3 for all API communications |
| **Authentication** | Clerk with MFA support |
| **Audit Logging** | Immutable cryptographically-signed Winston logs |
| **Log Retention** | 7-year retention policy |
| **Access Control** | Role-based (RBAC) scoped per clinic tenant |
| **Session Timeout** | 15-minute auto-logout |
| **Breach Detection** | 60-hour SLA + automated HHS notification |
| **Data Minimization** | Only necessary PHI collected per consultation |
| **Backup / Recovery** | RTO: 4 hours · RPO: 15 minutes |

Full documentation: [`README-HIPAA.md`](./README-HIPAA.md)

---

## 🚢 Deployment

### Backend → Render
`render.yaml` is pre-configured. Connect the GitHub repo to Render, set all env vars in the dashboard — every push to `main` auto-deploys.

```bash
cd backend
npm run build   # TypeScript → dist/
npm start       # Runs dist/index.js
```

### Frontend → Netlify
`netlify.toml` handles the SPA redirect (without it, page refresh on any route returns 404).

```bash
cd frontend
npm run build   # Outputs to dist/
```

Set `VITE_BACKEND_URL` and `VITE_CLERK_PUBLISHABLE_KEY` in Netlify environment settings.

---

## 🗺️ Roadmap

- [ ] **Vector DB for RAG** — pgvector on Neon or Pinecone for scalable knowledge retrieval
- [ ] **Video Consultation** — Daily.co / Zoom Video SDK (SDK already installed)
- [ ] **Prescription Generation** — digital signature + pharmacy integration
- [ ] **EHR Integration** — FHIR API for hospital system connectivity
- [ ] **Mobile App** — React Native for iOS + Android
- [ ] **Doctor Portal** — dedicated interface with patient queue management
- [ ] **Wearable Integration** — real-time heart rate + SpO₂ from smartwatches

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
# Open a Pull Request against main
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
