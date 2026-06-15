export interface Clinic {
  id: string;
  name: string;
  subdomain: string; // e.g., "apollo", "fortis"
  customDomain?: string; // e.g., "clinic.apollohospitals.com"
  logo?: string; // Base64 or URL
  primaryColor: string; // Brand color
  secondaryColor: string;
  accentColor: string;
  favicon?: string;
  theme: 'light' | 'dark';
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  isActive: boolean;
  subscriptionTier: 'basic' | 'pro' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicDoctor {
  id: string;
  clinicId: string;
  userId: string;
  name: string;
  specialization: string;
  qualifications: string[];
  experience: number;
  consultationFee: number;
  isAvailable: boolean;
  avatar?: string;
  createdAt: Date;
}

export interface ClinicPatient {
  id: string;
  clinicId: string;
  userId: string;
  patientId: string; // Unique ID within clinic
  name: string;
  phone: string;
  email: string;
  age: number;
  gender: string;
  bloodGroup?: string;
  allergies?: string[];
  createdAt: Date;
}

export interface ClinicAppointment {
  id: string;
  clinicId: string;
  doctorId: string;
  patientId: string;
  date: Date;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  type: 'consultation' | 'follow_up' | 'emergency';
  notes?: string;
  createdAt: Date;
}

export interface ClinicSettings {
  id: string;
  clinicId: string;
  enableOnlinePayments: boolean;
  enableSmsNotifications: boolean;
  enableEmailNotifications: boolean;
  enableWhatsAppNotifications: boolean;
  workingHours: {
    monday: { start: string; end: string; isOpen: boolean };
    tuesday: { start: string; end: string; isOpen: boolean };
    wednesday: { start: string; end: string; isOpen: boolean };
    thursday: { start: string; end: string; isOpen: boolean };
    friday: { start: string; end: string; isOpen: boolean };
    saturday: { start: string; end: string; isOpen: boolean };
    sunday: { start: string; end: string; isOpen: boolean };
  };
  breakTime?: { start: string; end: string };
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface ClinicBranding {
  id: string;
  clinicId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  cardStyle: 'elevated' | 'bordered' | 'flat';
  logoUrl: string;
  faviconUrl: string;
  customCss?: string;
  customHeader?: string;
  customFooter?: string;
}