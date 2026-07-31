# HIPAA Compliance Reference & Technical Security Architecture

This document describes the technical security measures implemented in the MediVoice AI application codebase and details the infrastructure and administrative safeguards required for HIPAA compliance.

> **Technical Compliance Disclaimer**: HIPAA compliance is an end-to-end organizational responsibility involving infrastructure security, vendor BAAs, access policies, and administrative procedures. MediVoice AI provides technical security controls at the application layer, but application code alone does not grant compliance.

---

## Implemented Application Safeguards

### 1. Access Control & Authentication
- **Clerk Session Verification**: Sensitive patient API routes are protected via authentication middleware (`requireAuth`). The backend performs cryptographic verification of Clerk JWT tokens (`clerkClient.verifyToken`) to validate user identity.
- **Role & Route Scoping**: Endpoint authorization checks ensure users can only access their own consultations, audit logs, and clinic records.

### 2. Audit Trail & Integrity Signatures
- **Database Log Persistence**: Audit events and data access logs are stored in PostgreSQL tables (`audit_logs`, `hipaa_logs`) using Drizzle ORM.
- **HMAC SHA-256 Signatures**: Audit log entries compute HMAC SHA-256 cryptographic signatures using `AUDIT_SIGNING_SECRET` to detect unauthorized tampering or log modification. In production environments, server startup fails if `AUDIT_SIGNING_SECRET` is unconfigured.
- **Audit APIs**: Restricted endpoints (`/api/hipaa/logs` and `/api/audit/logs`) allow authorized users to review access logs and verify signature integrity.

### 3. Data Minimization & Pattern Redaction
- **Rule-Based Regex Masking**: Client-side (`hipaaCompliance.ts`) and server-side (`phiService.ts`) utilities apply 15 structured regular expressions to mask standard identifiers (email, phone, SSN, MRN, date of birth, street address) prior to sending text to third-party LLM APIs.
- **Implementation Limitation**: This feature uses deterministic regular expression matching. It does not employ statistical Natural Language Processing (NLP) or Clinical Named Entity Recognition (NER). Unstructured names or non-standard date formats may not be detected by regex patterns alone.

---

## Required Deployment Infrastructure & Safeguards

To maintain compliance, the deploying entity must configure the following operational controls:

### 1. Database & Infrastructure Encryption
- **Managed Database Encryption at Rest**: Deploy on cloud database providers with storage volume encryption at rest enabled (e.g., Neon managed PostgreSQL storage).
- **Transport Layer Security**: Enforce HTTPS and TLS 1.3 for all REST API endpoints and Socket.IO WebSocket streaming connections.

### 2. Business Associate Agreements (BAAs)
Deployers MUST execute BAAs with all third-party vendors processing PHI in production:
- **Authentication**: Clerk (requires Enterprise plan for BAA execution).
- **AI / LLM Inferences**: Groq / OpenAI (requires enterprise deployment BAA).
- **Database & Hosting**: Neon PostgreSQL / Render / Netlify.

### 3. Administrative Safeguards
- Establish employee security training and role-based data access policies.
- Configure automated database backups with verified Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO).
- Establish formal data breach response and incident reporting protocols.

---

## Technical Security Feature Matrix

- [x] Application-level Access Controls (Clerk JWT Signature Verification)
- [x] Permanent Database Audit Logging (`audit_logs` & `hipaa_logs` PostgreSQL tables)
- [x] Cryptographic Integrity Verification (HMAC SHA-256 signatures with mandatory production secret assertion)
- [x] Rule-Based Regex PHI Masking (`phiService` pattern anonymizer)
- [ ] Managed Database Encryption at Rest (Configured by Deployer on Neon PostgreSQL)
- [ ] BAA Contracts Signed with Infrastructure Vendors (Executed by Deployer)
- [ ] Administrative Policies & Incident Procedures (Established by Deployer)