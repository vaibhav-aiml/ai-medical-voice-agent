import { Pool } from 'pg';

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'medical_ai',
});

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    specialistType?: string;
    symptoms?: string[];
    urgencyScore?: number;
  };
}

export interface ConversationSession {
  id: string;
  userId: string;
  specialistType: string;
  startTime: Date;
  endTime?: Date;
  messages: ConversationMessage[];
  summary?: string;
  keySymptoms?: string[];
  diagnosis?: string;
  recommendations?: string[];
}

class ConversationMemory {
  
  // Save a conversation session
  async saveSession(session: ConversationSession): Promise<void> {
    try {
      const query = `
        INSERT INTO conversations (id, user_id, specialist_type, start_time, end_time, messages, summary, key_symptoms, diagnosis, recommendations)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          end_time = EXCLUDED.end_time,
          messages = EXCLUDED.messages,
          summary = EXCLUDED.summary,
          updated_at = NOW()
      `;
      
      await pool.query(query, [
        session.id,
        session.userId,
        session.specialistType,
        session.startTime,
        session.endTime || null,
        JSON.stringify(session.messages),
        session.summary || null,
        session.keySymptoms ? JSON.stringify(session.keySymptoms) : null,
        session.diagnosis || null,
        session.recommendations ? JSON.stringify(session.recommendations) : null,
      ]);
      
      console.log(`💾 Saved conversation session: ${session.id} for user: ${session.userId}`);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }
  
  // Get conversation history for a user
  async getUserHistory(userId: string, limit: number = 10): Promise<ConversationSession[]> {
    try {
      const query = `
        SELECT * FROM conversations 
        WHERE user_id = $1 
        ORDER BY start_time DESC 
        LIMIT $2
      `;
      const result = await pool.query(query, [userId, limit]);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        specialistType: row.specialist_type,
        startTime: row.start_time,
        endTime: row.end_time,
        messages: JSON.parse(row.messages),
        summary: row.summary,
        keySymptoms: row.key_symptoms ? JSON.parse(row.key_symptoms) : [],
        diagnosis: row.diagnosis,
        recommendations: row.recommendations ? JSON.parse(row.recommendations) : [],
      }));
    } catch (error) {
      console.error('Error getting user history:', error);
      return [];
    }
  }
  
  // Get previous symptoms for context
  async getPreviousSymptoms(userId: string, limit: number = 3): Promise<string[]> {
    const sessions = await this.getUserHistory(userId, limit);
    const allSymptoms: string[] = [];
    
    for (const session of sessions) {
      if (session.keySymptoms && session.keySymptoms.length > 0) {
        allSymptoms.push(...session.keySymptoms);
      }
      // Also extract from messages
      for (const msg of session.messages) {
        if (msg.role === 'user' && msg.content.length < 500) {
          allSymptoms.push(msg.content.substring(0, 200));
        }
      }
    }
    
    return [...new Set(allSymptoms)]; // Return unique symptoms
  }
  
  // Generate session summary using AI
  async generateSummary(messages: ConversationMessage[]): Promise<string> {
    const userMessages = messages.filter(m => m.role === 'user');
    const symptoms = userMessages.map(m => m.content).join(' ');
    
    // Simple summary (in production, use AI)
    const summary = `Patient reported: ${symptoms.substring(0, 200)}...`;
    return summary;
  }
  
  // Extract key symptoms from conversation
  extractKeySymptoms(messages: ConversationMessage[]): string[] {
    const symptoms: string[] = [];
    const symptomKeywords = [
      'headache', 'fever', 'pain', 'cough', 'fatigue', 'nausea', 
      'dizziness', 'shortness of breath', 'chest pain', 'sore throat',
      'vomiting', 'diarrhea', 'rash', 'swelling', 'weakness'
    ];
    
    for (const msg of messages) {
      if (msg.role === 'user') {
        const lowerContent = msg.content.toLowerCase();
        for (const keyword of symptomKeywords) {
          if (lowerContent.includes(keyword) && !symptoms.includes(keyword)) {
            symptoms.push(keyword);
          }
        }
      }
    }
    
    return symptoms;
  }
  
  // Add context to new conversation based on history
  async buildContextPrompt(userId: string, currentSymptoms: string): Promise<string> {
    const previousSymptoms = await this.getPreviousSymptoms(userId, 2);
    
    if (previousSymptoms.length === 0) {
      return '';
    }
    
    return `\n\n[CONTEXT FROM PREVIOUS CONSULTATIONS]\nPreviously, you reported: ${previousSymptoms.join(', ')}.\nPlease consider this history when responding. Current symptoms: ${currentSymptoms}`;
  }
  
  // Initialize database table
  async initTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        specialist_type VARCHAR(100),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        messages JSONB NOT NULL,
        summary TEXT,
        key_symptoms JSONB,
        diagnosis TEXT,
        recommendations JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_start_time ON conversations(start_time);
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Conversation memory table initialized');
  }
  
  // Close database connection
  async close(): Promise<void> {
    await pool.end();
  }
}

export const conversationMemory = new ConversationMemory();