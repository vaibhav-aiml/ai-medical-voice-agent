import { Medication, ReminderLog, UserNotificationPreference } from '../models/Reminder';
import nodemailer from 'nodemailer';

// In-memory storage
const medications: Map<string, Medication> = new Map();
const reminderLogs: Map<string, ReminderLog[]> = new Map();
const userPreferences: Map<string, UserNotificationPreference> = new Map();

// Store active timeouts
const activeTimeouts: Map<string, NodeJS.Timeout> = new Map();

class ReminderService {
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initEmailTransporter();
  }

  private initEmailTransporter(): void {
    // Reload environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    console.log(`📧 Email config check - USER: ${emailUser ? '✅ Set' : '❌ Missing'}, PASS: ${emailPass ? '✅ Set' : '❌ Missing'}`);
    
    if (emailUser && emailPass && emailPass.length > 10) {
      this.emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
      console.log('✅ Email transporter initialized in reminder service');
    } else {
      console.log('⚠️ Email transporter not configured - missing credentials');
    }
  }

  // Add a new medication
  addMedication(medication: any): Medication {
    // Re-initialize email transporter if needed
    if (!this.emailTransporter) {
      this.initEmailTransporter();
    }
    
    const newMedication: Medication = {
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: medication.userId,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency || 'daily',
      times: medication.times || ['09:00'],
      startDate: new Date(),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: medication.notes,
    };
    medications.set(newMedication.id, newMedication);
    
    this.scheduleAllRemindersForMedication(newMedication);
    
    console.log(`💊 Added medication: ${newMedication.name} for user ${newMedication.userId}`);
    return newMedication;
  }

  getMedicationById(id: string): Medication | null {
    return medications.get(id) || null;
  }

  getUserMedications(userId: string): Medication[] {
    const result: Medication[] = [];
    for (const med of medications.values()) {
      if (med.userId === userId && med.active) {
        result.push(med);
      }
    }
    return result;
  }

  updateMedication(id: string, updates: any): Medication | null {
    const med = medications.get(id);
    if (!med) return null;
    
    this.clearRemindersForMedication(id);
    
    const updated = { ...med, ...updates, updatedAt: new Date() };
    medications.set(id, updated);
    
    this.scheduleAllRemindersForMedication(updated);
    
    return updated;
  }

  deleteMedication(id: string): boolean {
    const med = medications.get(id);
    if (!med) return false;
    
    this.clearRemindersForMedication(id);
    
    med.active = false;
    medications.set(id, med);
    console.log(`🗑️ Deleted medication: ${med.name}`);
    return true;
  }

  private clearRemindersForMedication(medicationId: string): void {
    for (const [key, timeout] of activeTimeouts) {
      if (key.startsWith(medicationId)) {
        clearTimeout(timeout);
        activeTimeouts.delete(key);
      }
    }
  }

  private scheduleAllRemindersForMedication(medication: Medication): void {
    const now = new Date();
    
    for (const timeStr of medication.times) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      this.scheduleReminder(medication, scheduledTime);
    }
  }

  private scheduleReminder(medication: Medication, scheduledTime: Date): void {
    const delay = scheduledTime.getTime() - Date.now();
    
    if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
      const timeoutId = setTimeout(async () => {
        await this.sendReminder(medication);
        
        const nextTime = new Date(scheduledTime);
        nextTime.setDate(nextTime.getDate() + 1);
        this.scheduleReminder(medication, nextTime);
      }, delay);
      
      const key = `${medication.id}_${scheduledTime.getTime()}`;
      activeTimeouts.set(key, timeoutId);
      console.log(`⏰ Scheduled reminder for ${medication.name} at ${scheduledTime.toLocaleString()}`);
    }
  }

  private async sendReminder(medication: Medication): Promise<void> {
    // Re-initialize email transporter if needed
    if (!this.emailTransporter) {
      this.initEmailTransporter();
    }
    
    const prefs = userPreferences.get(medication.userId);
    
    console.log(`🔍 Checking reminder for ${medication.name} - Email prefs:`, prefs?.emailEnabled, prefs?.emailAddress);
    
    if (!prefs || !prefs.emailEnabled || !prefs.emailAddress) {
      console.log(`⚠️ No email preferences for user ${medication.userId}`);
      return;
    }

    if (!this.emailTransporter) {
      console.log('⚠️ Email transporter not configured - cannot send email');
      return;
    }

    const message = this.formatReminderMessage(medication);
    
    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: prefs.emailAddress,
        subject: `💊 Medication Reminder: ${medication.name}`,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #8b5cf6;">💊 Medication Reminder</h2>
          <p>Time to take your medication!</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 10px;">
            <p><strong>Medication:</strong> ${medication.name}</p>
            <p><strong>Dosage:</strong> ${medication.dosage}</p>
            <p><strong>Instructions:</strong> ${medication.notes || 'Take as prescribed by your doctor'}</p>
          </div>
          <p style="color: #6b7280; margin-top: 20px;">Stay healthy! 🌟</p>
        </div>`,
      });
      
      await this.logReminder(medication, 'sent', 'email');
      console.log(`📧 Email reminder sent for ${medication.name} to ${prefs.emailAddress}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to send email for ${medication.name}:`, error.message);
      await this.logReminder(medication, 'missed', 'email');
    }
  }

  private formatReminderMessage(medication: Medication): string {
    return `💊 Medication Reminder\n\nTime to take your medication!\n\nMedication: ${medication.name}\nDosage: ${medication.dosage}\n\nInstructions: ${medication.notes || 'Take as prescribed by your doctor'}\n\nStay healthy! 🌟`;
  }

  private async logReminder(medication: Medication, status: string, channel: string): Promise<void> {
    const log: ReminderLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reminderId: medication.id,
      userId: medication.userId,
      scheduledTime: new Date(),
      sentTime: new Date(),
      status: status as any,
      channel: channel as any,
    };
    
    const userLogs = reminderLogs.get(medication.userId) || [];
    userLogs.push(log);
    reminderLogs.set(medication.userId, userLogs);
  }

  setUserPreferences(userId: string, prefs: any): UserNotificationPreference {
    const existing = userPreferences.get(userId) || {
      userId,
      emailEnabled: false,
      smsEnabled: false,
      whatsappEnabled: false,
      pushEnabled: false,
      reminderTime: '08:00',
    };
    
    const updated = { ...existing, ...prefs };
    userPreferences.set(userId, updated);
    console.log(`📧 Updated preferences for user ${userId}: email=${updated.emailEnabled}, address=${updated.emailAddress}`);
    return updated;
  }

  getUserPreferences(userId: string): UserNotificationPreference | null {
    return userPreferences.get(userId) || null;
  }

  acknowledgeReminder(reminderId: string, userId: string): boolean {
    const logs = reminderLogs.get(userId) || [];
    const log = logs.find(l => l.reminderId === reminderId);
    if (log && log.status === 'sent') {
      log.status = 'acknowledged';
      log.acknowledgedTime = new Date();
      console.log(`✅ Reminder acknowledged: ${reminderId}`);
      return true;
    }
    return false;
  }

  getReminderStats(userId: string): any {
    const logs = reminderLogs.get(userId) || [];
    const total = logs.length;
    const acknowledged = logs.filter(l => l.status === 'acknowledged').length;
    const missed = logs.filter(l => l.status === 'missed').length;
    return {
      total,
      acknowledged,
      missed,
      adherenceRate: total > 0 ? (acknowledged / total) * 100 : 0,
    };
  }

  rescheduleAllReminders(): void {
    console.log('🔄 Rescheduling all reminders...');
    for (const medication of medications.values()) {
      if (medication.active) {
        this.scheduleAllRemindersForMedication(medication);
      }
    }
  }

  // Force send a reminder immediately (for testing)
  async forceSendReminder(medicationId: string): Promise<boolean> {
    const medication = medications.get(medicationId);
    if (!medication) return false;
    await this.sendReminder(medication);
    return true;
  }
}

export const reminderService = new ReminderService();

// Reschedule reminders when server starts
setTimeout(() => {
  reminderService.rescheduleAllReminders();
}, 5000);