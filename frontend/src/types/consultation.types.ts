export interface Specialist {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
}

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ConsultationSession {
  id: string;
  specialistType: string;
  specialistName: string;
  status: 'active' | 'completed';
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  symptoms?: string;
  notes?: string;
}

export interface MedicalReport {
  id: string;
  consultationId: string;
  diagnosis: string;
  recommendations: string[];
  medications: string[];
  followUpNeeded: boolean;
  followUpDate?: Date;
  generatedAt: Date;
  reportUrl?: string;
}

export interface DashboardStats {
  totalConsultations: number;
  completedConsultations: number;
  averageDuration: number;
  pendingFollowUps: number;
}