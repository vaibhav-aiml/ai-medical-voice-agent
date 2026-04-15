import { useState } from 'react';
import { Download, Mail, X } from 'lucide-react';
import { generateCompletePDFReport, generateMockCompleteReport } from '../utils/pdfGenerator';
import EmailReportModal from './EmailReportModal';

interface Props {
  consultationId: string;
  specialistType: string;
  symptoms: string;
  onClose: () => void;
}

export default function MedicalReportModal({ consultationId, specialistType, symptoms, onClose }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [generatedPdfData, setGeneratedPdfData] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const reportDataComplete = generateMockCompleteReport(consultationId, specialistType, symptoms);
      setReportData(reportDataComplete);
      await generateCompletePDFReport(reportDataComplete);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailReport = async () => {
    setIsGenerating(true);
    try {
      const reportDataComplete = generateMockCompleteReport(consultationId, specialistType, symptoms);
      setReportData(reportDataComplete);
      
      // Generate PDF as base64 for email attachment
      const element = document.createElement('div');
      element.innerHTML = `<div>Generating PDF...</div>`;
      document.body.appendChild(element);
      
      // Simplified: Store report data and show email modal
      setGeneratedPdfData('generated');
      setShowEmailModal(true);
    } catch (error) {
      console.error('Error preparing email:', error);
      alert('Failed to prepare report for email. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>📋 Medical Report</h2>
            <button onClick={onClose} style={styles.closeButton}>
              <X size={20} />
            </button>
          </div>
          
          <div style={styles.content}>
            <div style={styles.infoSection}>
              <h3>Consultation Details</h3>
              <p><strong>ID:</strong> {consultationId}</p>
              <p><strong>Specialist:</strong> {specialistType}</p>
              <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
            </div>
            
            <div style={styles.infoSection}>
              <h3>Symptoms Summary</h3>
              <div style={styles.symptomsBox}>
                {symptoms}
              </div>
            </div>
            
            <div style={styles.infoSection}>
              <h3>What's included in the report:</h3>
              <div style={styles.featuresGrid}>
                <div style={styles.featureItem}>✅ Patient Information</div>
                <div style={styles.featureItem}>✅ Vital Signs Monitoring</div>
                <div style={styles.featureItem}>✅ Detailed Symptoms Analysis</div>
                <div style={styles.featureItem}>✅ Professional Diagnosis</div>
                <div style={styles.featureItem}>✅ Treatment Recommendations</div>
                <div style={styles.featureItem}>✅ Prescribed Medications</div>
                <div style={styles.featureItem}>✅ Recommended Tests</div>
                <div style={styles.featureItem}>✅ Follow-up Schedule</div>
              </div>
            </div>
          </div>
          
          <div style={styles.footer}>
            <button onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button 
              onClick={handleGeneratePDF} 
              style={styles.downloadButton}
              disabled={isGenerating}
            >
              <Download size={16} />
              <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button 
              onClick={handleEmailReport} 
              style={styles.emailButton}
              disabled={isGenerating}
            >
              <Mail size={16} />
              <span>{isGenerating ? 'Preparing...' : 'Email Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {showEmailModal && reportData && (
        <EmailReportModal
          consultationId={consultationId}
          patientName="Patient"
          specialistType={specialistType}
          specialistName={`${specialistType.charAt(0).toUpperCase() + specialistType.slice(1)} Specialist`}
          symptoms={symptoms}
          diagnosis={reportData.diagnosis}
          recommendations={reportData.recommendations}
          medications={reportData.medications}
          pdfData={generatedPdfData}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '550px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto' as const,
    boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #eee',
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '20px',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    padding: '4px',
    borderRadius: '6px',
  },
  content: {
    padding: '24px',
  },
  infoSection: {
    marginBottom: '20px',
  },
  symptomsBox: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '10px',
    lineHeight: 1.5,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginTop: '10px',
  },
  featureItem: {
    padding: '8px',
    background: '#f8f9fa',
    borderRadius: '6px',
    fontSize: '13px',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #eee',
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  downloadButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  emailButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
  },
};
