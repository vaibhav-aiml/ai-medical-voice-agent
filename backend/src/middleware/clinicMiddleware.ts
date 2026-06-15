import { Request, Response, NextFunction } from 'express';
import { clinicService } from '../services/clinicService';

export const clinicMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const host = req.headers.host || '';
  const subdomain = host.split('.')[0];
  
  // Skip if it's our main domain
  if (subdomain === 'localhost' || subdomain === 'www' || subdomain === 'app') {
    return next();
  }
  
  const clinic = clinicService.getClinicBySubdomain(subdomain);
  if (clinic) {
    (req as any).clinic = clinic;
    // Apply clinic branding to response headers
    res.setHeader('X-Clinic-ID', clinic.id);
    res.setHeader('X-Clinic-Name', clinic.name);
  }
  
  next();
};