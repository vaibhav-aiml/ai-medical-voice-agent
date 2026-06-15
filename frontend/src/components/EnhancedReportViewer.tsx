import React, { useState } from 'react';
import { FileText, Download, Mail, Eye, Loader2, X } from 'lucide-react';

interface ReportData {
  consultationId: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  specialistType: string;
  specialistName: string;
  symptoms: string;
  recommendations: string[];
  diagnosis?: string;
  severity?: string;
  urgencyLevel?: string;
  riskFactors?: string[];
  medicationsPrescribed?: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
  followUp?: string;
  patientInstructions?: string[];
}

interface EnhancedReportViewerProps {
  consultationData: ReportData;
  onClose: () => void;
}

const EnhancedReportViewer: React.FC<EnhancedReportViewerProps> = ({ consultationData, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'download'>('preview');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generatePreview = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/enhanced-report/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultationData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      setPreviewHtml(html);
    } catch (error: any) {
      console.error('Error generating preview:', error);
      setError(error.message || 'Failed to generate preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Prepare complete data for PDF
      const reportPayload = {
        patientId: consultationData.patientId || 'unknown',
        patientName: consultationData.patientName || 'Patient',
        patientAge: consultationData.patientAge,
        patientGender: consultationData.patientGender,
        consultationId: consultationData.consultationId,
        specialistType: consultationData.specialistType || 'general',
        specialistName: consultationData.specialistName || 'AI Doctor',
        symptoms: consultationData.symptoms || 'No symptoms recorded',
        recommendations: consultationData.recommendations || [
          'Get adequate rest (7-8 hours)',
          'Stay hydrated with water and warm fluids',
          'Monitor symptoms for 2-3 days',
          'Take over-the-counter medication if needed'
        ],
        diagnosis: consultationData.diagnosis || 'Under evaluation',
        severity: consultationData.severity || 'mild',
        urgencyLevel: consultationData.urgencyLevel || 'routine',
        riskFactors: consultationData.riskFactors || [],
        medicationsPrescribed: consultationData.medicationsPrescribed || [],
        followUp: consultationData.followUp || 'Schedule follow-up if symptoms persist beyond 5-7 days',
        patientInstructions: consultationData.patientInstructions || [
          'Rest and avoid strenuous activities',
          'Drink plenty of fluids',
          'Monitor temperature daily',
          'Seek medical attention if symptoms worsen'
        ]
      };
      
      const response = await fetch('/api/enhanced-report/generate-soap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Check if blob is actually a PDF
      if (blob.type !== 'application/pdf') {
        console.warn('Response is not PDF, type:', blob.type);
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical_report_${consultationData.consultationId || Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error downloading report:', error);
      setError(error.message || 'Failed to download report');
      alert('Failed to download report: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const emailReport = async () => {
    const email = prompt('Enter email address to send the report:');
    if (!email) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/enhanced-report/generate-and-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...consultationData, email }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical_report_${consultationData.consultationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Report generated! You can now save and email it manually.');
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Failed to generate report');
      alert('Failed to generate report: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <FileText size={24} />
            Enhanced Medical Report (SOAP Format)
          </h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            <span>❌ Error: {error}</span>
            <button onClick={() => setError(null)} style={styles.errorClose}>×</button>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('preview')}
            style={{ ...styles.tab, ...(activeTab === 'preview' ? styles.activeTab : {}) }}
          >
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={() => setActiveTab('download')}
            style={{ ...styles.tab, ...(activeTab === 'download' ? styles.activeTab : {}) }}
          >
            <Download size={16} /> Download
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === 'preview' && (
            <div style={styles.previewContainer}>
              {!previewHtml && (
                <button onClick={generatePreview} style={styles.previewButton} disabled={isGenerating}>
                  {isGenerating ? <Loader2 size={20} className="spin" /> : <Eye size={20} />}
                  {isGenerating ? 'Generating...' : 'Generate Preview'}
                </button>
              )}
              {previewHtml && (
                <iframe
                  srcDoc={previewHtml}
                  style={styles.iframe}
                  title="Report Preview"
                  sandbox="allow-same-origin allow-scripts"
                />
              )}
            </div>
          )}

          {activeTab === 'download' && (
            <div style={styles.downloadContainer}>
              <div style={styles.infoCard}>
                <h3>Report Information</h3>
                <p><strong>Patient:</strong> {consultationData.patientName}</p>
                <p><strong>Consultation ID:</strong> {consultationData.consultationId}</p>
                <p><strong>Specialist:</strong> {consultationData.specialistName}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Symptoms:</strong> {consultationData.symptoms?.substring(0, 100)}...</p>
              </div>

              <div style={styles.buttonGroup}>
                <button onClick={downloadReport} style={styles.downloadButton} disabled={isGenerating}>
                  <Download size={18} />
                  {isGenerating ? 'Generating...' : 'Download PDF Report'}
                </button>
                <button onClick={emailReport} style={styles.emailButton} disabled={isGenerating}>
                  <Mail size={18} />
                  Generate & Save
                </button>
              </div>

              <div style={styles.disclaimer}>
                <strong>📋 SOAP Format Report Includes:</strong>
                <ul>
                  <li><strong>S</strong> - Subjective: Patient symptoms and history</li>
                  <li><strong>O</strong> - Objective: Clinical findings and vital signs</li>
                  <li><strong>A</strong> - Assessment: Diagnosis and severity</li>
                  <li><strong>P</strong> - Plan: Treatment and follow-up recommendations</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <style>{`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '20px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
  },
  errorMessage: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '12px 24px',
    padding: '12px',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '14px',
  },
  errorClose: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#dc2626',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    padding: '12px 24px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#64748b',
    transition: 'all 0.2s',
  },
  activeTab: {
    background: '#3b82f6',
    color: 'white',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
  previewContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  previewButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  iframe: {
    width: '100%',
    height: '500px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: 'white',
  },
  downloadContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  infoCard: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  downloadButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  emailButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  disclaimer: {
    background: '#fef3c7',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '13px',
    color: '#92400e',
  },
};

export default EnhancedReportViewer;