import { useState, useEffect } from 'react';
import { X, Download, FileJson, FileText, FileSpreadsheet, Database, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface ExportData {
  consultations: any[];
  healthGoals: any[];
  appointments: any[];
  emergencyContacts: any[];
  healthLogs: any[];
  ratings: any[];
  voiceSettings: any;
  userProfile: any;
}

interface Props {
  onClose: () => void;
}

export default function DataExport({ onClose }: Props) {
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [selectedData, setSelectedData] = useState({
    consultations: true,
    healthGoals: true,
    appointments: true,
    emergencyContacts: true,
    healthLogs: true,
    ratings: true,
    voiceSettings: true,
    userProfile: true,
  });
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const userId = localStorage.getItem('userId') || 'user';
    
    const data: ExportData = {
      consultations: JSON.parse(localStorage.getItem(`consultations_${userId}`) || '[]'),
      healthGoals: JSON.parse(localStorage.getItem('healthGoals') || '[]'),
      appointments: JSON.parse(localStorage.getItem('appointments') || '[]'),
      emergencyContacts: JSON.parse(localStorage.getItem('emergencyContacts') || '[]'),
      healthLogs: JSON.parse(localStorage.getItem('dailyHealthLogs') || '[]'),
      ratings: JSON.parse(localStorage.getItem('consultationRatings') || '{}'),
      voiceSettings: JSON.parse(localStorage.getItem('voiceSettings') || '{}'),
      userProfile: {
        userId: userId,
        lastActive: new Date().toISOString(),
        exportDate: new Date().toISOString(),
      },
    };
    setExportData(data);
  };

  const convertToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header] || '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const exportDataAsJSON = () => {
    const filteredData: any = {};
    if (selectedData.consultations) filteredData.consultations = exportData?.consultations;
    if (selectedData.healthGoals) filteredData.healthGoals = exportData?.healthGoals;
    if (selectedData.appointments) filteredData.appointments = exportData?.appointments;
    if (selectedData.emergencyContacts) filteredData.emergencyContacts = exportData?.emergencyContacts;
    if (selectedData.healthLogs) filteredData.healthLogs = exportData?.healthLogs;
    if (selectedData.ratings) filteredData.ratings = exportData?.ratings;
    if (selectedData.voiceSettings) filteredData.voiceSettings = exportData?.voiceSettings;
    if (selectedData.userProfile) filteredData.userProfile = exportData?.userProfile;
    
    filteredData.exportDate = new Date().toISOString();
    filteredData.appVersion = '1.0.0';
    
    const jsonString = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medivoice_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportDataAsCSV = () => {
    if (selectedData.consultations && exportData?.consultations.length) {
      const csv = convertToCSV(exportData.consultations, 'consultations');
      downloadCSV(csv, 'consultations.csv');
    }
    if (selectedData.healthGoals && exportData?.healthGoals.length) {
      const csv = convertToCSV(exportData.healthGoals, 'health_goals');
      downloadCSV(csv, 'health_goals.csv');
    }
    if (selectedData.appointments && exportData?.appointments.length) {
      const csv = convertToCSV(exportData.appointments, 'appointments');
      downloadCSV(csv, 'appointments.csv');
    }
    if (selectedData.emergencyContacts && exportData?.emergencyContacts.length) {
      const csv = convertToCSV(exportData.emergencyContacts, 'emergency_contacts');
      downloadCSV(csv, 'emergency_contacts.csv');
    }
    if (selectedData.healthLogs && exportData?.healthLogs.length) {
      const csv = convertToCSV(exportData.healthLogs, 'health_logs');
      downloadCSV(csv, 'health_logs.csv');
    }
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medivoice_${filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      if (exportFormat === 'json') {
        exportDataAsJSON();
      } else {
        exportDataAsCSV();
      }
      setExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1000);
  };

  const deleteAllData = () => {
    setDeleteInProgress(true);
    setTimeout(() => {
      const userId = localStorage.getItem('userId') || 'user';
      localStorage.removeItem(`consultations_${userId}`);
      localStorage.removeItem('healthGoals');
      localStorage.removeItem('appointments');
      localStorage.removeItem('emergencyContacts');
      localStorage.removeItem('dailyHealthLogs');
      localStorage.removeItem('consultationRatings');
      localStorage.removeItem(`appointments_${userId}`);
      localStorage.removeItem(`consultations_${userId}`);
      
      setDeleteInProgress(false);
      setShowDeleteConfirm(false);
      alert('All your data has been deleted successfully!');
      loadData();
    }, 1500);
  };

  const getTotalRecords = () => {
    let total = 0;
    if (selectedData.consultations) total += exportData?.consultations.length || 0;
    if (selectedData.healthGoals) total += exportData?.healthGoals.length || 0;
    if (selectedData.appointments) total += exportData?.appointments.length || 0;
    if (selectedData.emergencyContacts) total += exportData?.emergencyContacts.length || 0;
    if (selectedData.healthLogs) total += exportData?.healthLogs.length || 0;
    return total;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <Download size={24} />
          </div>
          <h2 style={styles.title}>Data Export & Privacy</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {/* Export Format Selection */}
          <div style={styles.section}>
            <h3>Export Format</h3>
            <div style={styles.formatSelector}>
              <button
                onClick={() => setExportFormat('json')}
                style={{ ...styles.formatButton, ...(exportFormat === 'json' ? styles.formatActive : {}) }}
              >
                <FileJson size={18} />
                JSON (Complete Data)
              </button>
              <button
                onClick={() => setExportFormat('csv')}
                style={{ ...styles.formatButton, ...(exportFormat === 'csv' ? styles.formatActive : {}) }}
              >
                <FileSpreadsheet size={18} />
                CSV (Spreadsheet)
              </button>
            </div>
          </div>

          {/* Data Selection */}
          <div style={styles.section}>
            <h3>Select Data to Export</h3>
            <div style={styles.checkboxGrid}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedData.consultations}
                  onChange={(e) => setSelectedData({ ...selectedData, consultations: e.target.checked })}
                />
                Consultations ({exportData?.consultations.length || 0})
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedData.healthGoals}
                  onChange={(e) => setSelectedData({ ...selectedData, healthGoals: e.target.checked })}
                />
                Health Goals ({exportData?.healthGoals.length || 0})
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedData.appointments}
                  onChange={(e) => setSelectedData({ ...selectedData, appointments: e.target.checked })}
                />
                Appointments ({exportData?.appointments.length || 0})
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedData.emergencyContacts}
                  onChange={(e) => setSelectedData({ ...selectedData, emergencyContacts: e.target.checked })}
                />
                Emergency Contacts ({exportData?.emergencyContacts.length || 0})
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedData.healthLogs}
                  onChange={(e) => setSelectedData({ ...selectedData, healthLogs: e.target.checked })}
                />
                Health Logs ({exportData?.healthLogs.length || 0})
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedData.ratings}
                  onChange={(e) => setSelectedData({ ...selectedData, ratings: e.target.checked })}
                />
                Consultation Ratings
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedData.voiceSettings}
                  onChange={(e) => setSelectedData({ ...selectedData, voiceSettings: e.target.checked })}
                />
                Voice Settings
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedData.userProfile}
                  onChange={(e) => setSelectedData({ ...selectedData, userProfile: e.target.checked })}
                />
                User Profile
              </label>
            </div>
          </div>

          {/* Export Summary */}
          <div style={styles.summaryCard}>
            <Database size={20} color="#3b82f6" />
            <div>
              <div style={styles.summaryTitle}>Ready to Export</div>
              <div style={styles.summaryText}>
                {getTotalRecords()} records will be exported in {exportFormat.toUpperCase()} format
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting || getTotalRecords() === 0}
            style={styles.exportButton}
          >
            {exporting ? (
              <>⏳ Exporting...</>
            ) : exportSuccess ? (
              <><CheckCircle size={16} /> Export Complete!</>
            ) : (
              <><Download size={16} /> Export Data</>
            )}
          </button>

          {/* Danger Zone */}
          <div style={styles.dangerZone}>
            <h3 style={styles.dangerTitle}>⚠️ Danger Zone</h3>
            <p style={styles.dangerText}>
              Permanently delete all your data. This action cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} style={styles.deleteButton}>
                <Trash2 size={16} /> Delete All My Data
              </button>
            ) : (
              <div style={styles.confirmBox}>
                <AlertCircle size={20} color="#ef4444" />
                <p>Are you absolutely sure? This will delete ALL your data permanently.</p>
                <div style={styles.confirmActions}>
                  <button onClick={() => setShowDeleteConfirm(false)} style={styles.cancelDeleteButton}>
                    Cancel
                  </button>
                  <button onClick={deleteAllData} disabled={deleteInProgress} style={styles.confirmDeleteButton}>
                    {deleteInProgress ? 'Deleting...' : 'Yes, Delete Everything'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
    background: 'var(--bg-card)',
    borderRadius: '24px',
    maxWidth: '550px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto' as const,
    boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  headerIcon: {
    width: '36px',
    height: '36px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
    flex: 1,
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
  },
  content: {
    padding: '24px',
  },
  section: {
    marginBottom: '24px',
  },
  formatSelector: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  formatButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'var(--badge-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  formatActive: {
    background: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
    color: '#3b82f6',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginTop: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  summaryTitle: {
    fontWeight: 600,
    fontSize: '14px',
  },
  summaryText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  exportButton: {
    width: '100%',
    padding: '14px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  dangerZone: {
    padding: '16px',
    background: 'rgba(239, 68, 68, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  dangerTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#ef4444',
    marginBottom: '8px',
  },
  dangerText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  deleteButton: {
    padding: '10px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  confirmBox: {
    marginTop: '12px',
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
  },
  confirmActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  cancelDeleteButton: {
    flex: 1,
    padding: '8px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  confirmDeleteButton: {
    flex: 1,
    padding: '8px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};