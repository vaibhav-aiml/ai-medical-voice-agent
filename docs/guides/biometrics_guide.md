# Setup & Rollback Guide: Voice Similarity Prototype

This document details the environment requirements, verification checks, technical implementation, and rollback steps for the experimental voice similarity prototype using normalized PCM amplitude features.

---

## Technical Overview & Implementation Note

> **Technical Disclosure**: This component is an **experimental voice similarity prototype using normalized PCM amplitude features**. It calculates a 128-bin energy distribution histogram over raw audio buffer bytes normalized by L2 norm, and compares vectors using cosine similarity. It does **not** employ Mel-Frequency Cepstral Coefficients (MFCCs), spectral Fast Fourier Transforms (FFT), or neural speaker embedding models (such as ECAPA-TDNN or DeepSpeaker). It should be treated as an experimental prototype rather than production-grade biometric speaker authentication.

---

## 1. Setup & Configuration

### Postgres Schema Migrations
The voice similarity feature utilizes a `voice_biometrics` table.
1. **Drizzle Migration Push**: Push modifications directly to PostgreSQL via:
    ```bash
    cd backend
    npx drizzle-kit push
    ```
2. Verify that the `voice_biometrics` table exists in your database instance, checking fields: `id`, `user_id`, `voice_embedding`, `created_at`, `updated_at`.

---

## 2. Verification Steps

### Automated Testing
Execute Vitest test suites:
```bash
cd backend
npm test tests/unit/biometricsService.test.ts
npm test tests/integration/biometrics.routes.test.ts
```

### Manual Verification
1. Launch backend (`cd backend && npm run dev`) and frontend (`cd frontend && npm run dev`).
2. Click **More** in the top navigation header dropdown and select **Voice Biometrics**.
3. Click **Start Voice Enrollment**, speak into the microphone, and complete enrollment.
4. Try to open the enrollment modal again; it will indicate that your voice template has been saved.
5. Go to **New Consultation**, start a voice session, and speak.
6. Observe the status badge: it computes cosine similarity against the saved template and renders `👤 VERIFIED (XX%)` based on similarity match confidence.

---

## 3. Rollback Guide

### Code Rollback
1. Revert code changes via Git:
    ```bash
    git revert <biometrics-feature-commit-hash>
    ```

### Database Schema Rollback
1. Remove the `voice_biometrics` table by executing raw SQL on your PostgreSQL instance:
    ```sql
    DROP TABLE IF EXISTS "voice_biometrics" CASCADE;
    ```
