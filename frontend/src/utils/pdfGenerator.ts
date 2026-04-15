import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface CompleteReportData {
  reportId: string;
  consultationId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  specialistType: string;
  specialistName: string;
  consultationDate: Date;
  symptoms: string[];
  duration: string;
  diagnosis: string;
  recommendations: string[];
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  testsRecommended?: string[];
  followUpNeeded: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
  vitalSigns?: {
    temperature?: string;
    bloodPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
  };
  additionalNotes: string;
  prescriptionUrl?: string;
}

export const generateCompletePDFReport = async (reportData: CompleteReportData): Promise<void> => {
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="padding: 40px; font-family: 'Helvetica', Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
      <!-- Header with Gradient -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🏥 AI Medical Voice Agent</h1>
        <h2 style="margin: 10px 0 0; font-size: 20px; opacity: 0.95;">Complete Medical Consultation Report</h2>
      </div>

      <!-- Report Metadata -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px;"><strong>Report ID:</strong></td>
            <td style="padding: 8px;">${reportData.reportId}</td>
            <td style="padding: 8px;"><strong>Consultation ID:</strong></td>
            <td style="padding: 8px;">${reportData.consultationId}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Date:</strong></td>
            <td style="padding: 8px;">${new Date(reportData.consultationDate).toLocaleDateString()}</td>
            <td style="padding: 8px;"><strong>Time:</strong></td>
            <td style="padding: 8px;">${new Date(reportData.consultationDate).toLocaleTimeString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Duration:</strong></td>
            <td style="padding: 8px;">${reportData.duration}</td>
            <td style="padding: 8px;"><strong>Specialist:</strong></td>
            <td style="padding: 8px;">${reportData.specialistName} (${reportData.specialistType})</td>
          </tr>
        </table>
      </div>

      <!-- Patient Information -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 12px; margin-bottom: 15px;">Patient Information</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <p><strong>Name:</strong> ${reportData.patientName}</p>
          ${reportData.patientAge ? `<p><strong>Age:</strong> ${reportData.patientAge} years</p>` : ''}
          ${reportData.patientGender ? `<p><strong>Gender:</strong> ${reportData.patientGender}</p>` : ''}
        </div>
      </div>

      <!-- Vital Signs -->
      ${reportData.vitalSigns ? `
      <div style="margin-bottom: 25px;">
        <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 12px; margin-bottom: 15px;">Vital Signs</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <table style="width: 100%;">
            ${reportData.vitalSigns.temperature ? `<tr><td><strong>Temperature:</strong></td><td>${reportData.vitalSigns.temperature}</td></tr>` : ''}
            ${reportData.vitalSigns.bloodPressure ? `<tr><td><strong>Blood Pressure:</strong></td><td>${reportData.vitalSigns.bloodPressure}</td></tr>` : ''}
            ${reportData.vitalSigns.heartRate ? `<tr><td><strong>Heart Rate:</strong></td><td>${reportData.vitalSigns.heartRate}</td></tr>` : ''}
            ${reportData.vitalSigns.respiratoryRate ? `<tr><td><strong>Respiratory Rate:</strong></td><td>${reportData.vitalSigns.respiratoryRate}</td></tr>` : ''}
          </table>
        </div>
      </div>
      ` : ''}

      <!-- Symptoms -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 12px; margin-bottom: 15px;">Symptoms</h3>
        <ul style="background: #f8f9fa; padding: 15px 15px 15px 35px; border-radius: 8px; margin: 0;">
          ${reportData.symptoms.map(symptom => `<li style="margin-bottom: 8px;">${symptom}</li>`).join('')}
        </ul>
      </div>

      <!-- Diagnosis -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 12px; margin-bottom: 15px;">Diagnosis & Assessment</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <p style="margin: 0; line-height: 1.6;">${reportData.diagnosis}</p>
        </div>
      </div>

      <!-- Recommendations -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 12px; margin-bottom: 15px;">Treatment Recommendations</h3>
        <ul style="background: #f8f9fa; padding: 15px 15px 15px 35px; border-radius: 8px; margin: 0;">
          ${reportData.recommendations.map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
        </ul>
      </div>

      <!-- Medications -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 12px; margin-bottom: 15px;">Prescribed Medications</h3>
        <table style="width: 100%; border-collapse: collapse; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #667eea; color: white;">
              <th style="padding: 10px; text-align: left;">Medication</th>
              <th style="padding: 10px; text-align: left;">Dosage</th>
              <th style="padding: 10px; text-align: left;">Frequency</th>
              <th style="padding: 10px; text-align: left;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.medications.map(med => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${med.name}</td>
                <td style="padding: 10px;">${med.dosage}</td>
                <td style="padding: 10px;">${med.frequency}</td>
                <td style="padding: 10px;">${med.duration}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Recommended Tests -->
      ${reportData.testsRecommended && reportData.testsRecommended.length > 0 ? `
      <div style="margin-bottom: 25px;">
        <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 12px; margin-bottom: 15px;">Recommended Tests</h3>
        <ul style="background: #f8f9fa; padding: 15px 15px 15px 35px; border-radius: 8px; margin: 0;">
          ${reportData.testsRecommended.map(test => `<li style="margin-bottom: 8px;">${test}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Follow-up Plan -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 12px; margin-bottom: 15px;">Follow-up Plan</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <p><strong>Follow-up Required:</strong> ${reportData.followUpNeeded ? 'Yes' : 'No'}</p>
          ${reportData.followUpDate ? `<p><strong>Suggested Follow-up Date:</strong> ${new Date(reportData.followUpDate).toLocaleDateString()}</p>` : ''}
          ${reportData.followUpNotes ? `<p><strong>Follow-up Notes:</strong> ${reportData.followUpNotes}</p>` : ''}
        </div>
      </div>

      <!-- Additional Notes -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #667eea; border-left: 4px solid #667eea; padding-left: 12px; margin-bottom: 15px;">Additional Notes</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <p style="margin: 0; line-height: 1.6;">${reportData.additionalNotes}</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; color: #999; font-size: 11px;">
        <p>This is an AI-generated medical report. Please consult with a qualified healthcare provider for medical advice.</p>
        <p>Generated by AI Medical Voice Agent | ${new Date().toLocaleString()}</p>
        <p>Report ID: ${reportData.reportId} | For any queries, please contact your healthcare provider.</p>
      </div>
    </div>
  `;

  document.body.appendChild(element);
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`Medical_Report_${reportData.reportId}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  } finally {
    document.body.removeChild(element);
  }
};

export const generateMockCompleteReport = (
  consultationId: string, 
  specialistType: string, 
  symptoms: string
): CompleteReportData => {
  const symptomList = symptoms.split('.').filter(s => s.trim().length > 0);
  
  const medicationsByType: Record<string, Array<{name: string; dosage: string; frequency: string; duration: string}>> = {
    general: [
      { name: 'Acetaminophen', dosage: '500mg', frequency: 'Every 6 hours as needed', duration: '3 days' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 8 hours as needed', duration: '3 days' },
      { name: 'Vitamin C', dosage: '1000mg', frequency: 'Once daily', duration: '7 days' },
    ],
    orthopedic: [
      { name: 'Ibuprofen', dosage: '600mg', frequency: 'Every 8 hours', duration: '5 days' },
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours as needed', duration: '3 days' },
      { name: 'Calcium + Vitamin D3', dosage: '500mg + 400IU', frequency: 'Once daily', duration: '30 days' },
    ],
    cardiologist: [
      { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: 'As prescribed' },
      { name: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily at night', duration: 'As prescribed' },
    ],
    neurologist: [
      { name: 'Sumatriptan', dosage: '50mg', frequency: 'At onset of headache', duration: 'As needed' },
      { name: 'Magnesium Glycinate', dosage: '400mg', frequency: 'Once daily', duration: '30 days' },
    ],
    pediatrician: [
      { name: 'Children\'s Acetaminophen', dosage: '10-15 mg/kg', frequency: 'Every 6 hours', duration: '2 days' },
      { name: 'Pediatric Electrolytes', dosage: 'As directed', frequency: 'After each loose motion', duration: '2 days' },
    ],
  };

  const recommendationsByType: Record<string, string[]> = {
    general: [
      'Get plenty of rest (7-8 hours of sleep)',
      'Stay hydrated with warm fluids like herbal tea or soup',
      'Monitor temperature every 4-6 hours',
      'Eat light, nutritious meals',
      'Avoid strenuous activities',
      'Practice good hand hygiene',
    ],
    orthopedic: [
      'Apply ice pack to affected area for 15-20 minutes, 3-4 times daily',
      'Rest and avoid strenuous activities for 2-3 days',
      'Gentle stretching exercises as tolerated',
      'Use proper posture when sitting/standing',
      'Consider physical therapy if pain persists beyond 1 week',
    ],
    cardiologist: [
      'Monitor blood pressure daily at home',
      'Reduce salt and caffeine intake',
      'Light walking for 20-30 minutes daily',
      'Practice stress management techniques like deep breathing',
      'Avoid heavy meals before bedtime',
      'Quit smoking and limit alcohol consumption',
    ],
    neurologist: [
      'Maintain consistent sleep schedule (7-8 hours)',
      'Reduce screen time, especially before bed',
      'Stay hydrated with 8-10 glasses of water daily',
      'Practice relaxation techniques like meditation',
      'Keep a headache diary to track triggers',
      'Avoid known triggers like caffeine, alcohol, or stress',
    ],
    pediatrician: [
      'Ensure child gets plenty of rest in a comfortable environment',
      'Keep hydrated with water, electrolyte solutions, or clear fluids',
      'Monitor temperature every 4 hours',
      'Provide a nutritious, easy-to-digest diet',
      'Keep child comfortable with light clothing and proper ventilation',
      'Maintain good ventilation in the room',
    ],
  };

  return {
    reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    consultationId: consultationId,
    patientName: 'Patient Name',
    patientAge: 32,
    patientGender: 'Not specified',
    specialistType: specialistType,
    specialistName: `${specialistType.charAt(0).toUpperCase() + specialistType.slice(1)} Specialist`,
    consultationDate: new Date(),
    symptoms: symptomList.length > 0 ? symptomList : [symptoms],
    duration: `${Math.floor(Math.random() * 20) + 10} minutes`,
    diagnosis: `Based on the consultation, the patient presented with: ${symptoms}. The AI doctor has assessed the condition and recommends the following treatment plan.`,
    recommendations: recommendationsByType[specialistType] || recommendationsByType.general,
    medications: medicationsByType[specialistType] || medicationsByType.general,
    testsRecommended: ['Complete Blood Count (CBC)', 'Basic Metabolic Panel'],
    followUpNeeded: true,
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    followUpNotes: 'Schedule follow-up if symptoms persist or worsen. Bring all reports and medication list.',
    vitalSigns: {
      temperature: '98.6°F (37°C)',
      bloodPressure: '120/80 mmHg',
      heartRate: '72 bpm',
      respiratoryRate: '16 breaths/min',
    },
    additionalNotes: 'Patient advised to monitor symptoms and follow recommendations. Seek immediate medical attention if condition worsens or new symptoms develop.',
  };
};