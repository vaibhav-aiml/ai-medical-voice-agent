import React, { useState, useEffect } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import apiClient from '../../services/apiClient';
import { Bell, Plus, Edit2, Trash2, Clock, Calendar, Mail, Phone, MessageCircle, X, CheckCircle, AlertCircle } from 'lucide-react';

type FrequencyType = 'daily' | 'twice_daily' | 'thrice_daily' | 'weekly' | 'custom';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: FrequencyType;
  times: string[];
  daysOfWeek?: number[];
  notes?: string;
  active: boolean;
}

interface NotificationPrefs {
  emailEnabled: boolean;
  emailAddress?: string;
  smsEnabled: boolean;
  phoneNumber?: string;
  whatsappEnabled: boolean;
  reminderTime: string;
}

interface ReminderStats {
  total: number;
  acknowledged: number;
  missed: number;
  adherenceRate: number;
}

const SAMPLE_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Amoxicillin',
    dosage: '500mg, 1 capsule',
    frequency: 'thrice_daily',
    times: ['08:00', '14:00', '20:00'],
    notes: 'Take with food and full glass of water',
    active: true,
  },
  {
    id: 'med-2',
    name: 'Lisinopril',
    dosage: '10mg, 1 tablet',
    frequency: 'daily',
    times: ['09:00'],
    notes: 'Take in the morning',
    active: true,
  },
  {
    id: 'med-3',
    name: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: 'daily',
    times: ['09:00'],
    notes: 'Take with breakfast',
    active: true,
  }
];

const SAMPLE_PREFERENCES: NotificationPrefs = {
  emailEnabled: true,
  emailAddress: 'user@example.com',
  smsEnabled: false,
  phoneNumber: '+1 555-0199',
  whatsappEnabled: false,
  reminderTime: '08:00',
};

const SAMPLE_STATS: ReminderStats = {
  total: 42,
  acknowledged: 38,
  missed: 4,
  adherenceRate: 90,
};

const MedicationReminder: React.FC<{ userId: string; onClose: () => void }> = ({ userId, onClose }) => {
  const { isMobile, isTablet } = useBreakpoint();
  const [medications, setMedications] = useState<Medication[]>(SAMPLE_MEDICATIONS);
  const [preferences, setPreferences] = useState<NotificationPrefs | null>(SAMPLE_PREFERENCES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [stats, setStats] = useState<ReminderStats | null>(SAMPLE_STATS);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAllData();
  }, [userId]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchMedications(),
        fetchPreferences(),
        fetchStats()
      ]);
    } catch {
      // Fallback data already populated
    }
  };

  const fetchMedications = async () => {
    try {
      const response = await apiClient.get(`/reminder/medications/${userId}`);
      const data = response.data;
      if (data.success && data.data?.length > 0) setMedications(data.data);
    } catch (error) {
      console.warn('Error fetching medications, using offline fallback:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await apiClient.get(`/reminder/preferences/${userId}`);
      const data = response.data;
      if (data.success && data.data) setPreferences(data.data);
    } catch (error) {
      console.warn('Error fetching preferences, using offline fallback:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get(`/reminder/stats/${userId}`);
      const data = response.data;
      if (data.success && data.data) setStats(data.data);
    } catch (error) {
      console.warn('Error fetching stats, using offline fallback:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    try {
      const response = await apiClient.post('/reminder/medication', { ...medication, userId });
      const data = response.data;
      if (data.success) {
        showMessage('success', 'Medication added successfully!');
        fetchMedications();
        setShowAddModal(false);
      }
    } catch (error) {
      showMessage('error', 'Failed to add medication');
    }
  };

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    try {
      const response = await apiClient.put(`/reminder/medication/${id}`, updates);
      const data = response.data;
      if (data.success) {
        showMessage('success', 'Medication updated successfully!');
        fetchMedications();
        setEditingMed(null);
      }
    } catch (error) {
      showMessage('error', 'Failed to update medication');
    }
  };

  const deleteMedication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication reminder?')) return;
    
    try {
      const response = await apiClient.delete(`/reminder/medication/${id}`);
      const data = response.data;
      if (data.success) {
        showMessage('success', 'Medication deleted successfully!');
        fetchMedications();
      }
    } catch (error) {
      showMessage('error', 'Failed to delete medication');
    }
  };

  const savePreferences = async (prefs: NotificationPrefs) => {
    try {
      const response = await apiClient.post('/reminder/preferences', { userId, preferences: prefs });
      const data = response.data;
      if (data.success) {
        showMessage('success', 'Preferences saved successfully!');
        setPreferences(prefs);
        setShowPrefsModal(false);
      }
    } catch (error) {
      showMessage('error', 'Failed to save preferences');
    }
  };

  const getFrequencyText = (frequency: string, times: string[]): string => {
    const timeStr = times.join(', ');
    switch (frequency) {
      case 'daily': return `Daily at ${timeStr}`;
      case 'twice_daily': return `Twice daily at ${timeStr}`;
      case 'thrice_daily': return `Three times daily at ${timeStr}`;
      case 'weekly': return `Weekly on selected days at ${timeStr}`;
      default: return `Custom schedule`;
    }
  };

  const getAdherenceColor = (rate: number): string => {
    if (rate >= 80) return '#10b981';
    if (rate >= 50) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading reminders...</p>
      </div>
    );
  }

  return (
    <div className="app-modal-overlay" style={styles.overlay}>
      <div
        className="app-modal-content"
        style={{
          ...styles.modal,
          ...(isMobile ? {
            width: '100%',
            maxWidth: '100%',
            borderRadius: '20px 20px 0 0',
            maxHeight: '92vh',
            padding: '20px 16px',
            margin: 0,
          } : {})
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            <Bell size={24} style={styles.icon} />
            Medication Reminders
          </h2>
          <button
            onClick={onClose}
            aria-label="Close medication reminders"
            style={{
              ...styles.closeButton,
              ...(isMobile ? {
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              } : {})
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Toast */}
        {message && (
          <div style={{...styles.toast, background: message.type === 'success' ? '#10b981' : '#ef4444'}}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{...styles.statsContainer, gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)'}}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.adherenceRate?.toFixed(0) || 0}%</div>
              <div style={styles.statLabel}>Adherence Rate</div>
              <div style={{...styles.statBar, width: `${stats.adherenceRate || 0}%`, background: getAdherenceColor(stats.adherenceRate || 0)}}></div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.acknowledged || 0}</div>
              <div style={styles.statLabel}>Taken On Time</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.missed || 0}</div>
              <div style={styles.statLabel}>Missed Doses</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            ...styles.actionButtons,
            ...(isMobile ? {
              flexDirection: 'column',
              gap: '10px',
            } : {})
          }}
        >
          <button
            onClick={() => setShowPrefsModal(true)}
            style={{
              ...styles.prefsButton,
              ...(isMobile ? {
                width: '100%',
                minHeight: '48px',
                justifyContent: 'center',
                fontSize: '15px',
              } : {})
            }}
          >
            <Mail size={16} /> Notification Settings
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              ...styles.addButton,
              ...(isMobile ? {
                width: '100%',
                minHeight: '48px',
                justifyContent: 'center',
                fontSize: '15px',
              } : {})
            }}
          >
            <Plus size={16} /> Add Medication
          </button>
        </div>

        {/* Medications List */}
        <div style={styles.medicationsList}>
          {medications.length === 0 ? (
            <div style={styles.emptyState}>
              <Bell size={48} style={styles.emptyIcon} />
              <p>No medications added yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  ...styles.emptyButton,
                  ...(isMobile ? {
                    minHeight: '48px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  } : {})
                }}
              >
                Add Your First Medication
              </button>
            </div>
          ) : (
            medications.map((med) => (
              <div key={med.id} style={styles.medicationCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.medicationInfo}>
                    <h3 style={styles.medicationName}>{med.name}</h3>
                    <span style={styles.dosage}>{med.dosage}</span>
                  </div>
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => setEditingMed(med)}
                      aria-label="Edit medication"
                      style={{
                        ...styles.editButton,
                        ...(isMobile ? {
                          minWidth: '44px',
                          minHeight: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        } : {})
                      }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteMedication(med.id)}
                      aria-label="Delete medication"
                      style={{
                        ...styles.deleteButton,
                        ...(isMobile ? {
                          minWidth: '44px',
                          minHeight: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        } : {})
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div style={styles.cardDetails}>
                  <div style={styles.detailItem}>
                    <Clock size={14} />
                    <span>{getFrequencyText(med.frequency, med.times)}</span>
                  </div>
                  {med.notes && (
                    <div style={styles.detailItem}>
                      <span>📋 {med.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingMed) && (
        <MedicationFormModal
          medication={editingMed}
          onClose={() => {
            setShowAddModal(false);
            setEditingMed(null);
          }}
          onSave={(med) => {
            if (editingMed) {
              updateMedication(editingMed.id, med);
            } else {
              addMedication(med as Omit<Medication, 'id'>);
            }
          }}
        />
      )}

      {/* Preferences Modal */}
      {showPrefsModal && (
        <PreferencesModal
          preferences={preferences}
          onClose={() => setShowPrefsModal(false)}
          onSave={savePreferences}
        />
      )}
    </div>
  );
};

const MedicationFormModal: React.FC<{
  medication?: Medication | null;
  onClose: () => void;
  onSave: (med: any) => void;
}> = ({ medication, onClose, onSave }) => {
  const { isMobile } = useBreakpoint();
  const [formData, setFormData] = useState({
    name: medication?.name || '',
    dosage: medication?.dosage || '',
    frequency: medication?.frequency || 'daily',
    times: medication?.times || ['09:00'],
    notes: medication?.notes || '',
  });
  const [timeInput, setTimeInput] = useState(formData.times.join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const times = timeInput.split(',').map(t => t.trim());
    onSave({
      ...formData,
      times,
      startDate: new Date().toISOString(),
      active: true,
    });
  };

  return (
    <div className="app-modal-overlay" style={styles.modalOverlay}>
      <div
        className="app-modal-content"
        style={{
          ...styles.modalContent,
          ...(isMobile ? {
            padding: '20px 16px',
            maxHeight: '90vh',
            overflowY: 'auto' as const,
          } : {})
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ ...styles.modalTitle, marginBottom: 0 }}>{medication ? 'Edit Medication' : 'Add Medication'}</h3>
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Medication name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ ...styles.input, ...(isMobile ? { fontSize: '16px', minHeight: '48px' } : {}) }}
            required
          />
          <input
            type="text"
            placeholder="Dosage (e.g., 500mg, 1 tablet)"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            style={{ ...styles.input, ...(isMobile ? { fontSize: '16px', minHeight: '48px' } : {}) }}
            required
          />
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
            style={{ ...styles.select, ...(isMobile ? { fontSize: '16px', minHeight: '48px' } : {}) }}
          >
            <option value="daily">Daily</option>
            <option value="twice_daily">Twice Daily</option>
            <option value="thrice_daily">Three Times Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <input
            type="text"
            placeholder="Times (e.g., 09:00, 21:00)"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            style={{ ...styles.input, ...(isMobile ? { fontSize: '16px', minHeight: '48px' } : {}) }}
          />
          <textarea
            placeholder="Notes / Instructions"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            style={{ ...styles.textarea, ...(isMobile ? { fontSize: '16px' } : {}) }}
            rows={3}
          />
          <div style={{ ...styles.modalButtons, ...(isMobile ? { flexDirection: 'column-reverse', gap: '10px' } : {}) }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.cancelButton, ...(isMobile ? { minHeight: '48px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}) }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...styles.saveButton, ...(isMobile ? { minHeight: '48px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}) }}
            >
              {medication ? 'Update' : 'Add'} Medication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PreferencesModal: React.FC<{
  preferences: NotificationPrefs | null;
  onClose: () => void;
  onSave: (prefs: NotificationPrefs) => void;
}> = ({ preferences, onClose, onSave }) => {
  const { isMobile } = useBreakpoint();
  const [formData, setFormData] = useState<NotificationPrefs>(
    preferences || {
      emailEnabled: true,
      emailAddress: '',
      smsEnabled: false,
      whatsappEnabled: false,
      reminderTime: '08:00',
      phoneNumber: '',
    }
  );

  return (
    <div className="app-modal-overlay" style={styles.modalOverlay}>
      <div
        className="app-modal-content"
        style={{
          ...styles.modalContent,
          ...(isMobile ? {
            padding: '20px 16px',
            maxHeight: '90vh',
            overflowY: 'auto' as const,
          } : {})
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ ...styles.modalTitle, marginBottom: 0 }}>Notification Preferences</h3>
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <label style={{ ...styles.checkboxLabel, ...(isMobile ? { minHeight: '44px' } : {}) }}>
            <input
              type="checkbox"
              checked={formData.emailEnabled}
              onChange={(e) => setFormData({ ...formData, emailEnabled: e.target.checked })}
              style={isMobile ? { width: '20px', height: '20px' } : {}}
            />
            Email Notifications
          </label>
          {formData.emailEnabled && (
            <input
              type="email"
              placeholder="Email address"
              value={formData.emailAddress || ''}
              onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
              style={{ ...styles.input, ...(isMobile ? { fontSize: '16px', minHeight: '48px' } : {}) }}
              required
            />
          )}

          <label style={{ ...styles.checkboxLabel, ...(isMobile ? { minHeight: '44px' } : {}) }}>
            <input
              type="checkbox"
              checked={formData.smsEnabled}
              onChange={(e) => setFormData({ ...formData, smsEnabled: e.target.checked })}
              style={isMobile ? { width: '20px', height: '20px' } : {}}
            />
            SMS Notifications (Twilio required)
          </label>
          {formData.smsEnabled && (
            <input
              type="tel"
              placeholder="Phone number (e.g., +91XXXXXXXXXX)"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              style={{ ...styles.input, ...(isMobile ? { fontSize: '16px', minHeight: '48px' } : {}) }}
            />
          )}

          <div style={{ ...styles.modalButtons, ...(isMobile ? { flexDirection: 'column-reverse', gap: '10px' } : {}) }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.cancelButton, ...(isMobile ? { minHeight: '48px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}) }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...styles.saveButton, ...(isMobile ? { minHeight: '48px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}) }}
            >
              Save Preferences
            </button>
          </div>
        </form>
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
    borderRadius: '20px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '85vh',
    overflow: 'auto' as const,
    padding: '24px',
    position: 'relative' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '24px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  icon: {
    color: 'var(--accent-clinical)',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    color: '#64748b',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'white',
    marginBottom: '16px',
  },
  statsContainer: {
    display: 'grid',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
  statBar: {
    height: '4px',
    borderRadius: '2px',
    marginTop: '8px',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  prefsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#64748b',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'var(--accent-clinical)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  medicationsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
  },
  medicationCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  medicationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  medicationName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  dosage: {
    fontSize: '13px',
    color: 'var(--accent-clinical)',
    background: 'var(--accent-clinical-soft)',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
  },
  deleteButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#ef4444',
    padding: '4px',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#64748b',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px',
    color: '#94a3b8',
  },
  emptyIcon: {
    marginBottom: '16px',
    opacity: 0.5,
  },
  emptyButton: {
    marginTop: '16px',
    padding: '10px 20px',
    background: 'var(--accent-clinical)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '200px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: 'var(--accent-clinical)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '450px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '20px',
    color: '#1e293b',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '14px',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    cursor: 'pointer',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '8px 16px',
    background: 'var(--accent-clinical)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('#reminder-styles')) {
  styleSheet.id = 'reminder-styles';
  document.head.appendChild(styleSheet);
}

export default MedicationReminder;