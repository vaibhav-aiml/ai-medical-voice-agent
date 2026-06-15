import { Clinic, ClinicDoctor, ClinicPatient, ClinicAppointment, ClinicSettings, ClinicBranding } from '../models/Clinic';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with PostgreSQL in production)
const clinics: Map<string, Clinic> = new Map();
const clinicDoctors: Map<string, ClinicDoctor[]> = new Map();
const clinicPatients: Map<string, ClinicPatient[]> = new Map();
const clinicAppointments: Map<string, ClinicAppointment[]> = new Map();
const clinicSettings: Map<string, ClinicSettings> = new Map();
const clinicBranding: Map<string, ClinicBranding> = new Map();

class ClinicService {
  
  // Create a new clinic
  createClinic(data: Omit<Clinic, 'id' | 'createdAt' | 'updatedAt'>): Clinic {
    const clinic: Clinic = {
      id: `clinic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    clinics.set(clinic.id, clinic);
    console.log(`🏥 New clinic created: ${clinic.name} (${clinic.subdomain})`);
    return clinic;
  }
  
  // Get clinic by subdomain
  getClinicBySubdomain(subdomain: string): Clinic | null {
    for (const clinic of clinics.values()) {
      if (clinic.subdomain === subdomain && clinic.isActive) {
        return clinic;
      }
    }
    return null;
  }
  
  // Get clinic by ID
  getClinicById(id: string): Clinic | null {
    return clinics.get(id) || null;
  }
  
  // Update clinic
  updateClinic(id: string, updates: Partial<Clinic>): Clinic | null {
    const clinic = clinics.get(id);
    if (!clinic) return null;
    const updated = { ...clinic, ...updates, updatedAt: new Date() };
    clinics.set(id, updated);
    return updated;
  }
  
  // Add doctor to clinic
  addDoctor(clinicId: string, doctor: Omit<ClinicDoctor, 'id' | 'createdAt'>): ClinicDoctor {
    const newDoctor: ClinicDoctor = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clinicId,
      ...doctor,
      createdAt: new Date(),
    };
    
    const doctors = clinicDoctors.get(clinicId) || [];
    doctors.push(newDoctor);
    clinicDoctors.set(clinicId, doctors);
    return newDoctor;
  }
  
  // Get clinic doctors
  getClinicDoctors(clinicId: string): ClinicDoctor[] {
    return clinicDoctors.get(clinicId) || [];
  }
  
  // Add patient to clinic
  addPatient(clinicId: string, patient: Omit<ClinicPatient, 'id' | 'createdAt' | 'patientId'>): ClinicPatient {
    const clinic = clinics.get(clinicId);
    if (!clinic) throw new Error('Clinic not found');
    
    const patients = clinicPatients.get(clinicId) || [];
    const patientId = `${clinic.subdomain.toUpperCase()}-${(patients.length + 1).toString().padStart(4, '0')}`;
    
    const newPatient: ClinicPatient = {
      id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clinicId,
      patientId,
      ...patient,
      createdAt: new Date(),
    };
    
    patients.push(newPatient);
    clinicPatients.set(clinicId, patients);
    return newPatient;
  }
  
  // Get clinic patients
  getClinicPatients(clinicId: string): ClinicPatient[] {
    return clinicPatients.get(clinicId) || [];
  }
  
  // Book appointment
  bookAppointment(data: Omit<ClinicAppointment, 'id' | 'createdAt'>): ClinicAppointment {
    const appointment: ClinicAppointment = {
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date(),
    };
    
    const appointments = clinicAppointments.get(data.clinicId) || [];
    appointments.push(appointment);
    clinicAppointments.set(data.clinicId, appointments);
    return appointment;
  }
  
  // Get clinic appointments
  getClinicAppointments(clinicId: string): ClinicAppointment[] {
    return clinicAppointments.get(clinicId) || [];
  }
  
  // Get appointments by doctor
  getAppointmentsByDoctor(clinicId: string, doctorId: string): ClinicAppointment[] {
    const appointments = clinicAppointments.get(clinicId) || [];
    return appointments.filter(a => a.doctorId === doctorId);
  }
  
  // Update appointment status
  updateAppointmentStatus(appointmentId: string, status: ClinicAppointment['status']): boolean {
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
  
  // Get clinic settings
  getClinicSettings(clinicId: string): ClinicSettings | null {
    return clinicSettings.get(clinicId) || null;
  }
  
  // Update clinic settings
  updateClinicSettings(clinicId: string, settings: Partial<ClinicSettings>): ClinicSettings {
    const existing = clinicSettings.get(clinicId) || this.getDefaultSettings(clinicId);
    const updated = { ...existing, ...settings };
    clinicSettings.set(clinicId, updated);
    return updated;
  }
  
  private getDefaultSettings(clinicId: string): ClinicSettings {
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
  
  // Get clinic branding
  getClinicBranding(clinicId: string): ClinicBranding | null {
    return clinicBranding.get(clinicId) || null;
  }
  
  // Update clinic branding (white-label)
  updateClinicBranding(clinicId: string, branding: Partial<ClinicBranding>): ClinicBranding {
    const existing = clinicBranding.get(clinicId) || this.getDefaultBranding(clinicId);
    const updated = { ...existing, ...branding };
    clinicBranding.set(clinicId, updated);
    return updated;
  }
  
  private getDefaultBranding(clinicId: string): ClinicBranding {
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
  
  // Get clinic statistics
  getClinicStats(clinicId: string): any {
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
}

export const clinicService = new ClinicService();