# Setup & Rollback Guide: Voice Biometrics Feature

This document details the environment requirements, verification checks, and rollback steps for the Voice Biometrics (Enrollment and Verification) feature.

---

## 1. Setup & Configuration

### Postgres Schema Migrations
The biometrics feature introduces a new `voice_biometrics` table.
1.  **Drizzle Migration Push**: Push the modifications directly to Postgres via:
    ```bash
    npx drizzle-kit push
    ```
2.  Verify that the `voice_biometrics` table exists in your Neon Postgres instance, checking the fields: `id`, `user_id`, `voice_embedding`, `created_at`, `updated_at`.

---

## 2. Verification Steps

### Automated Testing
Execute Vitest test suites:
```bash
cd backend
npx vitest run tests/unit/biometricsService.test.ts
npx vitest run tests/integration/biometrics.routes.test.ts
```

### Manual Verification
1.  Launch the backend and frontend.
2.  Click **More** in the top navigation header dropdown and select **Voice Biometrics**.
3.  Click **Start Voice Enrollment**, read the specified passphrase clearly, and wait for completion. Close the modal once it reports successful voice vector profile generation.
4.  Try to open the biometrics modal again; it should prevent duplicates and display that you are already enrolled.
5.  Go to **New Consultation**, start a voice session, and speak.
6.  Observe the status badge next to the connection telemetry: it should compute your spectral profile and render `👤 VERIFIED (XX%)` based on similarity match confidence.

---

## 3. Rollback Guide

### Code Rollback
1.  Revert code changes via Git:
    ```bash
    git revert <biometrics-feature-commit-hash>
    ```

### Database Schema Rollback
1.  Remove the `voice_biometrics` table by executing raw SQL on your Postgres database instance:
    ```sql
    DROP TABLE IF EXISTS "voice_biometrics" CASCADE;
    ```
