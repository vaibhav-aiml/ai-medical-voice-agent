import { Router, Request, Response } from 'express';
import { reportGenerator, ConsultationReport, SOAPData } from '../services/reportGenerator';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Generate SOAP report PDF
router.post('/generate-soap', async (req: Request, res: Response) => {
  try {
    const consultationData = req.body;
    
    const soapData: SOAPData = {
      subjective: {
        chiefComplaint: consultationData.symptoms || 'Not specified',
        historyOfPresentIllness: consultationData.symptoms || 'Patient described symptoms during AI consultation',
        pastMedicalHistory: consultationData.pastMedicalHistory,
        medications: consultationData.medications,
        allergies: consultationData.allergies,
        familyHistory: consultationData.familyHistory,
        socialHistory: consultationData.socialHistory
      },
      objective: {
        vitalSigns: consultationData.vitalSigns || {},
        physicalExam: consultationData.physicalExam,
        labResults: consultationData.labResults,
        imagingResults: consultationData.imagingResults
      },
      assessment: {
        primaryDiagnosis: consultationData.diagnosis || 'Under evaluation',
        differentialDiagnosis: consultationData.differentialDiagnosis,
        severity: consultationData.severity || 'mild',
        urgencyLevel: consultationData.urgencyLevel || 'routine',
        riskFactors: consultationData.riskFactors || []
      },
      plan: {
        recommendations: consultationData.recommendations || [],
        medications: consultationData.medicationsPrescribed || [],
        followUp: consultationData.followUp || 'Schedule follow-up in 1-2 weeks if symptoms persist',
        referrals: consultationData.referrals,
        patientInstructions: consultationData.patientInstructions || [
          'Get adequate rest (7-8 hours)',
          'Stay hydrated',
          'Monitor symptoms',
          'Take medications as prescribed'
        ],
        whenToSeekEmergency: consultationData.whenToSeekEmergency || 'Seek immediate medical attention if symptoms worsen, fever exceeds 103°F, or you experience difficulty breathing'
      }
    };
    
    const reportData: ConsultationReport = {
      id: uuidv4(),
      patientId: consultationData.patientId,
      patientName: consultationData.patientName,
      patientAge: consultationData.patientAge,
      patientGender: consultationData.patientGender,
      consultationId: consultationData.consultationId,
      specialistType: consultationData.specialistType,
      specialistName: consultationData.specialistName,
      date: new Date(),
      symptoms: consultationData.symptoms,
      aiAnalysis: consultationData.aiAnalysis,
      soapData: soapData,
      recommendations: consultationData.recommendations || [],
      generatedBy: 'AI Assistant'
    };
    
    const pdfBuffer = await reportGenerator.generateSOAPReport(reportData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=medical_report_${reportData.id}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating SOAP report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate report', details: String(error) });
  }
});

// Preview report (HTML format for browser viewing)
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const consultationData = req.body;
    
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <title>Medical Report Preview</title>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', 'Helvetica', Arial, sans-serif;
          background: #f0f2f5;
          padding: 40px;
          line-height: 1.6;
        }
        .report-container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 14px;
          opacity: 0.9;
        }
        .report-title {
          font-size: 20px;
          font-weight: bold;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(255,255,255,0.3);
        }
        .content {
          padding: 30px;
        }
        .patient-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }
        .info-title {
          font-size: 16px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 15px;
          border-left: 4px solid #3b82f6;
          padding-left: 12px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .info-row {
          display: flex;
        }
        .info-label {
          font-weight: 600;
          width: 120px;
          color: #64748b;
        }
        .info-value {
          color: #1e293b;
          flex: 1;
        }
        .section {
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        .section-header {
          padding: 12px 20px;
          color: white;
          font-weight: bold;
          font-size: 16px;
        }
        .section-header-S { background: #3b82f6; }
        .section-header-O { background: #10b981; }
        .section-header-A { background: #f59e0b; }
        .section-header-P { background: #8b5cf6; }
        .section-content {
          padding: 20px;
          background: white;
        }
        .section-content p {
          margin-bottom: 12px;
          color: #334155;
        }
        .section-content strong {
          color: #1e293b;
        }
        .section-content ul {
          margin-left: 20px;
          margin-bottom: 12px;
        }
        .section-content li {
          margin-bottom: 6px;
          color: #334155;
        }
        .emergency-box {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
        }
        .disclaimer {
          background: #fef3c7;
          padding: 20px;
          border-radius: 12px;
          margin-top: 25px;
          font-size: 11px;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        .footer {
          background: #f8fafc;
          padding: 15px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
        }
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .report-container {
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <div class="logo">MediVoice AI</div>
          <div class="subtitle">AI-Powered Medical Consultation Report</div>
          <div class="report-title">MEDICAL REPORT - SOAP FORMAT</div>
        </div>
        
        <div class="content">
          <div class="patient-info">
            <div class="info-title">PATIENT INFORMATION</div>
            <div class="info-grid">
              <div class="info-row">
                <div class="info-label">Patient Name:</div>
                <div class="info-value">${consultationData.patientName || 'Not specified'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Consultation ID:</div>
                <div class="info-value">${consultationData.consultationId || 'N/A'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Specialist:</div>
                <div class="info-value">${consultationData.specialistName || 'AI Doctor'} (${consultationData.specialistType || 'General'})</div>
              </div>
              <div class="info-row">
                <div class="info-label">Date:</div>
                <div class="info-value">${new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          
          <!-- S - Subjective -->
          <div class="section">
            <div class="section-header section-header-S">S - SUBJECTIVE</div>
            <div class="section-content">
              <p><strong>Chief Complaint:</strong> ${consultationData.symptoms || 'Not specified'}</p>
              <p><strong>History of Present Illness:</strong> ${consultationData.symptoms || 'Patient described symptoms during AI consultation'}</p>
            </div>
          </div>
          
          <!-- O - Objective -->
          <div class="section">
            <div class="section-header section-header-O">O - OBJECTIVE</div>
            <div class="section-content">
              <p><strong>Vital Signs:</strong> Not recorded in this consultation</p>
              <p><strong>Physical Examination:</strong> Based on patient-reported symptoms</p>
            </div>
          </div>
          
          <!-- A - Assessment -->
          <div class="section">
            <div class="section-header section-header-A">A - ASSESSMENT</div>
            <div class="section-content">
              <p><strong>Primary Diagnosis:</strong> Under evaluation</p>
              <p><strong>Severity:</strong> Mild</p>
              <p><strong>Urgency Level:</strong> Routine - Monitor symptoms</p>
            </div>
          </div>
          
          <!-- P - Plan -->
          <div class="section">
            <div class="section-header section-header-P">P - PLAN</div>
            <div class="section-content">
              <p><strong>Recommendations:</strong></p>
              <ul>
                <li>Get adequate rest (7-8 hours)</li>
                <li>Stay hydrated with water and warm fluids</li>
                <li>Monitor symptoms for 2-3 days</li>
                <li>Take over-the-counter medication if needed</li>
              </ul>
              <p><strong>Follow-up Plan:</strong> Schedule follow-up if symptoms persist beyond 5-7 days</p>
              <p><strong>Patient Instructions:</strong></p>
              <ul>
                <li>Rest and avoid strenuous activities</li>
                <li>Drink plenty of fluids</li>
                <li>Monitor temperature daily</li>
                <li>Seek medical attention if symptoms worsen</li>
              </ul>
              <div class="emergency-box">
                <strong>⚠️ When to Seek Emergency Care:</strong><br>
                Seek immediate medical attention if symptoms worsen, fever exceeds 103°F, or you experience difficulty breathing.
              </div>
            </div>
          </div>
          
          <div class="disclaimer">
            <strong>Disclaimer:</strong> This report has been generated by MediVoice AI, an artificial intelligence-powered medical consultation platform. The information contained in this report is based on the symptoms and information provided during the AI consultation session. This report is for informational purposes only and does not constitute a medical diagnosis. Always consult with a qualified healthcare professional for proper medical advice, diagnosis, and treatment.
          </div>
        </div>
        
        <div class="footer">
          MediVoice AI - Generated by AI Assistant
        </div>
      </div>
    </body>
    </html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
    
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ success: false, error: 'Failed to generate preview', details: String(error) });
  }
});

// Generate and send report via email
router.post('/generate-and-email', async (req: Request, res: Response) => {
  try {
    const consultationData = req.body;
    const { email } = consultationData;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }
    
    const soapData: SOAPData = {
      subjective: {
        chiefComplaint: consultationData.symptoms || 'Not specified',
        historyOfPresentIllness: consultationData.symptoms || 'Patient described symptoms during AI consultation',
        pastMedicalHistory: consultationData.pastMedicalHistory,
        medications: consultationData.medications,
        allergies: consultationData.allergies,
        familyHistory: consultationData.familyHistory,
        socialHistory: consultationData.socialHistory
      },
      objective: {
        vitalSigns: consultationData.vitalSigns || {},
        physicalExam: consultationData.physicalExam,
        labResults: consultationData.labResults,
        imagingResults: consultationData.imagingResults
      },
      assessment: {
        primaryDiagnosis: consultationData.diagnosis || 'Under evaluation',
        differentialDiagnosis: consultationData.differentialDiagnosis,
        severity: consultationData.severity || 'mild',
        urgencyLevel: consultationData.urgencyLevel || 'routine',
        riskFactors: consultationData.riskFactors || []
      },
      plan: {
        recommendations: consultationData.recommendations || [],
        medications: consultationData.medicationsPrescribed || [],
        followUp: consultationData.followUp || 'Schedule follow-up in 1-2 weeks if symptoms persist',
        referrals: consultationData.referrals,
        patientInstructions: consultationData.patientInstructions || [
          'Get adequate rest (7-8 hours)',
          'Stay hydrated',
          'Monitor symptoms',
          'Take medications as prescribed'
        ],
        whenToSeekEmergency: consultationData.whenToSeekEmergency || 'Seek immediate medical attention if symptoms worsen, fever exceeds 103°F, or you experience difficulty breathing'
      }
    };
    
    const reportData: ConsultationReport = {
      id: uuidv4(),
      patientId: consultationData.patientId,
      patientName: consultationData.patientName,
      patientAge: consultationData.patientAge,
      patientGender: consultationData.patientGender,
      consultationId: consultationData.consultationId,
      specialistType: consultationData.specialistType,
      specialistName: consultationData.specialistName,
      date: new Date(),
      symptoms: consultationData.symptoms,
      aiAnalysis: consultationData.aiAnalysis,
      soapData: soapData,
      recommendations: consultationData.recommendations || [],
      generatedBy: 'AI Assistant'
    };
    
    const pdfBuffer = await reportGenerator.generateSOAPReport(reportData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=medical_report_${reportData.id}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate report', details: String(error) });
  }
});

export default router;