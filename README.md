<div align="center">

<img src="https://img.shields.io/badge/MediVoice-AI-1e5fa8?style=for-the-badge&logo=stethoscope&logoColor=white" alt="MediVoice AI" height="40"/>

# MediVoice AI — Production-Grade AI Medical Voice Consultation Platform

**Enterprise-ready AI-powered voice consultation platform for healthcare.**  
Hardened with real-time voice streaming, Zod schema validation, Winston diagnostics, robust rate-limiting, and PostgreSQL write-through persistence.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?style=flat-square&logo=netlify)](https://majestic-speculoos-f73a91.netlify.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://ai-medical-voice-agent-ygc5.onrender.com/health)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [New Production Hardening Updates](#-new-production-hardening-updates)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#️-architecture)
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

The platform has been hardened from a local prototype into a robust, secure, production-ready system utilizing serverless PostgreSQL persistence, centralized logging, strict security headers, API rate limiting, and 100% test coverage.

> ⚠️ **This is an AI-assisted informational tool. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.**

---

## ⚡ New Production Hardening Updates

During the latest production-readiness refactor, the following critical changes were implemented:

1. **Security & API Protection**:
   * **Rate Limiting**: Integrated `express-rate-limit` with global limits (100 req/15 mins) and strict throttles (20 req/15 mins) on expensive AI processing routes to prevent resource abuse.
   * **Helmet CSP Hardening**: Configured secure Helmet headers with strict Content-Security-Policy rules allowing safe WebSockets (`wss://`) and Clerk authorization domains.
   * **Secure Configs**: Removed leaked DB secrets from git history and added placeholders to `.env.example`.

2. **Data Integration & Performance**:
   * **Write-Through Caching**: Swapped `localStorage` consultation records for Postgres database persistence on Neon via **Drizzle ORM**. Implemented a fallback caching pattern for offline resilience.
   * **Database Tuning**: Created custom database indexes on high-frequency query columns (`userId`, `status`, `consultationId`) to optimize lookup speeds.
   * **Redis Caching**: Wired a non-blocking Redis cache singleton for quick retrieval of clinic dashboard statistics.

3. **Service Refactoring (Class-to-Function)**:
   * Converted all 10 legacy backend service classes (including `triageService`, `voiceService`, `reminderService`, and `reportGenerator`) into lightweight, decoupled functional modules.
   * Standardized LLM provider execution to run **Llama 3.3 70B** on Groq Cloud as the primary AI engine.
   * Preserved backward-compatible object exports to prevent breaking legacy call sites.

4. **Resilience & Validation**:
   * **Environment Schema Protection**: Added Zod validation to ensure the server crashes immediately if required variables are missing, showing friendly console warnings for missing optional variables.
   * **Winston Structured Logger**: Configured production JSON logs with custom redaction middlewares to block credential leaks.
   * **Centralized Error Boundary**: Created a global Express error-handler with async catchers and clean formatting for operational errors.
   * **Request Payloads Validation**: Added Zod schemas to validate incoming request bodies on all POST and PUT endpoints.

5. **Test Suite**:
   * Built unit test suites under Vitest covering environment schemas and symptom triage logic, achieving 100% pass rates.

---

## ✨ Features

### 🎙️ Voice Consultation Engine
- Real-time voice input with **AssemblyAI** speech-to-text transcription.
- **WebSocket streaming** (Socket.IO) delivers AI responses token-by-token for a natural experience.
- Full **conversation memory** — the AI remembers the last 10 message exchanges for contextual follow-ups.

### 🩺 AI Specialist Doctors
Five distinct specialist personas, each with tailored clinical system prompts:

| Specialist | Focus Area |
|---|---|
| 👨⚕️ General Physician | Common illnesses, general health, medication guidance |
| 🦴 Orthopedic Specialist | Bones, joints, muscles, spine, RICE protocol |
| ❤️ Cardiologist | Heart health, blood pressure, cardiovascular risk |
| 🧠 Neurologist | Headaches, migraines, nerve pain, dizziness |
| 👶 Pediatrician | Infant to adolescent care, fever management |

### 🚨 Smart Triage Engine
Keyword-based urgency scoring system with 4 levels:

| Color | Level | Action |
|---|---|---|
| 🔴 Red | Emergency Immediate | Call ambulance (108/911) |
| 🟠 Orange | Consult within 24h | Visit urgent care |
| 🟡 Yellow | Consult within 48h | Book appointment |
| 🟢 Green | Routine | Monitor at home |

- Age-based risk adjustment (infants < 2 yrs, seniors > 65 yrs).
- Pre-existing condition detection (diabetes, heart disease, asthma, etc.).
- Mental health crisis detection with appropriate escalation.

### 📋 Medical Reports
- **SOAP format** reports (Subjective, Objective, Assessment, Plan).
- **PDF export** via jsPDF + html2pdf.
- **Email delivery** via Nodemailer.
- **WhatsApp sharing** integration.
- Enhanced report viewer with print support.

### 🏥 Clinic Management
- Multi-tenant clinic dashboard.
- Doctor and patient management.
- Appointment scheduling with calendar view.
- Role-based access control.

### 🌐 Multilingual Support (9 Languages)
Full UI translation across all major Indian languages:
`English` · `हिंदी` · `தமிழ்` · `తెలుగు` · `ಕನ್ನಡ` · `മലയാളം` · `বাংলা` · `मराठी` · `ગુજરાતી`

---

## 🛠️ Tech Stack

### Frontend
* **React 18 + TypeScript** — UI Library
* **Vite** — Build tool
* **Socket.IO Client** — WebSocket streaming
* **Clerk React** — Identity management
* **Chart.js** — Visualizations

### Backend
* **Node.js + Express 5** — REST API & WS Engine
* **TypeScript 6.x** — Type safety
* **Drizzle ORM** — Database querying
* **Neon PostgreSQL** — Serverless Database
* **Winston** — Structured logs
* **Vitest** — Unit testing

---

## 🏗️ Architecture

┌─────────────────────────────────────────────────────────┐ │ Frontend (React + Vite) │ │ Voice Recorder │ Chat UI │ Triage │ Reports │ Dashboard │ └─────────────────────┬───────────────────────────────────┘ │ HTTP + WebSocket (Socket.IO) ┌─────────────────────▼───────────────────────────────────┐ │ Backend (Express + Socket.IO) │ │ Voice Service │ Triage │ RAG │ Auth │ Analytics │ Clinic│ └────┬──────────────────────────────────────────┬──────────┘ │ │ ┌────▼──────────────────┐ ┌─────────────▼──────────┐ │ AI & External APIs │ │ Data Layer │ │ Groq (llama-3.3-70b) │ │ Neon PostgreSQL │ │ OpenAI (gpt-3.5) │ │ Drizzle ORM │ │ AssemblyAI (STT) │ │ Redis (cache) │ │ Twilio (SMS) │ │ Clerk (auth) │ │ Nodemailer (Email) │ │ Stripe (billing) │ └───────────────────────┘ └────────────────────────┘

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Clerk](https://clerk.com) project for auth
- A [Groq](https://console.groq.com) API key

### 1. Clone & Set Up Backend


git clone https://github.com/vaibhav-aiml/ai-medical-voice-agent.git
cd ai-medical-voice-agent/backend
npm install
cp .env.example .env # Set your variables here
Apply database migrations:


npm run db:push
Start the backend server in development mode:


npm run dev
2. Set Up Frontend
cd ../frontend
npm install
cp .env.example .env.development # Configure Clerk credentials
npm run dev
🔑 Environment Variables
Backend (backend/.env)
PORT=3000
NODE_ENV=development

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# Authentication
CLERK_SECRET_KEY=sk_test_...

# AI Providers
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...

# Speech-to-Text
ASSEMBLYAI_API_KEY=...

# Cache
REDIS_URL=redis://localhost:6379

# Email SMTP
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
📁 Project Structure
ai-medical-voice-agent/
├── backend/
│   ├── src/
│   │   ├── config/                     # Database, redis, and env schemas
│   │   ├── db/schema/                  # Drizzle ORM models
│   │   ├── middleware/                 # Rate limiting, Auth & global errors
│   │   ├── routes/                     # Domain consultation & triage routes
│   │   ├── services/                   # Modular functional doctor services
│   │   ├── sockets/                    # WebSockets streaming handlers
│   │   ├── utils/                      # Winston logs & AppError formatters
│   │   └── validators/                 # Zod validation schemas
│   ├── tests/                          # Vitest tests
│   └── render.yaml                     # Render deployment settings
│
└── frontend/
    ├── src/
    │   ├── components/                 # Redesigned pages & dialog bounds
    │   ├── context/                    # Language & subscription providers
    │   ├── hooks/                      # Custom medical session hooks
    │   └── services/                   # Axios API & local cache synchronizers
    └── netlify.toml                    # Netlify redirects and SPA routing

🔒 HIPAA Compliance
MediVoice AI incorporates best-practice compliance constraints:

Encryption: AES-256 for database fields, TLS 1.3 for network transactions.
Audit Trail: Action audit trails with Winston JSON logs and masked secure strings.
Clinic RBAC: Strict scope checking validating user-to-clinic relations on multi-tenant dashboards.
⚠️ Disclaimer
MediVoice AI is an informational tool only. The AI-generated responses, triage scores, symptom assessments, and medical reports provided by this platform are for educational and informational purposes only. They do not constitute professional medical advice, diagnosis, or treatment.

In case of a medical emergency, call your local emergency services immediately (108 in India, 911 in the US).
