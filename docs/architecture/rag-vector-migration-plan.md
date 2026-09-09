# RAG Vector Retrieval Migration Plan

## Overview

Migrate `ragKnowledgeBase.ts` from keyword-based `String.includes()` matching to vector similarity search using `pgvector` on Neon PostgreSQL. This mirrors the project's own roadmap item.

---

## Current State

[`ragKnowledgeBase.ts`](../../backend/src/services/ragKnowledgeBase.ts) uses:
- A hardcoded in-memory array of 10 `MedicalKnowledge` entries
- Keyword scoring via `lowerSymptoms.includes(symptom)` loops
- No semantic understanding — "I can't breathe" won't match "respiratory distress"

---

## Target Architecture

```
User query → Embed query (Groq/OpenAI) → pgvector cosine similarity → Top-K results → LLM context
                                              ↓ (fallback)
                                     Keyword search (existing logic)
```

---

## Schema Changes

### New table: `medical_knowledge_embeddings`

Add via Drizzle migration in `backend/src/db/schema/index.ts`:

```typescript
import { pgTable, uuid, text, real, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { vector } from 'drizzle-orm/pg-core'; // requires pgvector extension

export const medicalKnowledgeEmbeddings = pgTable('medical_knowledge_embeddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  condition: text('condition').notNull(),
  sourceText: text('source_text').notNull(),      // concatenated symptoms + warnings + treatments
  embedding: vector('embedding', { dimensions: 1536 }),  // OpenAI ada-002 or Groq embedding dimension
  metadata: jsonb('metadata'),                     // original MedicalKnowledge fields
  confidence: real('confidence').default(0.9),
  source: text('source'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  embeddingIdx: index('embedding_idx').using('ivfflat', table.embedding),
}));
```

### Database setup

```sql
-- Run once on Neon PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## File-Level Changes

### New files

| File | Purpose |
|------|---------|
| `backend/src/services/embeddingService.ts` | Embedding generation with Groq → OpenAI fallback |
| `backend/src/scripts/backfill-embeddings.ts` | One-time migration: embed existing knowledge base entries |
| `backend/src/db/schema/medicalKnowledge.ts` | Drizzle schema for the new table |

### Modified files

| File | Change |
|------|--------|
| `backend/src/services/ragKnowledgeBase.ts` | Add `searchKnowledgeVector()` that queries pgvector; existing `searchKnowledge()` becomes the fallback |
| `backend/src/db/schema/index.ts` | Export the new table schema |
| `backend/drizzle.config.ts` | No change needed (already configured for Neon) |

---

## embeddingService.ts — Design

```typescript
// Mirrors the existing Groq → OpenAI fallback pattern in voice.service.ts

export async function generateEmbedding(text: string): Promise<number[]> {
  // Try Groq embeddings first
  try {
    if (groq) {
      const response = await groq.embeddings.create({
        model: 'nomic-embed-text-v1.5',  // Groq-hosted embedding model
        input: text,
      });
      return response.data[0].embedding;
    }
  } catch (error) {
    logger.warn('Groq embedding failed, falling back to OpenAI', { error });
  }

  // Fallback to OpenAI
  if (openai) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  }

  // Both failed — return null so caller can fall back to keyword search
  throw new Error('No embedding provider available');
}
```

---

## ragKnowledgeBase.ts — Modified Search Flow

```typescript
export async function searchKnowledgeVector(
  symptoms: string,
  limit: number = 3
): Promise<MedicalKnowledge[]> {
  try {
    const queryEmbedding = await generateEmbedding(symptoms);

    // pgvector cosine similarity search
    const results = await db
      .select()
      .from(medicalKnowledgeEmbeddings)
      .orderBy(sql`embedding <=> ${JSON.stringify(queryEmbedding)}::vector`)
      .limit(limit);

    return results.map(r => r.metadata as MedicalKnowledge);
  } catch (error) {
    logger.warn('Vector search failed, falling back to keyword search', { error });
    // Fallback to existing keyword-based search
    return searchKnowledge(symptoms, limit);
  }
}
```

---

## Backfill Script

`backend/src/scripts/backfill-embeddings.ts`:

1. Iterate over the existing `MEDICAL_KNOWLEDGE_BASE` array
2. For each entry, concatenate: `condition + symptoms.join(', ') + warningSigns.join(', ')`
3. Generate embedding via `embeddingService.generateEmbedding()`
4. Insert into `medical_knowledge_embeddings` table
5. Log progress

Run as: `npx ts-node backend/src/scripts/backfill-embeddings.ts`

---

## Migration Steps

1. Enable `pgvector` extension on Neon: `CREATE EXTENSION IF NOT EXISTS vector;`
2. Add Drizzle schema and run `drizzle-kit push`
3. Run backfill script to populate embeddings for existing knowledge entries
4. Update `ragKnowledgeBase.ts` to try vector search first, fall back to keyword
5. Update route handlers to use the async vector search
6. Add tests for both vector and fallback paths

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Embedding API unavailable | Automatic fallback to existing keyword search (zero-downtime) |
| pgvector extension not available on Neon plan | Neon supports pgvector on all plans |
| Embedding dimension mismatch between Groq and OpenAI | Standardize on one dimension (1536 for ada-002) or store provider info |
| Increased latency from embedding generation | Cache embeddings for repeated queries via Redis |
| Cost of embedding API calls | Groq embeddings are free-tier eligible; OpenAI ada-002 is very cheap |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Schema + Drizzle migration | 1 hour |
| `embeddingService.ts` | 2 hours |
| `ragKnowledgeBase.ts` modifications | 2 hours |
| Backfill script | 1 hour |
| Tests | 2 hours |
| **Total** | **~8 hours** |
