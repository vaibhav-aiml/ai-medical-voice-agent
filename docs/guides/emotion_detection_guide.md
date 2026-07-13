# Setup & Rollback Guide: Emotion Detection Feature

This guide details instructions to set up, deploy, and rollback the Emotion Detection AI feature in the MediVoice platform.

---

## 1. Setup & Configuration

### Prerequisites
1.  **Groq API Key**: Set `GROQ_API_KEY` in `backend/.env` to a valid API key (starting with `gsk_`).
2.  **Database Migration**: The database schema must be updated to include the new columns in the `voice_sessions` table.

### Installation & Run Steps
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Apply migrations using Drizzle Push:
    ```bash
    npx drizzle-kit push
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    ```
5.  Install packages (if any) and start client:
    ```bash
    npm run dev
    ```

---

## 2. Verification Steps

### Automated Testing
To run all tests (including the new emotion detection suite):
```bash
cd backend
npx vitest run
```

### Manual Verification
1.  Open `http://localhost:5173` and log in (in dev mode, Clerk bypass resolves to `dev-user-123`).
2.  Start a new consultation.
3.  Activate Voice Mode or Text Mode and type/say an emotional clinical statement (e.g. *"I am feeling extremely nervous, my chest hurts"*).
4.  Observe the WebSocket connection state and verify that the emotion badge (e.g. `🎭 ANXIETY (85%)`) is rendered in the recorder panel.
5.  End the consultation, navigate to the **Consultation History** tab, and verify that the dominant emotion is recorded in the table listing.

---

## 3. Rollback Guide

If any production issues occur with this feature, follow these rollback steps:

### Step 1: Rollback DB Schema
Since Drizzle pushes changes schema-first, to revert the database table columns without dropping the entire database, connect to the database via pgAdmin or Neon Console and drop the added columns:
```sql
ALTER TABLE voice_sessions DROP COLUMN IF EXISTS emotion;
ALTER TABLE voice_sessions DROP COLUMN IF EXISTS emotion_confidence;
ALTER TABLE voice_sessions DROP COLUMN IF EXISTS emotion_scores;
```

### Step 2: Rollback Code base
Revert the git commit:
```bash
git revert <commit-hash>
```
Or reset the branch to the pre-feature state:
```bash
git checkout main
git reset --hard HEAD~1
```
Then restart the node server.
