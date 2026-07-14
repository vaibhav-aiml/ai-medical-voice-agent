import { Medication, ReminderLog, UserNotificationPreference } from '../models/Reminder';
import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import { db } from '../config/database';
import { dbMedications, dbReminderLogs, dbUserPreferences } from '../db/schema/index';
import { eq, and } from 'drizzle-orm';

// Store active timeouts in-memory for active runtime execution
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
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  await db.insert(dbReminderLogs).values({
    id: logId,
    reminderId: medication.id,
    userId: medication.userId,
    scheduledTime: new Date(),
    sentTime: new Date(),
    status: status as any,
    channel: channel as any,
  });
}

function formatReminderMessage(medication: Medication): string {
  return `💊 Medication Reminder\n\nTime to take your medication!\n\nMedication: ${medication.name}\nDosage: ${medication.dosage}\n\nInstructions: ${medication.notes || 'Take as prescribed by your doctor'}\n\nStay healthy! 🌟`;
}

async function sendReminder(medication: Medication): Promise<void> {
  if (!emailTransporter) {
    initEmailTransporter();
  }
  
  const prefs = await getUserPreferences(medication.userId);
  
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

export async function addMedication(medication: any): Promise<Medication> {
  if (!emailTransporter) {
    initEmailTransporter();
  }
  
  const id = medication.id || `med_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const newMedication: Medication = {
    id,
    userId: medication.userId,
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency || 'daily',
    times: medication.times || ['09:00'],
    startDate: medication.startDate ? new Date(medication.startDate) : new Date(),
    endDate: medication.endDate ? new Date(medication.endDate) : undefined,
    quantity: medication.quantity,
    refillReminder: medication.refillReminder || false,
    refillThreshold: medication.refillThreshold,
    notes: medication.notes,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await db.insert(dbMedications).values({
    id: newMedication.id,
    userId: newMedication.userId,
    name: newMedication.name,
    dosage: newMedication.dosage,
    frequency: newMedication.frequency,
    times: newMedication.times,
    daysOfWeek: medication.daysOfWeek || null,
    startDate: newMedication.startDate,
    endDate: newMedication.endDate || null,
    quantity: newMedication.quantity || null,
    refillReminder: newMedication.refillReminder,
    refillThreshold: newMedication.refillThreshold || null,
    notes: newMedication.notes || null,
    active: newMedication.active,
    createdAt: newMedication.createdAt,
    updatedAt: newMedication.updatedAt,
  });
  
  scheduleAllRemindersForMedication(newMedication);
  logger.info(`Added medication: ${newMedication.name} for user ${newMedication.userId}`);
  return newMedication;
}

export async function getMedicationById(id: string): Promise<Medication | null> {
  const rows = await db.select().from(dbMedications).where(eq(dbMedications.id, id)).limit(1);
  if (rows.length === 0) return null;
  
  const row = rows[0];
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    dosage: row.dosage,
    frequency: row.frequency as any,
    times: row.times as string[],
    daysOfWeek: row.daysOfWeek as number[] | undefined,
    startDate: row.startDate,
    endDate: row.endDate || undefined,
    quantity: row.quantity || undefined,
    refillReminder: row.refillReminder,
    refillThreshold: row.refillThreshold || undefined,
    notes: row.notes || undefined,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getUserMedications(userId: string): Promise<Medication[]> {
  const rows = await db.select().from(dbMedications).where(
    and(
      eq(dbMedications.userId, userId),
      eq(dbMedications.active, true)
    )
  );
  
  return rows.map(row => ({
    id: row.id,
    userId: row.userId,
    name: row.name,
    dosage: row.dosage,
    frequency: row.frequency as any,
    times: row.times as string[],
    daysOfWeek: row.daysOfWeek as number[] | undefined,
    startDate: row.startDate,
    endDate: row.endDate || undefined,
    quantity: row.quantity || undefined,
    refillReminder: row.refillReminder,
    refillThreshold: row.refillThreshold || undefined,
    notes: row.notes || undefined,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function updateMedication(id: string, updates: any): Promise<Medication | null> {
  const med = await getMedicationById(id);
  if (!med) return null;
  
  clearRemindersForMedication(id);
  
  const updated = { ...med, ...updates, updatedAt: new Date() };
  
  await db.update(dbMedications)
    .set({
      name: updated.name,
      dosage: updated.dosage,
      frequency: updated.frequency,
      times: updated.times,
      daysOfWeek: updated.daysOfWeek || null,
      startDate: updated.startDate,
      endDate: updated.endDate || null,
      quantity: updated.quantity || null,
      refillReminder: updated.refillReminder,
      refillThreshold: updated.refillThreshold || null,
      notes: updated.notes || null,
      active: updated.active,
      updatedAt: updated.updatedAt,
    })
    .where(eq(dbMedications.id, id));
    
  scheduleAllRemindersForMedication(updated);
  return updated;
}

export async function deleteMedication(id: string): Promise<boolean> {
  const med = await getMedicationById(id);
  if (!med) return false;
  
  clearRemindersForMedication(id);
  
  await db.update(dbMedications)
    .set({
      active: false,
      updatedAt: new Date()
    })
    .where(eq(dbMedications.id, id));
    
  logger.info(`Deleted medication: ${med.name}`);
  return true;
}

export async function setUserPreferences(userId: string, prefs: any): Promise<UserNotificationPreference> {
  const existing = await getUserPreferences(userId) || {
    userId,
    emailEnabled: false,
    smsEnabled: false,
    whatsappEnabled: false,
    pushEnabled: false,
    reminderTime: '08:00',
  };
  
  const updated = { ...existing, ...prefs };
  
  await db.insert(dbUserPreferences)
    .values({
      userId: updated.userId,
      emailEnabled: updated.emailEnabled,
      emailAddress: updated.emailAddress || null,
      smsEnabled: updated.smsEnabled,
      phoneNumber: updated.phoneNumber || null,
      whatsappEnabled: updated.whatsappEnabled,
      pushEnabled: updated.pushEnabled,
      reminderTime: updated.reminderTime,
    })
    .onConflictDoUpdate({
      target: dbUserPreferences.userId,
      set: {
        emailEnabled: updated.emailEnabled,
        emailAddress: updated.emailAddress || null,
        smsEnabled: updated.smsEnabled,
        phoneNumber: updated.phoneNumber || null,
        whatsappEnabled: updated.whatsappEnabled,
        pushEnabled: updated.pushEnabled,
        reminderTime: updated.reminderTime,
      }
    });
    
  logger.info(`Updated preferences for user ${userId}: email=${updated.emailEnabled}`);
  return updated;
}

export async function getUserPreferences(userId: string): Promise<UserNotificationPreference | null> {
  const rows = await db.select().from(dbUserPreferences).where(eq(dbUserPreferences.userId, userId)).limit(1);
  if (rows.length === 0) return null;
  
  const row = rows[0];
  return {
    userId: row.userId,
    emailEnabled: row.emailEnabled,
    emailAddress: row.emailAddress || undefined,
    smsEnabled: row.smsEnabled,
    phoneNumber: row.phoneNumber || undefined,
    whatsappEnabled: row.whatsappEnabled,
    pushEnabled: row.pushEnabled,
    reminderTime: row.reminderTime,
  };
}

export async function acknowledgeReminder(reminderId: string, userId: string): Promise<boolean> {
  const rows = await db.select()
    .from(dbReminderLogs)
    .where(
      and(
        eq(dbReminderLogs.reminderId, reminderId),
        eq(dbReminderLogs.userId, userId),
        eq(dbReminderLogs.status, 'sent')
      )
    )
    .limit(1);
    
  if (rows.length > 0) {
    await db.update(dbReminderLogs)
      .set({
        status: 'acknowledged',
        acknowledgedTime: new Date()
      })
      .where(eq(dbReminderLogs.id, rows[0].id));
    logger.info(`Reminder acknowledged: ${reminderId}`);
    return true;
  }
  return false;
}

export async function getReminderStats(userId: string): Promise<any> {
  const logs = await db.select().from(dbReminderLogs).where(eq(dbReminderLogs.userId, userId));
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

export async function rescheduleAllReminders(): Promise<void> {
  logger.info('Rescheduling all reminders...');
  const rows = await db.select().from(dbMedications).where(eq(dbMedications.active, true));
  for (const row of rows) {
    const medication: Medication = {
      id: row.id,
      userId: row.userId,
      name: row.name,
      dosage: row.dosage,
      frequency: row.frequency as any,
      times: row.times as string[],
      daysOfWeek: row.daysOfWeek as number[] | undefined,
      startDate: row.startDate,
      endDate: row.endDate || undefined,
      quantity: row.quantity || undefined,
      refillReminder: row.refillReminder,
      refillThreshold: row.refillThreshold || undefined,
      notes: row.notes || undefined,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    scheduleAllRemindersForMedication(medication);
  }
}

export async function forceSendReminder(medicationId: string): Promise<boolean> {
  const medication = await getMedicationById(medicationId);
  if (!medication) return false;
  await sendReminder(medication);
  return true;
}

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