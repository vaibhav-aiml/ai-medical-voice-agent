<div align="center">

<img src="https://img.shields.io/badge/MediVoice-AI-1e5fa8?style=for-the-badge&logo=stethoscope&logoColor=white" alt="MediVoice AI" height="40"/>

# MediVoice AI — AI Medical Voice Consultation Platform

**Enterprise-grade AI-powered voice consultation platform for healthcare.**  
Real-time voice interaction with AI specialist doctors, smart triage, SOAP report generation, and HIPAA-aware audit logging.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?style=flat-square&logo=netlify)](https://majestic-speculoos-f73a91.netlify.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://ai-medical-voice-agent-ygc5.onrender.com/health)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#️-architecture)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [HIPAA Compliance](#-hipaa-compliance)
- [Deployment](#-deployment)
- [Roadmap](#️-roadmap)
- [Author](#-author)
- [Disclaimer](#️-disclaimer)

---

## 🌟 Overview

**MediVoice AI** is a full-stack healthcare platform that lets patients consult with AI-powered specialist doctors through natural voice or text. Built for the Indian healthcare market, it supports **9 regional languages** and delivers clinical-grade outputs including urgency triage, differential diagnosis, and downloadable SOAP medical reports.

> ⚠️ **This is an AI-assisted informational tool. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.**

---

## ✨ Features

### 🎙️ Voice Consultation Engine
- Real-time voice input with **AssemblyAI** speech-to-text transcription
- **WebSocket streaming** (Socket.IO) delivers AI responses token-by-token for a natural experience
- Full **conversation memory** — the AI remembers the last 10 message exchanges for contextual follow-ups
- Graceful fallback to intelligent pre-built responses when API keys are unavailable

### 🩺 AI Specialist Doctors
Five distinct specialist personas, each with tailored clinical system prompts:

| Specialist | Focus Area |
|---|---|
| 👨‍⚕️ General Physician | Common illnesses, general health, medication guidance |
| 🦴 Orthopedic Specialist | Bones, joints, muscles, spine, RICE protocol |
| ❤️ Cardiologist | Heart health, blood pressure, cardiovascular risk |
| 🧠 Neurologist | Headaches, migraines, nerve pain, dizziness |
| 👶 Pediatrician | Infant to adolescent care, fever management |

### 🚨 Smart Triage Engine
Keyword-based urgency scoring system with 4 levels:

| Color | Level | Action |
|---|---|---|
| 🔴 Red | Emergency Immediate | Call ambulance (108) |
| 🟠 Orange | Consult within 24h | Visit urgent care |
| 🟡 Yellow | Consult within 48h | Book appointment |
| 🟢 Green | Routine | Monitor at home |

- Age-based risk adjustment (infants < 2 yrs, seniors > 65 yrs)
- Pre-existing condition detection (diabetes, heart disease, asthma, etc.)
- Mental health crisis detection with appropriate escalation

### 📋 Medical Reports
- **SOAP format** reports (Subjective, Objective, Assessment, Plan)
- **PDF export** via jsPDF + html2pdf
- **Email delivery** via Nodemailer
- **WhatsApp sharing** integration
- Enhanced report viewer with print support

### 🏥 Clinic Management
- Multi-tenant clinic dashboard
- Doctor and patient management
- Appointment scheduling with calendar view
- Role-based access control

### 📊 Analytics Dashboard
- Patient volume trends (30-day chart)
- Diagnosis accuracy metrics
- Voice interaction quality metrics (clarity, tone, speed, score)
- Common symptom frequency analysis
- Exportable consultation data

### 💊 Medication Reminder
- Set and manage medication schedules
- SMS notifications via **Twilio**
- Email reminders via Nodemailer

### 🌐 Multilingual Support (9 Languages)
Full UI translation across all major Indian languages:

`English` · `हिंदी` · `தமிழ்` · `తెలుగు` · `ಕನ್ನಡ` · `മലയാളം` · `বাংলা` · `मराठी` · `ગુજરાતી`

### 🔐 Security & Compliance
- **HIPAA-aware** architecture with immutable audit logs
- **Clerk** authentication with JWT verification
- **AES-256** encryption at rest, **TLS 1.3** in transit
- Role-based access control (RBAC)
- Cryptographically signed audit trail with 7-year retention policy
- Breach detection and automated notification system

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Socket.IO Client | Real-time voice streaming |
| Clerk React | Authentication |
| Chart.js + React-Chartjs-2 | Analytics visualizations |
| jsPDF / html2pdf.js | PDF report generation |
| Lucide React | Icon library |
| React Hot Toast | Notifications |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | API server |
| TypeScript | Type safety |
| Socket.IO | WebSocket server for voice streaming |
| Groq SDK (llama-3.3-70b-versatile) | Primary AI — free tier |
| OpenAI (gpt-3.5-turbo) | AI fallback |
| AssemblyAI | Speech-to-text transcription |
| Drizzle ORM | Type-safe database ORM |
| Neon PostgreSQL | Serverless database |
| Clerk SDK | Auth middleware |
| Stripe | Subscription billing |
| Twilio | SMS medication reminders |
| Nodemailer | Email reports |
| PDFKit | Server-side PDF generation |
| Winston | Structured logging |
| Helmet + CORS | Security middleware |

### Infrastructure
| Service | Role |
|---|---|
| Netlify | Frontend hosting |
| Render | Backend hosting |
| Neon | Serverless PostgreSQL |
| Redis (ioredis) | Session cache |
| Clerk | Identity management |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                │
│  Voice Recorder │ Chat UI │ Triage │ Reports │ Dashboard │
└─────────────────────┬───────────────────────────────────┘
                      │  HTTP + WebSocket (Socket.IO)
┌─────────────────────▼───────────────────────────────────┐
│               Backend (Express + Socket.IO)              │
│  Voice Service │ Triage │ RAG │ Auth │ Analytics │ Clinic│
└────┬──────────────────────────────────────────┬──────────┘
     │                                          │
┌────▼──────────────────┐         ┌─────────────▼──────────┐
│    AI & External APIs  │         │      Data Layer         │
│  Groq (llama-3.3-70b) │         │  Neon PostgreSQL        │
│  OpenAI (gpt-3.5)     │         │  Drizzle ORM            │
│  AssemblyAI (STT)     │         │  Redis (cache)          │
│  Twilio (SMS)         │         │  Clerk (auth)           │
│  Nodemailer (Email)   │         │  Stripe (billing)       │
└───────────────────────┘         └────────────────────────┘
```

**Database Schema:**
- `users` — Clerk-linked user profiles with subscription tier
- `consultations` — Per-consultation records with specialist type and status
- `voice_sessions` — Transcript + AI response JSON per session
- `medical_reports` — SOAP diagnoses, recommendations, medications, follow-up dates
- `subscriptions` — Stripe subscription lifecycle management

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Neon](https://neon.tech) PostgreSQL database
- A [Clerk](https://clerk.com) project for auth
- A [Groq](https://console.groq.com) API key (free)

### 1. Clone the Repository

```bash
git clone https://github.com/vaibhav-aiml/ai-medical-voice-agent.git
cd ai-medical-voice-agent
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

```bash
cp .env.example .env
# Edit .env with your actual keys (see Environment Variables section)
```

### 4. Set Up the Database

```bash
npm run db:generate   # Generate Drizzle migrations
npm run db:push       # Push schema to Neon PostgreSQL
```

### 5. Start the Backend

```bash
npm run dev           # Development with nodemon
# or
npm run build && npm start  # Production
```

The backend will start on `http://localhost:3000`. Check `http://localhost:3000/health` to confirm it's running.

### 6. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 7. Configure Frontend Environment

```bash
cp .env.example .env.development
# Edit with your Clerk publishable key and backend URL
```

### 8. Start the Frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=3000
NODE_ENV=development

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# Authentication
CLERK_SECRET_KEY=sk_test_...

# AI Providers
GROQ_API_KEY=gsk_...              # Primary — get free at console.groq.com
OPENAI_API_KEY=sk-...             # Fallback (optional)

# Speech-to-Text
ASSEMBLYAI_API_KEY=...

# Payments
STRIPE_SECRET_KEY=sk_test_...

# Cache
REDIS_URL=redis://localhost:6379

# Notifications
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env.development`)

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 📁 Project Structure

```
ai-medical-voice-agent/
├── backend/
│   ├── src/
│   │   ├── index.ts                    # Express app + all routes + Socket.IO setup
│   │   ├── config/
│   │   │   └── database.ts             # Neon DB connection via Drizzle
│   │   ├── db/schema/
│   │   │   └── index.ts                # Drizzle table definitions
│   │   ├── middleware/
│   │   │   ├── auth.ts                 # Clerk JWT middleware
│   │   │   └── clinicMiddleware.ts     # Clinic tenant middleware
│   │   ├── routes/
│   │   │   ├── consultation.routes.ts  # Consultation CRUD
│   │   │   ├── voice.routes.ts         # Voice processing endpoints
│   │   │   ├── report.routes.ts        # Report generation
│   │   │   ├── email.routes.ts         # Email delivery
│   │   │   ├── triage.routes.ts        # Triage analysis
│   │   │   ├── rag.routes.ts           # RAG knowledge search
│   │   │   ├── analytics.routes.ts     # Clinic analytics
│   │   │   ├── clinic.routes.ts        # Multi-tenant clinic management
│   │   │   ├── reminder.routes.ts      # Medication reminders
│   │   │   ├── audit.ts                # HIPAA audit logging
│   │   │   └── hipaa.ts                # HIPAA compliance endpoints
│   │   ├── services/
│   │   │   ├── voice.service.ts        # Groq/OpenAI + AssemblyAI integration
│   │   │   ├── triageService.ts        # Urgency scoring engine
│   │   │   ├── ragKnowledgeBase.ts     # Medical knowledge retrieval
│   │   │   ├── enhancedSymptomChecker.ts # Differential diagnosis engine
│   │   │   ├── analyticsService.ts     # Dashboard metrics
│   │   │   ├── clinicService.ts        # Clinic management logic
│   │   │   ├── email.service.ts        # Nodemailer integration
│   │   │   ├── reminderService.ts      # Medication reminder scheduler
│   │   │   ├── reportGenerator.ts      # SOAP report builder
│   │   │   └── conversationMemory.ts   # Session context management
│   │   └── sockets/
│   │       └── voiceSocket.ts          # Streaming WebSocket handlers
│   ├── drizzle.config.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                     # Main app shell + routing
│   │   ├── components/
│   │   │   ├── VoiceRecorder.tsx       # Microphone + STT
│   │   │   ├── ChatMessages.tsx        # Streaming chat display
│   │   │   ├── SpecialistSelector.tsx  # Doctor persona picker
│   │   │   ├── EnhancedDashboard.tsx   # Patient dashboard
│   │   │   ├── ClinicDashboard.tsx     # Clinic management UI
│   │   │   ├── DoctorAnalyticsDashboard.tsx
│   │   │   ├── ConsultationHistory.tsx # Past consultation table
│   │   │   ├── EnhancedSymptomChecker.tsx
│   │   │   ├── TriageDisplay.tsx       # Urgency result display
│   │   │   ├── MedicalReportModal.tsx  # Report viewer
│   │   │   ├── EnhancedReportViewer.tsx
│   │   │   ├── AppointmentBooking.tsx  # Calendar scheduling
│   │   │   ├── MedicationReminder.tsx  # Reminder manager
│   │   │   ├── PricingPlans.tsx        # Subscription tiers
│   │   │   └── Header.tsx / Footer.tsx
│   │   ├── pages/
│   │   │   ├── VoiceConsultation.tsx   # Main consultation page
│   │   │   ├── HIPAACompliance.tsx
│   │   │   ├── AboutUs.tsx / ContactUs.tsx
│   │   │   └── PrivacyPolicy.tsx / TermsConditions.tsx
│   │   ├── context/
│   │   │   ├── LanguageContext.tsx     # i18n language provider
│   │   │   ├── SubscriptionContext.tsx # Plan limits + enforcement
│   │   │   └── ThemeContext.tsx
│   │   ├── services/
│   │   │   ├── api.ts                  # Axios API client
│   │   │   ├── hipaaCompliance.ts      # Frontend compliance checks
│   │   │   ├── auditLogger.ts          # Client-side audit events
│   │   │   └── safetyGuardrail.ts      # Crisis detection
│   │   └── translations/
│   │       ├── en.json / hi.json / ta.json / te.json
│   │       ├── kn.json / ml.json / bn.json
│   │       └── mr.json / gu.json
│   └── package.json
│
└── README-HIPAA.md
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check + service status |
| `POST` | `/api/consultations` | Start a new consultation |
| `GET` | `/api/consultations` | List consultations |
| `POST` | `/api/voice` | Process voice audio |
| `POST` | `/api/triage/analyze` | Analyze symptoms for urgency |
| `GET` | `/api/triage/guidelines` | Triage reference guidelines |
| `POST` | `/api/rag/search` | Search medical knowledge base |
| `POST` | `/api/rag/enhance` | RAG-enhanced consultation |
| `GET` | `/api/reports` | Fetch medical reports |
| `POST` | `/api/email/send-report` | Email report to patient |
| `POST` | `/api/audit/log` | Log HIPAA audit event |
| `GET` | `/api/audit/logs` | Retrieve audit trail |
| `POST` | `/api/hipaa/log` | Log compliance event |
| `POST` | `/api/analytics/dashboard` | Get clinic dashboard data |
| `POST` | `/api/analytics/trends` | Consultation trend data |
| `POST` | `/api/clinic/create` | Create a clinic |
| `POST` | `/api/clinic/:id/doctors` | Add doctor to clinic |
| `POST` | `/api/clinic/:id/appointments` | Book appointment |
| `POST` | `/api/reminder` | Set medication reminder |
| `POST` | `/api/enhanced-symptom/check` | Enhanced symptom check + differential |

### WebSocket Events (Socket.IO)

| Event | Direction | Description |
|---|---|---|
| `join-consultation` | Client → Server | Join a consultation room |
| `get-ai-response-stream` | Client → Server | Request streaming AI response |
| `ai-response-chunk` | Server → Client | Streaming response token |
| `get-ai-response` | Client → Server | Request non-streaming response |
| `ai-response` | Server → Client | Complete AI response |
| `ai-response-error` | Server → Client | Error event |

---

## 🔒 HIPAA Compliance

MediVoice AI is designed with HIPAA-awareness for US healthcare applications.

| Control | Implementation |
|---|---|
| Encryption at Rest | AES-256 on all stored PHI |
| Encryption in Transit | TLS 1.3 for all API calls |
| Authentication | Clerk — MFA supported |
| Audit Logging | Immutable cryptographically-signed logs |
| Log Retention | 7-year retention policy |
| Access Control | Role-based (RBAC) per clinic |
| Session Timeout | 15 minutes auto-logout |
| Breach Detection | 60-hour SLA with automated HHS notification |
| Data Minimization | Only necessary PHI collected |
| Backup / Recovery | RTO: 4 hours · RPO: 15 minutes |

See [`README-HIPAA.md`](./README-HIPAA.md) for the full compliance documentation.

---

## 🚢 Deployment

### Frontend → Netlify

```bash
cd frontend
npm run build
# Deploy the dist/ folder to Netlify
# Set VITE_BACKEND_URL and VITE_CLERK_PUBLISHABLE_KEY in Netlify env vars
```

### Backend → Render

```bash
cd backend
npm run build
# Deploy as a Web Service on Render
# Set all backend env vars in the Render dashboard
# Build command: npm install && npm run build
# Start command: npm start
```

### Database → Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Run `npm run db:push` to apply the schema

---

## 🗺️ Roadmap

- [ ] Connect consultation history to PostgreSQL (currently localStorage)
- [ ] Vector DB (pgvector) for scalable RAG knowledge base
- [ ] Live video consultation (Daily.co / Zoom Video SDK integration)
- [ ] Prescription generation with digital signature
- [ ] EHR integration (FHIR API)
- [ ] Mobile app (React Native)
- [ ] Doctor-facing portal with patient queue management
- [ ] Wearable data integration (heart rate, SpO₂)

---

## 👨‍💻 Author

**Vaibhav**  
Full-stack developer building AI applications for healthcare.

- GitHub: [@vaibhav-aiml](https://github.com/vaibhav-aiml)

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## ⚠️ Disclaimer

**MediVoice AI is an informational tool only.** The AI-generated responses, triage scores, symptom assessments, and medical reports provided by this platform are for educational and informational purposes only. They do not constitute professional medical advice, diagnosis, or treatment.

Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or heard from this application.

In case of a medical emergency, call your local emergency services immediately (108 in India, 911 in the US).

---

<div align="center">

**© 2026 MediVoice AI. All rights reserved.**

Made with ❤️ for better healthcare access in India.

</div>
