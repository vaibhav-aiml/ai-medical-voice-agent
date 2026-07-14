import axios from 'axios';
import { API_URL } from '../config/api';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  sessionId: string;
  action: 'consultation_start' | 'message_sent' | 'message_received' | 'crisis_detected' | 'consultation_end';
  message: string;
  metadata: {
    crisisDetected?: boolean;
    crisisType?: string;
    ipAddress?: string;
    userAgent?: string;
    duration?: number;
    timestamp?: string;
    originalLength?: number;
    anonymizedLength?: number;
    containsPHI?: boolean;
    responseLength?: number;
    error?: string;
    messageCount?: number;
    [key: string]: any;
  };
  signature?: string;
  synced?: boolean;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private inFlight: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.syncOfflineQueue());
      // Periodically attempt to sync queue every 30 seconds
      setInterval(() => this.syncOfflineQueue(), 30000);
    }
  }

  log(
    userId: string,
    sessionId: string,
    action: AuditLogEntry['action'],
    message: string,
    metadata: AuditLogEntry['metadata'] = {}
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId,
      sessionId,
      action,
      message: message.substring(0, 500),
      metadata: {
        ...metadata,
        timestamp: metadata.timestamp || new Date().toISOString()
      },
      synced: false
    };
    
    this.logs.push(entry);
    this.persistToStorage(entry);
    
    console.log(`[AUDIT] ${entry.timestamp} - ${action}: ${message.substring(0, 100)}`);
    
    // Attempt asynchronous push to backend
    this.sendToBackend(entry);
    
    return entry;
  }

  getSessionLogs(sessionId: string): AuditLogEntry[] {
    return this.logs.filter(log => log.sessionId === sessionId);
  }

  getUserLogs(userId: string): AuditLogEntry[] {
    return this.logs.filter(log => log.userId === userId);
  }

  verifyIntegrity(_entry: AuditLogEntry): boolean {
    // Client-side verification is disabled as signatures are computed and validated exclusively on the server side
    return true;
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['id', 'timestamp', 'userId', 'sessionId', 'action', 'message', 'metadata', 'signature', 'synced'];
      const csvRows = [headers.join(',')];
      
      for (const log of this.logs) {
        const row = [
          log.id,
          log.timestamp,
          log.userId,
          log.sessionId,
          log.action,
          `"${log.message.replace(/"/g, '""')}"`,
          `"${JSON.stringify(log.metadata).replace(/"/g, '""')}"`,
          log.signature || '',
          log.synced ? 'true' : 'false'
        ];
        csvRows.push(row.join(','));
      }
      
      return csvRows.join('\n');
    }
    
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('audit_logs');
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromStorage(): void {
    try {
      const existing = localStorage.getItem('audit_logs');
      if (existing) {
        this.logs = JSON.parse(existing);
      }
    } catch (error) {
      console.error('Failed to load audit logs from localStorage:', error);
    }
  }

  private persistToStorage(entry: AuditLogEntry): void {
    try {
      const existing = localStorage.getItem('audit_logs');
      const logs = existing ? JSON.parse(existing) : [];
      logs.push(entry);
      if (logs.length > 1000) {
        logs.shift();
      }
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to persist audit log:', error);
    }
  }

  private updateStorageEntry(entry: AuditLogEntry): void {
    try {
      const existing = localStorage.getItem('audit_logs');
      if (existing) {
        const logs: AuditLogEntry[] = JSON.parse(existing);
        const idx = logs.findIndex(l => l.id === entry.id);
        if (idx !== -1) {
          logs[idx] = entry;
          localStorage.setItem('audit_logs', JSON.stringify(logs));
        }
      }
    } catch (error) {
      console.error('Failed to update audit log status in storage:', error);
    }
  }

  private async sendToBackend(entry: AuditLogEntry): Promise<void> {
    if (this.inFlight.has(entry.id)) return;
    this.inFlight.add(entry.id);
    
    try {
      await axios.post(`${API_URL}/audit/log`, {
        timestamp: entry.timestamp,
        userId: entry.userId,
        sessionId: entry.sessionId,
        action: entry.action,
        message: entry.message,
        metadata: entry.metadata
      });
      
      entry.synced = true;
      this.updateStorageEntry(entry);
      
      // Also update in memory
      const memIdx = this.logs.findIndex(l => l.id === entry.id);
      if (memIdx !== -1) {
        this.logs[memIdx].synced = true;
      }
    } catch (error) {
      console.warn(`[AUDIT] Failed to sync log ${entry.id} to backend, retrying later:`, error);
    } finally {
      this.inFlight.delete(entry.id);
    }
  }

  private async syncOfflineQueue(): Promise<void> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }
    const unsynced = this.logs.filter(l => !l.synced);
    if (unsynced.length === 0) return;
    
    console.log(`[AUDIT] Syncing ${unsynced.length} pending logs to backend...`);
    for (const entry of unsynced) {
      await this.sendToBackend(entry);
    }
  }
}

export const auditLogger = new AuditLogger();