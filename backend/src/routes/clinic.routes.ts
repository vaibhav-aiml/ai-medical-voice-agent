import { Router, Request, Response } from 'express';
import { clinicService } from '../services/clinicService';

const router = Router();

// Helper function to safely extract string from params
const safeString = (value: string | string[] | undefined): string => {
  if (!value) return '';
  return Array.isArray(value) ? value[0] : value;
};

// Create clinic
router.post('/create', (req: Request, res: Response) => {
  try {
    const clinic = clinicService.createClinic(req.body);
    res.json({ success: true, data: clinic });
  } catch (error: any) {
    console.error('Error creating clinic:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create clinic' });
  }
});

// Get clinic by subdomain
router.get('/by-subdomain/:subdomain', (req: Request, res: Response) => {
  try {
    const subdomain = safeString(req.params.subdomain);
    const clinic = clinicService.getClinicBySubdomain(subdomain);
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    res.json({ success: true, data: clinic });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get clinic' });
  }
});

// Get clinic by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = safeString(req.params.id);
    const clinic = clinicService.getClinicById(id);
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    res.json({ success: true, data: clinic });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get clinic' });
  }
});

// Update clinic
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = safeString(req.params.id);
    const clinic = clinicService.updateClinic(id, req.body);
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    res.json({ success: true, data: clinic });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update clinic' });
  }
});

// Add doctor
router.post('/:clinicId/doctors', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const doctor = clinicService.addDoctor(clinicId, req.body);
    res.json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to add doctor' });
  }
});

// Get clinic doctors
router.get('/:clinicId/doctors', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const doctors = clinicService.getClinicDoctors(clinicId);
    res.json({ success: true, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get doctors' });
  }
});

// Add patient
router.post('/:clinicId/patients', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const patient = clinicService.addPatient(clinicId, req.body);
    res.json({ success: true, data: patient });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to add patient' });
  }
});

// Get clinic patients
router.get('/:clinicId/patients', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const patients = clinicService.getClinicPatients(clinicId);
    res.json({ success: true, data: patients });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get patients' });
  }
});

// Book appointment
router.post('/:clinicId/appointments', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const appointment = clinicService.bookAppointment({ ...req.body, clinicId });
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to book appointment' });
  }
});

// Get clinic appointments
router.get('/:clinicId/appointments', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const appointments = clinicService.getClinicAppointments(clinicId);
    res.json({ success: true, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get appointments' });
  }
});

// Get appointments by doctor
router.get('/:clinicId/appointments/doctor/:doctorId', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const doctorId = safeString(req.params.doctorId);
    const appointments = clinicService.getAppointmentsByDoctor(clinicId, doctorId);
    res.json({ success: true, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get appointments' });
  }
});

// Update appointment status
router.patch('/appointments/:appointmentId/status', (req: Request, res: Response) => {
  try {
    const appointmentId = safeString(req.params.appointmentId);
    const { status } = req.body;
    const result = clinicService.updateAppointmentStatus(appointmentId, status);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update appointment' });
  }
});

// Get clinic settings
router.get('/:clinicId/settings', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const settings = clinicService.getClinicSettings(clinicId);
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get settings' });
  }
});

// Update clinic settings
router.put('/:clinicId/settings', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const settings = clinicService.updateClinicSettings(clinicId, req.body);
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update settings' });
  }
});

// Get clinic branding
router.get('/:clinicId/branding', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const branding = clinicService.getClinicBranding(clinicId);
    res.json({ success: true, data: branding });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get branding' });
  }
});

// Update clinic branding (white-label)
router.put('/:clinicId/branding', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const branding = clinicService.updateClinicBranding(clinicId, req.body);
    res.json({ success: true, data: branding });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update branding' });
  }
});

// Get clinic statistics
router.get('/:clinicId/stats', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const stats = clinicService.getClinicStats(clinicId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get stats' });
  }
});

export default router;