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
  signature: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private readonly SECRET_KEY = 'medical-audit-key-2024';

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
      signature: this.generateSignature({ userId, sessionId, action, message, timestamp: new Date().toISOString() })
    };
    
    this.logs.push(entry);
    this.persistToStorage(entry);
    // BACKEND DISABLED - No API calls
    console.log(`[AUDIT] ${entry.timestamp} - ${action}: ${message.substring(0, 100)}`);
    return entry;
  }

  getSessionLogs(sessionId: string): AuditLogEntry[] {
    return this.logs.filter(log => log.sessionId === sessionId);
  }

  getUserLogs(userId: string): AuditLogEntry[] {
    return this.logs.filter(log => log.userId === userId);
  }

  verifyIntegrity(entry: AuditLogEntry): boolean {
    const expectedSignature = this.generateSignature({
      userId: entry.userId,
      sessionId: entry.sessionId,
      action: entry.action,
      message: entry.message,
      timestamp: entry.timestamp
    });
    return entry.signature === expectedSignature;
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['id', 'timestamp', 'userId', 'sessionId', 'action', 'message', 'metadata', 'signature'];
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
          log.signature
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

  private generateSignature(data: any): string {
    const stringData = JSON.stringify(data) + this.SECRET_KEY;
    let hash = 0;
    for (let i = 0; i < stringData.length; i++) {
      const char = stringData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
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

  // BACKEND CALLS COMPLETELY DISABLED
  private async sendToBackend(entry: AuditLogEntry): Promise<void> {
    // Silently ignored - backend not available
    return;
  }
}

export const auditLogger = new AuditLogger();