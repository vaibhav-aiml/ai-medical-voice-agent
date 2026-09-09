# India Digital Personal Data Protection (DPDP) Act 2023 — Compliance Reference

This document describes MediVoice AI's position relative to India's **Digital Personal Data Protection Act, 2023** (DPDP Act), which is the primary data protection framework applicable to an India-based healthcare platform processing Indian patient data.

> **Disclaimer**: This document provides a technical compliance mapping, not legal advice. Consult qualified legal counsel for definitive DPDP compliance guidance. For US HIPAA-related controls, see [README-HIPAA.md](README-HIPAA.md).

---

## 1. DPDP Act Overview

The DPDP Act 2023 regulates the processing of digital personal data in India. Key concepts:

| DPDP Term | MediVoice Equivalent |
|-----------|---------------------|
| **Data Principal** | Patient (the person whose symptoms/health data is processed) |
| **Data Fiduciary** | The organization deploying MediVoice AI |
| **Data Processor** | Third-party vendors: Groq, OpenAI, AssemblyAI, Neon, Clerk, Render, Netlify |
| **Significant Data Fiduciary** | May apply if processing health data at scale (to be assessed) |
| **Consent Manager** | Not yet implemented in MediVoice (see Gap Analysis below) |

---

## 2. Consent Management

### DPDP Requirement
Section 6: Personal data may only be processed for a lawful purpose with the **free, specific, informed, and unambiguous consent** of the Data Principal. Consent must be requested in clear, plain language and must specify the purpose of processing. The Data Principal must be able to **withdraw consent** at any time.

### Current State in MediVoice

| Control | Status | Notes |
|---------|--------|-------|
| Explicit consent capture before symptom data is sent to AI | ❌ **Gap** | No consent dialog or acknowledgment flow exists before patient text/voice data is transmitted to Groq/OpenAI for inference |
| Consent for data storage in Neon PostgreSQL | ❌ **Gap** | Consultation records are stored automatically; no consent is captured or recorded |
| Consent withdrawal mechanism | ❌ **Gap** | No UI or API endpoint for a patient to withdraw consent for data processing |
| Purpose limitation disclosure | ❌ **Gap** | No disclosure to the patient specifying *what* their data is used for and *which third-party processors* receive it |
| Consent records/audit trail | ⚠️ **Partial** | Audit logging infrastructure exists (`hipaa_logs`, `audit_logs`) but no consent-specific event types are logged |

### Recommended Actions
1. Add a consent dialog in the frontend before the first symptom submission in each session, clearly stating: "Your symptom data will be processed by AI services (Groq/OpenAI) hosted outside India for the purpose of generating medical guidance."
2. Record consent events in the existing `audit_logs` table with a `consent_granted` / `consent_withdrawn` action type.
3. Implement a consent withdrawal API endpoint and corresponding UI control.

---

## 3. Cross-Border Data Transfer

### DPDP Requirement
Section 16: The Central Government may restrict transfer of personal data to certain countries/territories. Until specific restrictions are notified, transfers are permitted **unless** the destination is on a government-published negative list.

### Current State in MediVoice

| Data Flow | Destination | Status |
|-----------|-------------|--------|
| Symptom text → Groq (LLM inference) | US-based servers | ⚠️ **Permitted (pending government notification)** |
| Symptom text → OpenAI (fallback) | US-based servers | ⚠️ **Permitted (pending government notification)** |
| Voice audio → AssemblyAI (STT) | US-based servers | ⚠️ **Permitted (pending government notification)** |
| Consultation records → Neon PostgreSQL | US/EU (Neon region-dependent) | ⚠️ **Permitted (pending government notification)** |
| Auth tokens → Clerk | US-based servers | ⚠️ **Permitted (pending government notification)** |
| Frontend assets → Netlify CDN | Global edge | Low risk (no personal data) |

### Recommended Actions
1. **Data Processing Agreements (DPAs)**: Execute formal data processing agreements with Groq, OpenAI, AssemblyAI, Neon, and Clerk specifying the nature and purpose of processing, data retention, security obligations, and breach notification procedures. **This is currently not documented.**
2. **Monitor the DPDP negative list**: When the Central Government publishes a list of restricted countries, verify that all processor locations remain permitted.
3. **Data localization option**: Consider offering a Neon PostgreSQL region in India (or an Indian cloud provider) for deployments that require data residency.
4. **PHI redaction before cross-border transfer**: MediVoice already applies regex-based PHI redaction before sending text to AI providers (`phiService.ts`). This is a meaningful data minimization control but is best-effort (see `phiService.ts` code comments).

---

## 4. Data Principal Rights

### DPDP Requirement
Sections 11–14: Data Principals have the right to:
- **Access**: Obtain a summary of personal data being processed and the processing activities
- **Correction**: Request correction of inaccurate or misleading personal data
- **Erasure**: Request erasure of personal data (subject to legal retention requirements)
- **Grievance redressal**: File complaints with the Data Fiduciary and escalate to the Data Protection Board

### Current State in MediVoice

| Right | Status | Notes |
|-------|--------|-------|
| Access (view own data) | ✅ **Implemented** | Patients can view their consultation history, reports, and audit logs through authenticated API endpoints |
| Correction | ⚠️ **Partial** | Patients can update profile information. Consultation records (medical data) are append-only by design for clinical integrity — correction would need an addendum model |
| Erasure | ❌ **Gap** | No data deletion API or UI exists. Database records have no TTL or automated purge mechanism |
| Grievance redressal | ❌ **Gap** | No in-app grievance mechanism or Data Protection Officer contact is published |

### Recommended Actions
1. Implement a data export endpoint (`GET /api/user/data-export`) that returns all personal data for the authenticated user.
2. Implement a data erasure endpoint (`DELETE /api/user/data`) that soft-deletes or anonymizes all personal data, consultation records, and audit logs for the user, subject to any legally required retention periods.
3. Add a consultation correction/addendum mechanism rather than modifying original records (maintains clinical data integrity).
4. Publish a Data Protection Officer (DPO) contact and in-app grievance submission form.

---

## 5. Breach Notification

### DPDP Requirement
Section 8(6): The Data Fiduciary must notify the Data Protection Board of India **and** each affected Data Principal of any personal data breach, in the manner prescribed by the Board.

### Current State in MediVoice

| Control | Status | Notes |
|---------|--------|-------|
| Breach detection | ⚠️ **Partial** | Application-level audit logging captures access events. No automated anomaly detection or breach identification system |
| Breach notification to Board | ❌ **Gap** | No automated or manual process documented |
| Breach notification to patients | ❌ **Gap** | No notification mechanism for breach alerts to affected Data Principals |
| Incident response plan | ❌ **Gap** | No documented incident response procedure |

### Recommended Actions
1. Document a formal breach response procedure including: identification, containment, assessment, Board notification, and Data Principal notification.
2. Implement automated alerting on suspicious audit log patterns (e.g., bulk data access, access from unusual locations).
3. Add a breach notification template and delivery mechanism (email via existing Nodemailer infrastructure).

---

## 6. Existing Controls That Satisfy DPDP-Adjacent Requirements

MediVoice AI already implements several technical controls that align with DPDP's security expectations:

| Existing Control | DPDP Relevance |
|-----------------|----------------|
| **Clerk JWT Authentication** | Access control — ensures only authenticated users can access patient data (Section 8(4)) |
| **RBAC / Route-level authorization** | Data access limited to data owner (reminder routes, consultation routes all verify `userId`) |
| **Audit logging** (`audit_logs`, `hipaa_logs`) | Accountability and traceability of data access events |
| **HMAC SHA-256 log signatures** | Tamper detection on audit records |
| **PHI regex redaction** (`phiService.ts`) | Data minimization — reduces personal data sent to external processors |
| **TLS/HTTPS enforcement** | Transport-level encryption (Section 8(4) — "reasonable security safeguards") |
| **Rate limiting** | Protection against bulk data extraction |
| **Idempotency keys** | Data integrity in unreliable network conditions |

---

## 7. Summary of Gaps Requiring Action

| # | Gap | Priority | DPDP Section |
|---|-----|----------|-------------|
| 1 | **No explicit consent capture** before sending data to AI processors | **Critical** | Section 6 |
| 2 | **No Data Processing Agreements** with Groq, OpenAI, AssemblyAI, Neon, Clerk | **Critical** | Section 8(7) |
| 3 | **No data erasure mechanism** for Data Principals | **High** | Section 12 |
| 4 | **No consent withdrawal** mechanism | **High** | Section 6(4) |
| 5 | **No breach notification** process or tooling | **High** | Section 8(6) |
| 6 | **No DPO contact** or grievance mechanism published | **Medium** | Section 10 |
| 7 | **No purpose limitation disclosure** to patients | **Medium** | Section 6(1) |
| 8 | Cross-border transfer destinations not formally documented | **Medium** | Section 16 |

---

## Technical Security Feature Matrix (Combined HIPAA + DPDP)

- [x] Application-level Access Controls (Clerk JWT)
- [x] Permanent Database Audit Logging
- [x] Cryptographic Integrity Verification (HMAC SHA-256)
- [x] Rule-Based Regex PHI/PII Masking (US + Indian identifiers)
- [x] Transport Encryption (TLS/HTTPS)
- [x] Rate Limiting and Abuse Prevention
- [ ] Explicit Consent Capture Flow *(DPDP critical gap)*
- [ ] Data Processing Agreements with Processors *(DPDP critical gap)*
- [ ] Data Erasure / Right to be Forgotten *(DPDP gap)*
- [ ] Consent Withdrawal Mechanism *(DPDP gap)*
- [ ] Breach Notification Process *(DPDP gap)*
- [ ] Data Protection Officer Contact Published *(DPDP gap)*
- [ ] Managed Database Encryption at Rest *(Configured by Deployer)*
