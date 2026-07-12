import { Router, Request, Response } from 'express';
import { enhancedSymptomChecker } from '../services/enhancedSymptomChecker';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

const router = Router();

// Analyze symptoms with enhanced logic
router.post('/analyze', catchAsync(async (req: Request, res: Response) => {
  const { symptoms, durations, severities, patientProfile } = req.body;
  
  if (!symptoms || symptoms.length === 0) {
    throw new AppError('Symptoms are required', 400);
  }
  
  const result = enhancedSymptomChecker.analyzeSymptoms(
    symptoms,
    durations || {},
    severities || {},
    patientProfile || { age: 30, gender: 'male' }
  );
  
  res.json({ success: true, data: result });
}));

// Get condition information
router.get('/condition/:conditionName', catchAsync(async (req: Request, res: Response) => {
  const { conditionName } = req.params;
  res.json({ success: true, data: { condition: conditionName, details: 'Detailed information here' } });
}));

// Get medication recommendations
router.post('/medications', catchAsync(async (req: Request, res: Response) => {
  const { condition, symptoms, patientProfile } = req.body;
  
  const medications = getMedicationRecommendations(condition, symptoms, patientProfile);
  res.json({ success: true, data: medications });
}));

function getMedicationRecommendations(condition: string, symptoms: string[], patientProfile: any): any[] {
  const recommendations: any[] = [];
  const normalizedSymptomList = (symptoms || []).map(s => s.toLowerCase());
  
  if (condition.includes('Headache') || normalizedSymptomList.includes('headache')) {
    recommendations.push({
      name: 'Acetaminophen (Tylenol)',
      dosage: '500mg every 4-6 hours',
      maxDosage: '3000mg per day',
      notes: 'Take with food if stomach sensitive',
      prescriptionRequired: false,
    });
    recommendations.push({
      name: 'Ibuprofen (Advil/Motrin)',
      dosage: '200-400mg every 6-8 hours',
      maxDosage: '1200mg per day',
      notes: 'Take with food',
      prescriptionRequired: false,
    });
  }
  
  if (normalizedSymptomList.includes('fever')) {
    recommendations.push({
      name: 'Acetaminophen',
      dosage: '500mg every 4-6 hours',
      maxDosage: '3000mg per day',
      notes: 'Reduces fever and pain',
      prescriptionRequired: false,
    });
  }
  
  if (normalizedSymptomList.includes('cough')) {
    recommendations.push({
      name: 'Dextromethorphan (cough suppressant)',
      dosage: 'As directed on package',
      notes: 'For dry cough',
      prescriptionRequired: false,
    });
  }
  
  return recommendations;
}

export default router;