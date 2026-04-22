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
              <h3 style={styles.sectionTitle}>Consultation Details</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>ID:</span>
                  <span style={styles.infoValue}>{consultationId}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Specialist:</span>
                  <span style={styles.infoValue}>{specialistType}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Date:</span>
                  <span style={styles.infoValue}>{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div style={styles.infoSection}>
              <h3 style={styles.sectionTitle}>Symptoms Summary</h3>
              <div style={styles.symptomsBox}>
                <p style={styles.symptomsText}>{symptoms}</p>
              </div>
            </div>
            
            <div style={styles.infoSection}>
              <h3 style={styles.sectionTitle}>What's included in the report:</h3>
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
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: '20px',
    maxWidth: '550px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto' as const,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    border: '1px solid var(--border-color)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-color)',
    background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
    borderRadius: '20px 20px 0 0',
  },
  title: {
    margin: 0,
    color: 'white',
    fontSize: '20px',
    fontWeight: 600,
  },
  closeButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'white',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s ease',
  },
  content: {
    padding: '24px',
  },
  infoSection: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '12px',
    color: 'var(--text-primary)',
  },
  infoGrid: {
    background: 'var(--badge-bg)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid var(--border-color)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid var(--border-light)',
  },
  infoLabel: {
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  infoValue: {
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  symptomsBox: {
    background: 'var(--badge-bg)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  symptomsText: {
    margin: 0,
    lineHeight: 1.5,
    color: 'var(--text-primary)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginTop: '8px',
  },
  featureItem: {
    padding: '8px 12px',
    background: 'var(--badge-bg)',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-light)',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    borderRadius: '0 0 20px 20px',
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s ease',
  },
  downloadButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  emailButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'var(--button-success)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
};
