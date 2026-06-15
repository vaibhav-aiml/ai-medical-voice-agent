import { Router, Request, Response } from 'express';
import { enhancedSymptomChecker, PatientProfile } from '../services/enhancedSymptomChecker';

const router = Router();

// Analyze symptoms with enhanced logic
router.post('/analyze', (req: Request, res: Response) => {
  try {
    const { symptoms, durations, severities, patientProfile } = req.body;
    
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ success: false, error: 'Symptoms are required' });
    }
    
    const result = enhancedSymptomChecker.analyzeSymptoms(
      symptoms,
      durations || {},
      severities || {},
      patientProfile || { age: 30, gender: 'male' }
    );
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze symptoms' });
  }
});

// Get condition information
router.get('/condition/:conditionName', (req: Request, res: Response) => {
  try {
    const { conditionName } = req.params;
    // This would fetch detailed condition info from a database
    res.json({ success: true, data: { condition: conditionName, details: 'Detailed information here' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get condition info' });
  }
});

// Get medication recommendations
router.post('/medications', (req: Request, res: Response) => {
  try {
    const { condition, symptoms, patientProfile } = req.body;
    
    const medications = getMedicationRecommendations(condition, symptoms, patientProfile);
    res.json({ success: true, data: medications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get medication recommendations' });
  }
});

function getMedicationRecommendations(condition: string, symptoms: string[], patientProfile: any): any[] {
  const recommendations: any[] = [];
  
  if (condition.includes('Headache') || symptoms.includes('headache')) {
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
  
  if (symptoms.includes('fever')) {
    recommendations.push({
      name: 'Acetaminophen',
      dosage: '500mg every 4-6 hours',
      maxDosage: '3000mg per day',
      notes: 'Reduces fever and pain',
      prescriptionRequired: false,
    });
  }
  
  if (symptoms.includes('cough')) {
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