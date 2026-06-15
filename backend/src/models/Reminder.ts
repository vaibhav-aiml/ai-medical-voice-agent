export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'twice_daily' | 'thrice_daily' | 'weekly' | 'custom';
  times: string[];
  daysOfWeek?: number[];
  startDate: Date;
  endDate?: Date;
  quantity?: number;
  refillReminder?: boolean;
  refillThreshold?: number;
  notes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderLog {
  id: string;
  reminderId: string;
  userId: string;
  scheduledTime: Date;
  sentTime?: Date;
  acknowledgedTime?: Date;
  status: 'pending' | 'sent' | 'acknowledged' | 'missed' | 'cancelled';
  channel: 'sms' | 'whatsapp' | 'email' | 'push' | 'none';
  response?: string;
}

export interface UserNotificationPreference {
  userId: string;
  emailEnabled: boolean;
  emailAddress?: string;
  smsEnabled: boolean;
  phoneNumber?: string;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  reminderTime: string;
}