import axios from 'axios';
import { API_URL } from '../config/api';

export interface PHIData {
  id?: string;
  type: 'name' | 'email' | 'phone' | 'address' | 'ssn' | 'medical_record' | 'diagnosis' | 'redaction';
  value: string;
  accessReason: string;
  accessedBy: string;
  timestamp: string | Date;
  synced?: boolean;
}

export const PHI_PATTERNS = [
  { id: 'email', label: '[EMAIL REDACTED]', regex: /\b[\w\.-]+@[\w\.-]+\.\w{2,}\b/gi },
  { id: 'phone', label: '[PHONE REDACTED]', regex: /\b(?:\+?\d{1,3}[ -.]?)?\(?\d{3}\)?[ -.]?\d{3}[ -.]?\d{4}\b/g },
  { id: 'ssn', label: '[SSN REDACTED]', regex: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g },
  { id: 'mrn', label: '[MRN REDACTED]', regex: /\b(?:MRN|Medical Record Number|Medical Record)\s*[:#]?\s*[A-Z0-9-]{6,15}\b/gi },
  { id: 'insurance', label: '[INSURANCE REDACTED]', regex: /\b(?:Insurance|Policy|Beneficiary|Health Plan)\s*[:#]?\s*[A-Z0-9-]{6,20}\b/gi },
  { id: 'account', label: '[ACCOUNT REDACTED]', regex: /\b(?:Account|Acc)\s*[:#]?\s*[A-Z0-9-]{8,18}\b/gi },
  { id: 'license', label: '[LICENSE REDACTED]', regex: /\b(?:Driver\'s License|DL|License|Certificate)\s*[:#]?\s*[A-Z0-9-]{6,15}\b/gi },
  { id: 'dob', label: '[DATE REDACTED]', regex: /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?,? \d{2,4}\b/gi },
  { id: 'zip', label: '[ZIP REDACTED]', regex: /\b\d{5}(?:-\d{4})?\b/g },
  { id: 'address', label: '[ADDRESS REDACTED]', regex: /\b\d+\s+[A-Za-z0-9\s.,#-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way|Lane|Ln|Court|Ct|Circle|Cir)\b/gi },
  { id: 'ip', label: '[IP REDACTED]', regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g },
  { id: 'url', label: '[URL REDACTED]', regex: /\bhttps?:\/\/[^\s$.?#].[^\s]*\b/gi },
  { id: 'prescription', label: '[PRESCRIPTION REDACTED]', regex: /\b(?:Prescription|Rx|RxID)\s*[:#]?\s*[A-Z0-9-]{6,15}\b/gi },
  { id: 'appointment', label: '[APPOINTMENT REDACTED]', regex: /\b(?:Appointment|Appt|ApptID)\s*[:#]?\s*[A-Z0-9-]{6,15}\b/gi },
  { id: 'name', label: '[NAME REDACTED]', regex: /\b(?:Dr\.|Mr\.|Mrs\.|Ms\.)\s+[A-Z][a-z]+\b|\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g }
];

class HIPAACompliance {
  private phiAccessLogs: PHIData[] = [];
  private inFlight: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.syncOfflineQueue());
      setInterval(() => this.syncOfflineQueue(), 30000);
    }
  }

  logPHIAccess(data: PHIData): void {
    const entry: PHIData = {
      ...data,
      id: data.id || `hipaa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: data.timestamp || new Date(),
      synced: false
    };

    this.phiAccessLogs.push(entry);
    this.persistToStorage(entry);
    
    console.warn(`[HIPAA LOG] ${entry.type} accessed by ${entry.accessedBy} for: ${entry.accessReason}`);
    
    // Attempt asynchronous push to backend
    this.sendToBackend(entry);
  }

  anonymizeForAI(text: string): string {
    if (!text) return text;
    let redacted = text;
    for (const p of PHI_PATTERNS) {
      const rx = new RegExp(p.regex);
      redacted = redacted.replace(rx, p.label);
    }
    return redacted;
  }

  containsPHI(text: string): boolean {
    if (!text) return false;
    return PHI_PATTERNS.some(p => {
      const rx = new RegExp(p.regex);
      return rx.test(text);
    });
  }

  getPHIAccessReport(startDate: Date, endDate: Date): PHIData[] {
    return this.phiAccessLogs.filter(log => {
      const ts = new Date(log.timestamp);
      return ts >= startDate && ts <= endDate;
    });
  }

  minimizeData(data: any, requiredFields: string[]): any {
    const minimized: any = {};
    for (const field of requiredFields) {
      if (data[field] !== undefined) {
        minimized[field] = data[field];
      }
    }
    return minimized;
  }

  private loadFromStorage(): void {
    try {
      const existing = localStorage.getItem('hipaa_logs');
      if (existing) {
        this.phiAccessLogs = JSON.parse(existing);
      }
    } catch (error) {
      console.error('Failed to load HIPAA logs from localStorage:', error);
    }
  }

  private persistToStorage(entry: PHIData): void {
    try {
      const existing = localStorage.getItem('hipaa_logs');
      const logs = existing ? JSON.parse(existing) : [];
      logs.push(entry);
      if (logs.length > 1000) {
        logs.shift();
      }
      localStorage.setItem('hipaa_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to persist HIPAA log:', error);
    }
  }

  private updateStorageEntry(entry: PHIData): void {
    try {
      const existing = localStorage.getItem('hipaa_logs');
      if (existing) {
        const logs: PHIData[] = JSON.parse(existing);
        const idx = logs.findIndex(l => l.id === entry.id);
        if (idx !== -1) {
          logs[idx] = entry;
          localStorage.setItem('hipaa_logs', JSON.stringify(logs));
        }
      }
    } catch (error) {
      console.error('Failed to update HIPAA log status in storage:', error);
    }
  }

  private async sendToBackend(entry: PHIData): Promise<void> {
    if (!entry.id || this.inFlight.has(entry.id)) return;
    this.inFlight.add(entry.id);
    
    try {
      await axios.post(`${API_URL}/hipaa/log`, {
        type: entry.type,
        value: entry.value,
        accessReason: entry.accessReason,
        accessedBy: entry.accessedBy,
        timestamp: entry.timestamp
      });
      
      entry.synced = true;
      this.updateStorageEntry(entry);
      
      // Update in memory
      const memIdx = this.phiAccessLogs.findIndex(l => l.id === entry.id);
      if (memIdx !== -1) {
        this.phiAccessLogs[memIdx].synced = true;
      }
    } catch (error) {
      console.warn(`[HIPAA] Failed to sync log ${entry.id} to backend, retrying later:`, error);
    } finally {
      if (entry.id) {
        this.inFlight.delete(entry.id);
      }
    }
  }

  private async syncOfflineQueue(): Promise<void> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }
    const unsynced = this.phiAccessLogs.filter(l => !l.synced);
    if (unsynced.length === 0) return;
    
    console.log(`[HIPAA] Syncing ${unsynced.length} pending logs to backend...`);
    for (const entry of unsynced) {
      await this.sendToBackend(entry);
    }
  }
}

export const hipaaCompliance = new HIPAACompliance();