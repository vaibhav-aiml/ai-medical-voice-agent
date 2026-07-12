import { Medication, ReminderLog, UserNotificationPreference } from '../models/Reminder';
import nodemailer from 'nodemailer';
import logger from '../utils/logger';

// In-memory storage
const medications: Map<string, Medication> = new Map();
const reminderLogs: Map<string, ReminderLog[]> = new Map();
const userPreferences: Map<string, UserNotificationPreference> = new Map();

// Store active timeouts
const activeTimeouts: Map<string, NodeJS.Timeout> = new Map();

let emailTransporter: nodemailer.Transporter | null = null;

function initEmailTransporter(): void {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (emailUser && emailPass && emailPass.length > 10) {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    logger.info('Email transporter initialized in reminder service');
  } else {
    logger.warn('Email transporter not configured in reminder service - missing credentials');
  }
}

// Initialize on module load
initEmailTransporter();

// Helper functions for reminder scheduling
function clearRemindersForMedication(medicationId: string): void {
  for (const [key, timeout] of activeTimeouts) {
    if (key.startsWith(medicationId)) {
      clearTimeout(timeout);
      activeTimeouts.delete(key);
    }
  }
}

async function logReminder(medication: Medication, status: string, channel: string): Promise<void> {
  const log: ReminderLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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

function formatReminderMessage(medication: Medication): string {
  return `💊 Medication Reminder\n\nTime to take your medication!\n\nMedication: ${medication.name}\nDosage: ${medication.dosage}\n\nInstructions: ${medication.notes || 'Take as prescribed by your doctor'}\n\nStay healthy! 🌟`;
}

async function sendReminder(medication: Medication): Promise<void> {
  if (!emailTransporter) {
    initEmailTransporter();
  }
  
  const prefs = userPreferences.get(medication.userId);
  
  if (!prefs || !prefs.emailEnabled || !prefs.emailAddress) {
    logger.warn(`No email preferences configured for user ${medication.userId}`);
    return;
  }

  if (!emailTransporter) {
    logger.warn('Email transporter not configured - cannot send email reminder');
    return;
  }

  const message = formatReminderMessage(medication);
  
  try {
    await emailTransporter.sendMail({
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
    
    await logReminder(medication, 'sent', 'email');
    logger.info(`Email reminder sent for ${medication.name} to ${prefs.emailAddress}`);
    
  } catch (error: any) {
    logger.error(`Failed to send email reminder for ${medication.name}`, { error: error.message });
    await logReminder(medication, 'missed', 'email');
  }
}

function scheduleReminder(medication: Medication, scheduledTime: Date): void {
  const delay = scheduledTime.getTime() - Date.now();
  
  if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
    const timeoutId = setTimeout(async () => {
      await sendReminder(medication);
      
      const nextTime = new Date(scheduledTime);
      nextTime.setDate(nextTime.getDate() + 1);
      scheduleReminder(medication, nextTime);
    }, delay);
    
    const key = `${medication.id}_${scheduledTime.getTime()}`;
    activeTimeouts.set(key, timeoutId);
    logger.info(`Scheduled reminder for ${medication.name} at ${scheduledTime.toLocaleString()}`);
  }
}

function scheduleAllRemindersForMedication(medication: Medication): void {
  const now = new Date();
  
  for (const timeStr of medication.times) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    scheduleReminder(medication, scheduledTime);
  }
}

// Exported pure functions
export function addMedication(medication: any): Medication {
  if (!emailTransporter) {
    initEmailTransporter();
  }
  
  const newMedication: Medication = {
    id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
  
  scheduleAllRemindersForMedication(newMedication);
  logger.info(`Added medication: ${newMedication.name} for user ${newMedication.userId}`);
  return newMedication;
}

export function getMedicationById(id: string): Medication | null {
  return medications.get(id) || null;
}

export function getUserMedications(userId: string): Medication[] {
  const result: Medication[] = [];
  for (const med of medications.values()) {
    if (med.userId === userId && med.active) {
      result.push(med);
    }
  }
  return result;
}

export function updateMedication(id: string, updates: any): Medication | null {
  const med = medications.get(id);
  if (!med) return null;
  
  clearRemindersForMedication(id);
  
  const updated = { ...med, ...updates, updatedAt: new Date() };
  medications.set(id, updated);
  
  scheduleAllRemindersForMedication(updated);
  return updated;
}

export function deleteMedication(id: string): boolean {
  const med = medications.get(id);
  if (!med) return false;
  
  clearRemindersForMedication(id);
  
  med.active = false;
  medications.set(id, med);
  logger.info(`Deleted medication: ${med.name}`);
  return true;
}

export function setUserPreferences(userId: string, prefs: any): UserNotificationPreference {
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
  logger.info(`Updated preferences for user ${userId}: email=${updated.emailEnabled}, address=${updated.emailAddress}`);
  return updated;
}

export function getUserPreferences(userId: string): UserNotificationPreference | null {
  return userPreferences.get(userId) || null;
}

export function acknowledgeReminder(reminderId: string, userId: string): boolean {
  const logs = reminderLogs.get(userId) || [];
  const log = logs.find(l => l.reminderId === reminderId);
  if (log && log.status === 'sent') {
    log.status = 'acknowledged';
    log.acknowledgedTime = new Date();
    logger.info(`Reminder acknowledged: ${reminderId}`);
    return true;
  }
  return false;
}

export function getReminderStats(userId: string): any {
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

export function rescheduleAllReminders(): void {
  logger.info('Rescheduling all reminders...');
  for (const medication of medications.values()) {
    if (medication.active) {
      scheduleAllRemindersForMedication(medication);
    }
  }
}

export async function forceSendReminder(medicationId: string): Promise<boolean> {
  const medication = medications.get(medicationId);
  if (!medication) return false;
  await sendReminder(medication);
  return true;
}

// Backward-compatible default export object
export const reminderService = {
  addMedication,
  getMedicationById,
  getUserMedications,
  updateMedication,
  deleteMedication,
  setUserPreferences,
  getUserPreferences,
  acknowledgeReminder,
  getReminderStats,
  rescheduleAllReminders,
  forceSendReminder,
};

// Reschedule reminders when server starts
setTimeout(() => {
  rescheduleAllReminders();
}, 5000);