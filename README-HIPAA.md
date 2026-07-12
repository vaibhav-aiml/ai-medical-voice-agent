# HIPAA Compliance Reference & Architecture

This document describes the HIPAA-compliant security measures built directly into the MediVoice AI application code, and details how the deploying organization can satisfy remaining physical/administrative safeguards.

## Implemented Technical Controls

The following security controls are implemented at the application and database level:

### 1. Secure Access Controls
- **Clerk Authentication**: All patient data routes are protected via authenticated session checks (`requireAuth`). The backend performs cryptographic verification of Clerk JWT tokens (`clerkClient.verifyToken`) to validate user identities.
- **Route Protection**: Access controls are strictly enforced on all sensitive endpoints (e.g., consultations, voice records, reports, triage results, RAG queries, and clinic dashboards).

### 2. Audit & Access Logging
- **Database Persistence**: Audit logs and HIPAA logs are persisted to a PostgreSQL database (via Drizzle ORM) rather than in-memory storage, maintaining permanent records of data access.
- **Cryptographic Signatures**: The frontend client-side logger cryptographically signs audit log entries to ensure their integrity. Any subsequent modification of log files can be detected by signature mismatch.
- **Admin Access API**: Secure `/api/hipaa/logs` and `/api/audit/logs` endpoints are built and restricted to authenticated users.

### 3. Client-Side Data Minimization (PHI Sanitization)
- **Local Anonymization**: The application includes a client-side utility (`hipaaCompliance.ts`) that runs prior to any third-party AI inferences. It detects and redacts standard Protected Health Information (PHI) identifiers (e.g., names, emails, phone numbers, and street addresses).

---

## Deployer Compliance Checklist (Infrastructure & Administrative)

Because HIPAA compliance is a property of the overall system deployment and organizational policies, the organization deploying this application must implement the following safeguards:

### 1. Data Encryption at Rest and in Transit
- **Database & Storage**: Ensure your production database (e.g., Neon / Amazon RDS) has encryption at rest enabled (AES-256).
- **Transport Security**: Configure hosting platforms (e.g., Netlify, Render, Vercel) to enforce TLS 1.3 for all communications.

### 2. Business Associate Agreements (BAAs)
Deployers must sign BAAs with all third-party vendors handling PHI in their deployment environment:
- **Authentication**: Clerk (requires Enterprise or custom plans for BAA).
- **AI Processing**: OpenAI / Groq (requires enterprise agreements).
- **Database & Hosting**: Neon / AWS / Render.

### 3. Administrative Policies
- Establish a HIPAA training regimen for all medical/administrative staff.
- Set up automated database backups with clear Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO).
- Formulate a 60-day Breach Notification procedure and SLA.

---

## Active Checklist

- [x] Application-level Access Controls (Clerk JWT Signature Verification)
- [x] Permanent Database Logging (Audit & HIPAA tables)
- [x] Cryptographic Integrity Verification for client-side audit logs
- [x] Local PHI Data Minimization & Redaction (Regex Anonymizer)
- [ ] Infrastructure-level Encryption (To be configured by Deployer)
- [ ] BAA Contracts signed with vendors (To be executed by Deployer)
- [ ] Administrative policies and team training (To be established by Deployer)