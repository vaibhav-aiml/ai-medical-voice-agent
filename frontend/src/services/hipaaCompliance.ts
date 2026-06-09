export interface PHIData {
  type: 'name' | 'email' | 'phone' | 'address' | 'ssn' | 'medical_record' | 'diagnosis';
  value: string;
  accessReason: string;
  accessedBy: string;
  timestamp: Date;
}

class HIPAACompliance {
  private phiAccessLogs: PHIData[] = [];

  logPHIAccess(data: PHIData): void {
    this.phiAccessLogs.push(data);
    console.warn(`[HIPAA LOG] ${data.type} accessed by ${data.accessedBy} for: ${data.accessReason}`);
    // BACKEND DISABLED - No API calls
  }

  anonymizeForAI(text: string): string {
    let anonymized = text;
    anonymized = anonymized.replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,}\b/g, '[EMAIL REDACTED]');
    anonymized = anonymized.replace(/\b\d{10}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE REDACTED]');
    anonymized = anonymized.replace(/\b(?:Dr\.|Mr\.|Mrs\.|Ms\.)\s+[A-Z][a-z]+\b/g, '[NAME REDACTED]');
    anonymized = anonymized.replace(/\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b/gi, '[ADDRESS REDACTED]');
    return anonymized;
  }

  containsPHI(text: string): boolean {
    const phiPatterns = [
      /\b[\w\.-]+@[\w\.-]+\.\w{2,}\b/,
      /\b\d{10}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      /\b\d{3}-\d{2}-\d{4}\b/,
    ];
    return phiPatterns.some(pattern => pattern.test(text));
  }

  getPHIAccessReport(startDate: Date, endDate: Date): PHIData[] {
    return this.phiAccessLogs.filter(log => 
      log.timestamp >= startDate && log.timestamp <= endDate
    );
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
}

export const hipaaCompliance = new HIPAACompliance();