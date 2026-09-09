import crypto from 'crypto';
import { Clinic, ClinicDoctor, ClinicPatient, ClinicAppointment, ClinicSettings, ClinicBranding } from '../models/Clinic';
import logger from '../utils/logger';
const clinics: Map<string, Clinic> = new Map();
const clinicDoctors: Map<string, ClinicDoctor[]> = new Map();
const clinicPatients: Map<string, ClinicPatient[]> = new Map();
const clinicAppointments: Map<string, ClinicAppointment[]> = new Map();
const clinicSettings: Map<string, ClinicSettings> = new Map();
const clinicBranding: Map<string, ClinicBranding> = new Map();
function getDefaultSettings(clinicId: string): ClinicSettings {
  return {
    id: `settings_${Date.now()}`,
    clinicId,
    enableOnlinePayments: false,
    enableSmsNotifications: false,
    enableEmailNotifications: true,
    enableWhatsAppNotifications: false,
    workingHours: {
      monday: { start: '09:00', end: '17:00', isOpen: true },
      tuesday: { start: '09:00', end: '17:00', isOpen: true },
      wednesday: { start: '09:00', end: '17:00', isOpen: true },
      thursday: { start: '09:00', end: '17:00', isOpen: true },
      friday: { start: '09:00', end: '17:00', isOpen: true },
      saturday: { start: '09:00', end: '13:00', isOpen: true },
      sunday: { start: '09:00', end: '13:00', isOpen: false },
    },
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
  };
}

function getDefaultBranding(clinicId: string): ClinicBranding {
  return {
    id: `branding_${Date.now()}`,
    clinicId,
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    accentColor: '#8b5cf6',
    fontFamily: 'Inter, system-ui, sans-serif',
    buttonStyle: 'rounded',
    cardStyle: 'elevated',
    logoUrl: '',
    faviconUrl: '',
  };
}
export function createClinic(data: Omit<Clinic, 'id' | 'createdAt' | 'updatedAt'> & { ownerId?: string }): Clinic {
  const clinic: Clinic = {
    id: `clinic_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    ...data,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  clinics.set(clinic.id, clinic);
  logger.info(`New clinic created: ${clinic.name} (${clinic.subdomain})`);
  return clinic;
}

export function getClinicBySubdomain(subdomain: string): Clinic | null {
  for (const clinic of clinics.values()) {
    if (clinic.subdomain === subdomain && clinic.isActive) {
      return clinic;
    }
  }
  return null;
}

export function getClinicById(id: string): Clinic | null {
  return clinics.get(id) || null;
}

export function updateClinic(id: string, updates: Partial<Clinic>): Clinic | null {
  const clinic = clinics.get(id);
  if (!clinic) return null;
  const updated = { ...clinic, ...updates, updatedAt: new Date() };
  clinics.set(id, updated);
  return updated;
}

export function addDoctor(clinicId: string, doctor: Omit<ClinicDoctor, 'id' | 'createdAt'>): ClinicDoctor {
  const newDoctor: ClinicDoctor = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    clinicId,
    ...doctor,
    createdAt: new Date(),
  };
  
  const doctors = clinicDoctors.get(clinicId) || [];
  doctors.push(newDoctor);
  clinicDoctors.set(clinicId, doctors);
  return newDoctor;
}

export function getClinicDoctors(clinicId: string): ClinicDoctor[] {
  return clinicDoctors.get(clinicId) || [];
}

export function updateDoctor(clinicId: string, doctorId: string, updates: Partial<ClinicDoctor>): ClinicDoctor | null {
  const doctors = clinicDoctors.get(clinicId) || [];
  const index = doctors.findIndex(d => d.id === doctorId);
  if (index === -1) return null;
  doctors[index] = { ...doctors[index], ...updates };
  clinicDoctors.set(clinicId, doctors);
  return doctors[index];
}

export function deleteDoctor(clinicId: string, doctorId: string): boolean {
  const doctors = clinicDoctors.get(clinicId) || [];
  const initialLength = doctors.length;
  const filtered = doctors.filter(d => d.id !== doctorId);
  if (filtered.length === initialLength) return false;
  clinicDoctors.set(clinicId, filtered);
  return true;
}

export function syncDoctors(clinicId: string, incomingDoctors: ClinicDoctor[]): ClinicDoctor[] {
  const existing = clinicDoctors.get(clinicId) || [];
  const doctorMap = new Map(existing.map(d => [d.id, d]));

  for (const doc of incomingDoctors) {
    const docId = doc.id || crypto.randomUUID();
    if (doctorMap.has(docId)) {
      const current = doctorMap.get(docId)!;
      doctorMap.set(docId, { ...current, ...doc, id: docId, clinicId });
    } else {
      doctorMap.set(docId, {
        ...doc,
        id: docId,
        clinicId,
        createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date()
      });
    }
  }

  const merged = Array.from(doctorMap.values());
  clinicDoctors.set(clinicId, merged);
  return merged;
}

export function syncAppointments(clinicId: string, incomingAppointments: ClinicAppointment[]): ClinicAppointment[] {
  const existing = clinicAppointments.get(clinicId) || [];
  const aptMap = new Map(existing.map(a => [a.id, a]));

  for (const apt of incomingAppointments) {
    const aptId = apt.id || crypto.randomUUID();
    if (aptMap.has(aptId)) {
      const current = aptMap.get(aptId)!;
      aptMap.set(aptId, { ...current, ...apt, id: aptId, clinicId });
    } else {
      aptMap.set(aptId, {
        ...apt,
        id: aptId,
        clinicId,
        createdAt: apt.createdAt ? new Date(apt.createdAt) : new Date()
      });
    }
  }

  const merged = Array.from(aptMap.values());
  clinicAppointments.set(clinicId, merged);
  return merged;
}

export function addPatient(clinicId: string, patient: Omit<ClinicPatient, 'id' | 'createdAt' | 'patientId'>): ClinicPatient {
  const clinic = clinics.get(clinicId);
  if (!clinic) throw new Error('Clinic not found');
  
  const patients = clinicPatients.get(clinicId) || [];
  const patientId = `${clinic.subdomain.toUpperCase()}-${(patients.length + 1).toString().padStart(4, '0')}`;
  
  const newPatient: ClinicPatient = {
    id: `patient_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    clinicId,
    patientId,
    ...patient,
    createdAt: new Date(),
  };
  
  patients.push(newPatient);
  clinicPatients.set(clinicId, patients);
  return newPatient;
}

export function getClinicPatients(clinicId: string): ClinicPatient[] {
  return clinicPatients.get(clinicId) || [];
}

export function bookAppointment(data: Omit<ClinicAppointment, 'id' | 'createdAt'>): ClinicAppointment {
  const appointment: ClinicAppointment = {
    id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    ...data,
    createdAt: new Date(),
  };
  
  const appointments = clinicAppointments.get(data.clinicId) || [];
  appointments.push(appointment);
  clinicAppointments.set(data.clinicId, appointments);
  return appointment;
}

export function getClinicAppointments(clinicId: string): ClinicAppointment[] {
  return clinicAppointments.get(clinicId) || [];
}

export function getAppointmentsByDoctor(clinicId: string, doctorId: string): ClinicAppointment[] {
  const appointments = clinicAppointments.get(clinicId) || [];
  return appointments.filter(a => a.doctorId === doctorId);
}

export function getAppointmentClinicId(appointmentId: string): string | null {
  for (const [clinicId, appointments] of clinicAppointments) {
    if (appointments.some(a => a.id === appointmentId)) {
      return clinicId;
    }
  }
  return null;
}

export function updateAppointmentStatus(appointmentId: string, status: ClinicAppointment['status']): boolean {
  for (const [clinicId, appointments] of clinicAppointments) {
    const index = appointments.findIndex(a => a.id === appointmentId);
    if (index !== -1) {
      appointments[index].status = status;
      clinicAppointments.set(clinicId, appointments);
      return true;
    }
  }
  return false;
}

export function getClinicSettings(clinicId: string): ClinicSettings | null {
  return clinicSettings.get(clinicId) || null;
}

export function updateClinicSettings(clinicId: string, settings: Partial<ClinicSettings>): ClinicSettings {
  const existing = clinicSettings.get(clinicId) || getDefaultSettings(clinicId);
  const updated = { ...existing, ...settings };
  clinicSettings.set(clinicId, updated);
  return updated;
}

export function getClinicBranding(clinicId: string): ClinicBranding | null {
  return clinicBranding.get(clinicId) || null;
}

export function updateClinicBranding(clinicId: string, branding: Partial<ClinicBranding>): ClinicBranding {
  const existing = clinicBranding.get(clinicId) || getDefaultBranding(clinicId);
  const updated = { ...existing, ...branding };
  clinicBranding.set(clinicId, updated);
  return updated;
}

export function getClinicStats(clinicId: string): any {
  const doctors = clinicDoctors.get(clinicId) || [];
  const patients = clinicPatients.get(clinicId) || [];
  const appointments = clinicAppointments.get(clinicId) || [];
  
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  
  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(a => new Date(a.date).toDateString() === today);
  
  return {
    totalDoctors: doctors.length,
    totalPatients: patients.length,
    totalAppointments: appointments.length,
    completedAppointments: completedAppointments.length,
    cancelledAppointments: cancelledAppointments.length,
    pendingAppointments: pendingAppointments.length,
    todayAppointments: todayAppointments.length,
    completionRate: appointments.length > 0 ? (completedAppointments.length / appointments.length) * 100 : 0,
  };
}
export const clinicService = {
  createClinic,
  getClinicBySubdomain,
  getClinicById,
  updateClinic,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  syncDoctors,
  syncAppointments,
  getClinicDoctors,
  addPatient,
  getClinicPatients,
  bookAppointment,
  getClinicAppointments,
  getAppointmentsByDoctor,
  getAppointmentClinicId,
  updateAppointmentStatus,
  getClinicSettings,
  updateClinicSettings,
  getClinicBranding,
  updateClinicBranding,
  getClinicStats,
};