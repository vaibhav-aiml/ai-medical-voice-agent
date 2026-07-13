# Setup & Rollback Guide: Real-Time Translation Feature

This document details the environment requirements, verification checks, and rollback steps for the Real-Time Translation feature.

---

## 1. Setup & Configuration

### Prerequisites
1.  **AI Key**: Verify `GROQ_API_KEY` (Llama-3.3-70b-versatile) or `OPENAI_API_KEY` (GPT-3.5-turbo) is set in your env.
2.  **No Schema Migration Needed**: Since translations are stored directly in the `jsonb` array structures of the `voice_sessions` table, no database migration is required.

---

## 2. Verification Steps

### Automated Testing
Run the translation test suite using Vitest:
```bash
cd backend
npx vitest run tests/unit/translationService.test.ts
npx vitest run tests/integration/translation.routes.test.ts
```

### Manual Verification
1.  Launch the Express backend and React frontend.
2.  Open the web interface and choose a non-English language (e.g. Hindi `hi`).
3.  Start a consultation.
4.  Speak in Hindi (or type e.g., *"मेरे सीने में तेज दर्द है"*).
5.  Wait for the AI Doctor response. Notice that the AI doctor responds in Hindi.
6.  Once the response is complete, verify that the **Show Translation** link is visible under your message and the AI's response message. Click it to view the English translation.

---

## 3. Rollback Guide

If you need to roll back this feature, execute the following steps:

### Code Rollback
Revert the corresponding commits in Git:
```bash
git revert <translation-feature-commit-hash>
```
Or reset the working tree back to the pre-translation state:
```bash
git reset --hard HEAD~1
```
No database rollbacks are needed.
