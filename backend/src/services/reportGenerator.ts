import PDFDocument from 'pdfkit';

export interface SOAPData {
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    pastMedicalHistory?: string;
    medications?: string[];
    allergies?: string[];
    familyHistory?: string;
    socialHistory?: string;
  };
  objective: {
    vitalSigns?: {
      temperature?: string;
      bloodPressure?: string;
      heartRate?: string;
      respiratoryRate?: string;
      oxygenSaturation?: string;
      weight?: string;
      height?: string;
      bmi?: string;
    };
    physicalExam?: string;
    labResults?: string[];
    imagingResults?: string[];
  };
  assessment: {
    primaryDiagnosis: string;
    differentialDiagnosis?: string[];
    severity: 'mild' | 'moderate' | 'severe' | 'critical';
    urgencyLevel: string;
    riskFactors: string[];
  };
  plan: {
    recommendations: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    followUp: string;
    referrals?: string[];
    patientInstructions: string[];
    whenToSeekEmergency: string;
  };
}

export interface ConsultationReport {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  consultationId: string;
  specialistType: string;
  specialistName: string;
  date: Date;
  symptoms: string;
  aiAnalysis: string;
  soapData: SOAPData;
  recommendations: string[];
  generatedBy: string;
}

// Module-level private helper functions
function addHeader(doc: PDFKit.PDFDocument, data: ConsultationReport): void {
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .fillColor('#1e3a8a')
     .text('MediVoice AI', { align: 'center' });
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#64748b')
     .text('AI-Powered Medical Consultation Report', { align: 'center' });
  
  doc.moveDown();
  
  doc.strokeColor('#cbd5e1')
     .lineWidth(1)
     .moveTo(50, doc.y)
     .lineTo(550, doc.y)
     .stroke();
  
  doc.moveDown(0.5);
  
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#1e293b')
     .text('MEDICAL REPORT - SOAP FORMAT', { align: 'center' });
  
  doc.moveDown();
  
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#64748b')
     .text(`Report ID: ${data.id}`, { align: 'right' })
     .text(`Generated: ${new Date(data.date).toLocaleString()}`, { align: 'right' });
  
  doc.moveDown();
}

function addPatientInfo(doc: PDFKit.PDFDocument, data: ConsultationReport): void {
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#1e293b')
     .text('PATIENT INFORMATION');
  
  doc.moveDown(0.5);
  
  const startY = doc.y;
  doc.rect(50, startY, 500, 60).stroke();
  
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#334155');
  
  doc.text('Patient Name:', 60, startY + 10)
     .text(data.patientName || 'Not specified', 160, startY + 10);
  
  doc.text('Consultation ID:', 60, startY + 25)
     .text(data.consultationId || 'N/A', 160, startY + 25);
  
  doc.text('Specialist:', 60, startY + 40)
     .text(`${data.specialistName} (${data.specialistType})`, 160, startY + 40);
  
  if (data.patientAge) {
    doc.text('Age:', 300, startY + 10)
       .text(`${data.patientAge} years`, 350, startY + 10);
  }
  
  if (data.patientGender) {
    doc.text('Gender:', 300, startY + 25)
       .text(data.patientGender, 350, startY + 25);
  }
  
  doc.text('Date:', 300, startY + 40)
     .text(new Date().toLocaleDateString(), 350, startY + 40);
  
  doc.moveDown(1.5);
}

function addSectionHeader(doc: PDFKit.PDFDocument, letter: string, title: string, color: string): void {
  const y = doc.y;
  doc.rect(50, y, 500, 22).fill(color);
  
  doc.fillColor('white')
     .fontSize(11)
     .font('Helvetica-Bold')
     .text(`${letter} - ${title}`, 60, y + 5);
  
  doc.fillColor('#1e293b');
  doc.moveDown(1);
}

function addSubjective(doc: PDFKit.PDFDocument, soapData: SOAPData): void {
  addSectionHeader(doc, 'S', 'SUBJECTIVE', '#3b82f6');
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1e293b')
     .text('Chief Complaint:');
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#334155')
     .text(soapData.subjective.chiefComplaint || 'Not specified', { indent: 20, continued: false });
  
  doc.moveDown(0.5);
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1e293b')
     .text('History of Present Illness:');
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#334155')
     .text(soapData.subjective.historyOfPresentIllness || 'Patient described symptoms during consultation', { indent: 20, continued: false });
  
  doc.moveDown(0.5);
  
  if (soapData.subjective.medications && soapData.subjective.medications.length > 0) {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Current Medications:');
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#334155')
       .text(soapData.subjective.medications.join(', '), { indent: 20, continued: false });
    
    doc.moveDown(0.5);
  }
  
  if (soapData.subjective.allergies && soapData.subjective.allergies.length > 0) {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Allergies:');
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#ef4444')
       .text(soapData.subjective.allergies.join(', '), { indent: 20, continued: false });
    
    doc.moveDown(0.5);
  }
  
  doc.moveDown(0.5);
}

function addObjective(doc: PDFKit.PDFDocument, soapData: SOAPData): void {
  addSectionHeader(doc, 'O', 'OBJECTIVE', '#10b981');
  
  if (soapData.objective.vitalSigns && Object.keys(soapData.objective.vitalSigns).length > 0) {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Vital Signs:');
    
    const vitals = soapData.objective.vitalSigns;
    const vitalLines = [];
    if (vitals.temperature) vitalLines.push(`Temperature: ${vitals.temperature}`);
    if (vitals.bloodPressure) vitalLines.push(`BP: ${vitals.bloodPressure}`);
    if (vitals.heartRate) vitalLines.push(`HR: ${vitals.heartRate}`);
    if (vitals.respiratoryRate) vitalLines.push(`RR: ${vitals.respiratoryRate}`);
    if (vitals.oxygenSaturation) vitalLines.push(`O2: ${vitals.oxygenSaturation}`);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#334155')
       .text(vitalLines.join(' | '), { indent: 20, continued: false });
    
    doc.moveDown(0.5);
  } else {
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#334155')
       .text('Not recorded during this consultation', { indent: 20, continued: false });
    
    doc.moveDown(0.5);
  }
  
  if (soapData.objective.physicalExam) {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Physical Examination:');
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#334155')
       .text(soapData.objective.physicalExam, { indent: 20, continued: false });
    
    doc.moveDown(0.5);
  }
  
  doc.moveDown(0.5);
}

function addAssessment(doc: PDFKit.PDFDocument, soapData: SOAPData): void {
  addSectionHeader(doc, 'A', 'ASSESSMENT', '#f59e0b');
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1e293b')
     .text('Primary Diagnosis:');
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#334155')
     .text(soapData.assessment.primaryDiagnosis || 'Under evaluation', { indent: 20, continued: false });
  
  doc.moveDown(0.5);
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1e293b')
     .text('Severity:');
  
  const severityColor = soapData.assessment.severity === 'critical' ? '#ef4444' : 
                        soapData.assessment.severity === 'severe' ? '#f97316' :
                        soapData.assessment.severity === 'moderate' ? '#f59e0b' : '#10b981';
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor(severityColor)
     .text((soapData.assessment.severity || 'mild').toUpperCase(), { indent: 20, continued: false });
  
  doc.moveDown(0.5);
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1e293b')
     .text('Urgency Level:');
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#334155')
     .text(soapData.assessment.urgencyLevel || 'Routine - Monitor symptoms', { indent: 20, continued: false });
  
  doc.moveDown(0.5);
  
  if (soapData.assessment.riskFactors && soapData.assessment.riskFactors.length > 0) {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Risk Factors:');
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#ef4444')
       .text(soapData.assessment.riskFactors.join(', '), { indent: 20, continued: false });
    
    doc.moveDown(0.5);
  }
  
  doc.moveDown(0.5);
}

function addPlan(doc: PDFKit.PDFDocument, soapData: SOAPData): void {
  addSectionHeader(doc, 'P', 'PLAN', '#8b5cf6');
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1e293b')
     .text('Recommendations:');
  
  const recommendations = soapData.plan.recommendations && soapData.plan.recommendations.length > 0 
    ? soapData.plan.recommendations 
    : [
        'Get adequate rest (7-8 hours)',
        'Stay hydrated with water and warm fluids',
        'Monitor symptoms for 2-3 days',
        'Take over-the-counter medication if needed'
      ];
  
  recommendations.forEach((rec, idx) => {
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#334155')
       .text(`${idx + 1}. ${rec}`, { indent: 20, continued: false });
  });
  
  doc.moveDown(0.5);
  
  if (soapData.plan.medications && soapData.plan.medications.length > 0) {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Prescribed Medications:');
    
    soapData.plan.medications.forEach(med => {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#334155')
         .text(`• ${med.name} ${med.dosage} - ${med.frequency} for ${med.duration}`, { indent: 20, continued: false });
    });
    
    doc.moveDown(0.5);
  }
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1e293b')
     .text('Follow-up Plan:');
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#334155')
     .text(soapData.plan.followUp || 'Schedule follow-up in 1-2 weeks if symptoms persist', { indent: 20, continued: false });
  
  doc.moveDown(0.5);
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1e293b')
     .text('Patient Instructions:');
  
  const instructions = soapData.plan.patientInstructions && soapData.plan.patientInstructions.length > 0 
    ? soapData.plan.patientInstructions 
    : [
        'Rest and avoid strenuous activities',
        'Drink plenty of fluids (8-10 glasses daily)',
        'Monitor temperature daily',
        'Seek medical attention if symptoms worsen'
      ];
  
  instructions.forEach(instruction => {
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#334155')
       .text(`✓ ${instruction}`, { indent: 20, continued: false });
  });
  
  doc.moveDown(0.5);
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#ef4444')
     .text('⚠️ When to Seek Emergency Care:');
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#dc2626')
     .text(soapData.plan.whenToSeekEmergency || 'Seek immediate medical attention if symptoms worsen, fever exceeds 103°F, or you experience difficulty breathing', { indent: 20, continued: false });
  
  doc.moveDown(1);
}

function addDisclaimer(doc: PDFKit.PDFDocument): void {
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1e293b')
     .text('DISCLAIMER', { align: 'center' });
  
  doc.moveDown(0.5);
  
  const disclaimerText = `This medical report has been generated by MediVoice AI, an artificial intelligence-powered medical consultation platform. The information contained in this report is based on the symptoms and information provided by the patient during the AI consultation session.

Please note:
• This report is for informational purposes only and does not constitute a medical diagnosis.
• Always consult with a qualified healthcare professional for proper medical advice, diagnosis, and treatment.
• The recommendations provided are general guidelines and may not be suitable for all patients.
• In case of medical emergency, call emergency services immediately (108 in India).
• MediVoice AI is not a substitute for professional medical care.

By using this report, you acknowledge that you have read and understood this disclaimer.`;
  
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#64748b')
     .text(disclaimerText, { align: 'left', width: 500 });
}

// Exported pure function
export function generateSOAPReport(data: ConsultationReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        info: {
          Title: `Medical Report - ${data.patientName}`,
          Author: 'MediVoice AI',
          Subject: 'AI Medical Consultation Report'
        }
      });
      
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      addHeader(doc, data);
      addPatientInfo(doc, data);
      addSubjective(doc, data.soapData);
      addObjective(doc, data.soapData);
      addAssessment(doc, data.soapData);
      addPlan(doc, data.soapData);
      
      if (doc.y > 650) {
        doc.addPage();
      }
      addDisclaimer(doc);
      
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

// Backward-compatible default export object
export const reportGenerator = {
  generateSOAPReport,
};