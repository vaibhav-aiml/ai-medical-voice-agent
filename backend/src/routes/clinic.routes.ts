import { Router, Request, Response } from 'express';
import { clinicService } from '../services/clinicService';
import logger from '../utils/logger';

const router = Router();
const safeString = (value: string | string[] | undefined): string => {
  if (!value) return '';
  return Array.isArray(value) ? value[0] : value;
};

function verifyClinicAccess(req: Request, clinicId: string): { allowed: boolean; status: number; error?: string } {
  const userId = (req as any).auth?.userId || req.userId;
  if (!userId) {
    return { allowed: false, status: 401, error: 'Authentication required' };
  }

  const clinic = clinicService.getClinicById(clinicId);
  if (!clinic) {
    return { allowed: false, status: 404, error: 'Clinic not found' };
  }

  if (!clinic.ownerId) {
    // Auto-claim the orphaned clinic for the user performing the update
    clinic.ownerId = userId;
  } else if (clinic.ownerId !== userId) {
    return { allowed: false, status: 403, error: 'Forbidden: You do not have administrative access to this clinic' };
  }

  return { allowed: true, status: 200 };
}

router.post('/create', (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || req.userId;
    const clinic = clinicService.createClinic({ ...req.body, ownerId: userId });
    res.json({ success: true, data: clinic });
  } catch (error: any) {
    logger.error('Error creating clinic', { error });
    res.status(500).json({ success: false, error: error.message || 'Failed to create clinic' });
  }
});
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
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = safeString(req.params.id);
    const auth = verifyClinicAccess(req, id);
    if (!auth.allowed) {
      return res.status(auth.status).json({ success: false, error: auth.error });
    }
    const clinic = clinicService.updateClinic(id, req.body);
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    res.json({ success: true, data: clinic });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update clinic' });
  }
});
router.post('/:clinicId/doctors', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const auth = verifyClinicAccess(req, clinicId);
    if (!auth.allowed) {
      return res.status(auth.status).json({ success: false, error: auth.error });
    }
    const doctor = clinicService.addDoctor(clinicId, req.body);
    res.json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to add doctor' });
  }
});
router.put('/:clinicId/doctors/:id', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const doctorId = safeString(req.params.id);
    const auth = verifyClinicAccess(req, clinicId);
    if (!auth.allowed) {
      return res.status(auth.status).json({ success: false, error: auth.error });
    }
    const doctor = clinicService.updateDoctor(clinicId, doctorId, req.body);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update doctor' });
  }
});
router.delete('/:clinicId/doctors/:id', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const doctorId = safeString(req.params.id);
    const auth = verifyClinicAccess(req, clinicId);
    if (!auth.allowed) {
      return res.status(auth.status).json({ success: false, error: auth.error });
    }
    const deleted = clinicService.deleteDoctor(clinicId, doctorId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to delete doctor' });
  }
});
router.post('/:clinicId/doctors/sync', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const auth = verifyClinicAccess(req, clinicId);
    if (!auth.allowed) {
      return res.status(auth.status).json({ success: false, error: auth.error });
    }
    const doctors = Array.isArray(req.body.doctors) ? req.body.doctors : [];
    const synced = clinicService.syncDoctors(clinicId, doctors);
    res.json({ success: true, data: synced });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to sync doctors' });
  }
});
router.get('/:clinicId/doctors', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const doctors = clinicService.getClinicDoctors(clinicId);
    res.json({ success: true, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get doctors' });
  }
});
router.post('/:clinicId/patients', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const auth = verifyClinicAccess(req, clinicId);
    if (!auth.allowed) {
      return res.status(auth.status).json({ success: false, error: auth.error });
    }
    const patient = clinicService.addPatient(clinicId, req.body);
    res.json({ success: true, data: patient });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to add patient' });
  }
});
router.get('/:clinicId/patients', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const patients = clinicService.getClinicPatients(clinicId);
    res.json({ success: true, data: patients });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get patients' });
  }
});
router.post('/:clinicId/appointments', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const appointment = clinicService.bookAppointment({ ...req.body, clinicId });
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to book appointment' });
  }
});
router.post('/:clinicId/appointments/sync', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const auth = verifyClinicAccess(req, clinicId);
    if (!auth.allowed) {
      return res.status(auth.status).json({ success: false, error: auth.error });
    }
    const appointments = Array.isArray(req.body.appointments) ? req.body.appointments : [];
    const synced = clinicService.syncAppointments(clinicId, appointments);
    res.json({ success: true, data: synced });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to sync appointments' });
  }
});
router.get('/:clinicId/appointments', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const appointments = clinicService.getClinicAppointments(clinicId);
    res.json({ success: true, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get appointments' });
  }
});
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
const handleAppointmentStatusUpdate = (req: Request, res: Response) => {
  try {
    const appointmentId = safeString(req.params.appointmentId || req.params.id);
    const clinicId = safeString(req.params.clinicId);
    if (clinicId) {
      const auth = verifyClinicAccess(req, clinicId);
      if (!auth.allowed) {
        return res.status(auth.status).json({ success: false, error: auth.error });
      }
    }
    const { status } = req.body;
    const result = clinicService.updateAppointmentStatus(appointmentId, status);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update appointment' });
  }
};

router.patch('/appointments/:appointmentId/status', handleAppointmentStatusUpdate);
router.patch('/:clinicId/appointments/:id/status', handleAppointmentStatusUpdate);
router.put('/:clinicId/appointments/:id', handleAppointmentStatusUpdate);

router.get('/:clinicId/settings', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const settings = clinicService.getClinicSettings(clinicId);
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get settings' });
  }
});
router.put('/:clinicId/settings', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const auth = verifyClinicAccess(req, clinicId);
    if (!auth.allowed) {
      return res.status(auth.status).json({ success: false, error: auth.error });
    }
    const settings = clinicService.updateClinicSettings(clinicId, req.body);
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update settings' });
  }
});
router.get('/:clinicId/branding', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const branding = clinicService.getClinicBranding(clinicId);
    res.json({ success: true, data: branding });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get branding' });
  }
});
router.put('/:clinicId/branding', (req: Request, res: Response) => {
  try {
    const clinicId = safeString(req.params.clinicId);
    const auth = verifyClinicAccess(req, clinicId);
    if (!auth.allowed) {
      return res.status(auth.status).json({ success: false, error: auth.error });
    }
    const branding = clinicService.updateClinicBranding(clinicId, req.body);
    res.json({ success: true, data: branding });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update branding' });
  }
});
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