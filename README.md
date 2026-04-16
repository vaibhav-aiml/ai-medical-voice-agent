**No, it's still NOT correct.** Your version has extra `text` words and missing backticks.

## Here is the **100% CORRECT** version - copy this exactly:

```markdown
# 🏥 AI Medical Voice Agent

[![Live Demo](https://img.shields.io/badge/Live_Demo-Netlify-00C7B7?style=for-the-badge)](https://ai-medical-voice-agent.netlify.app)
[![Backend API](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge)](https://ai-medical-voice-agent-ygc5.onrender.com/health)

## 📋 Overview

AI Medical Voice Agent is an intelligent healthcare platform providing instant medical consultations using AI technology. Patients can interact with AI doctors through voice or text, get medical advice, download PDF reports, book follow-up appointments, and receive reports via email.

## ✨ Features

- 🎤 **Voice Consultation** - Real-time voice interaction with AI doctors
- ✏️ **Text Consultation** - Type your symptoms for accurate advice
- 👨‍⚕️ **5 AI Specialists** - General, Orthopedic, Cardiologist, Neurologist, Pediatrician
- 🧠 **Conversation Memory** - AI remembers your previous messages
- 📋 **Medical Reports** - Download detailed PDF reports
- 📧 **Email Reports** - Send reports to yourself, family, or doctors
- 📅 **Appointment Booking** - Schedule follow-up appointments
- 📊 **Dashboard** - View consultation history and statistics
- 🔐 **Authentication** - Secure login with Clerk (Email, Google, GitHub)

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Clerk, Socket.IO Client  
**Backend:** Node.js, Express, PostgreSQL (Neon), Drizzle ORM, Socket.IO, Groq AI  
**Deployment:** Netlify (Frontend), Render (Backend)

## 🚀 Live Demo

- Frontend: https://ai-medical-voice-agent.netlify.app
- Backend API: https://ai-medical-voice-agent-ygc5.onrender.com/health

## 📁 Project Structure

```
ai-medical-voice-agent/
├── frontend/          # React frontend
├── backend/           # Node.js backend
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/vaibhav-aiml/ai-medical-voice-agent.git
cd ai-medical-voice-agent

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### Environment Variables

**Backend (.env)**

```
PORT=3000
DATABASE_URL=your_postgresql_url
CLERK_SECRET_KEY=your_clerk_secret_key
GROQ_API_KEY=your_groq_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000
```

### Run Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open http://localhost:5173

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/consultations/save` | Save consultation |
| GET | `/api/consultations/user/:userId` | Get user consultations |
| POST | `/api/email/send-report` | Send email report |

## 🚢 Deployment

**Backend (Render):** Push to GitHub → Create Web Service → Add env variables → Deploy  
**Frontend (Netlify):** Run `npm run build` → Drag `dist` folder to Netlify → Add env variables

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| WebSocket not connecting | Check backend is running on port 3000 |
| Email not sending | Verify SMTP credentials |
| AI not responding | Check Groq API key |
| Auth not working | Add Netlify URL to Clerk allowed origins |

## 👨‍💻 Author

**Vaibhav Badaya**

- GitHub: [@vaibhav-aiml](https://github.com/vaibhav-aiml)
- Project: https://github.com/vaibhav-aiml/ai-medical-voice-agent

## ⚠️ Disclaimer

This application is for informational purposes only. AI-generated medical advice is not a substitute for professional medical diagnosis. Always consult a qualified healthcare provider.

## ⭐ Show Support

If you found this project helpful, please give it a star on GitHub!

---

**Live Demo:** https://ai-medical-voice-agent.netlify.app
```

