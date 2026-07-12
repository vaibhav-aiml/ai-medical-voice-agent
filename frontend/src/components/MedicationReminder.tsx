import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
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

const MedicationReminder: React.FC<{ userId: string; onClose: () => void }> = ({ userId, onClose }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [preferences, setPreferences] = useState<NotificationPrefs | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAllData();
  }, [userId]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMedications(),
      fetchPreferences(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchMedications = async () => {
    try {
      const response = await fetch(`${API_URL}/reminder/medications/${userId}`);
      const data = await response.json();
      if (data.success) setMedications(data.data);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`${API_URL}/reminder/preferences/${userId}`);
      const data = await response.json();
      if (data.success && data.data) setPreferences(data.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/reminder/stats/${userId}`);
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/reminder/medication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...medication, userId }),
      });
      const data = await response.json();
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
      const response = await fetch(`${API_URL}/reminder/medication/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
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
      const response = await fetch(`${API_URL}/reminder/medication/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
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
      const response = await fetch(`${API_URL}/reminder/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, preferences: prefs }),
      });
      const data = await response.json();
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
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            <Bell size={24} style={styles.icon} />
            Medication Reminders
          </h2>
          <button onClick={onClose} style={styles.closeButton}>
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

        {/* Stats Cards */}
        {stats && (
          <div style={styles.statsContainer}>
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

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button onClick={() => setShowPrefsModal(true)} style={styles.prefsButton}>
            <Mail size={16} /> Notification Settings
          </button>
          <button onClick={() => setShowAddModal(true)} style={styles.addButton}>
            <Plus size={16} /> Add Medication
          </button>
        </div>

        {/* Medications List */}
        <div style={styles.medicationsList}>
          {medications.length === 0 ? (
            <div style={styles.emptyState}>
              <Bell size={48} style={styles.emptyIcon} />
              <p>No medications added yet</p>
              <button onClick={() => setShowAddModal(true)} style={styles.emptyButton}>
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
                    <button onClick={() => setEditingMed(med)} style={styles.editButton}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteMedication(med.id)} style={styles.deleteButton}>
                      <Trash2 size={16} />
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

      {/* Add/Edit Medication Modal */}
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

// Medication Form Modal Component
const MedicationFormModal: React.FC<{
  medication?: Medication | null;
  onClose: () => void;
  onSave: (med: any) => void;
}> = ({ medication, onClose, onSave }) => {
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
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={styles.modalTitle}>{medication ? 'Edit Medication' : 'Add Medication'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Medication name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Dosage (e.g., 500mg, 1 tablet)"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            style={styles.input}
            required
          />
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
            style={styles.select}
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
            style={styles.input}
          />
          <textarea
            placeholder="Notes / Instructions"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            style={styles.textarea}
            rows={3}
          />
          <div style={styles.modalButtons}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.saveButton}>
              {medication ? 'Update' : 'Add'} Medication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Preferences Modal Component
const PreferencesModal: React.FC<{
  preferences: NotificationPrefs | null;
  onClose: () => void;
  onSave: (prefs: NotificationPrefs) => void;
}> = ({ preferences, onClose, onSave }) => {
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
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={styles.modalTitle}>Notification Preferences</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.emailEnabled}
              onChange={(e) => setFormData({ ...formData, emailEnabled: e.target.checked })}
            />
            Email Notifications
          </label>
          {formData.emailEnabled && (
            <input
              type="email"
              placeholder="Email address"
              value={formData.emailAddress || ''}
              onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
              style={styles.input}
              required
            />
          )}

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.smsEnabled}
              onChange={(e) => setFormData({ ...formData, smsEnabled: e.target.checked })}
            />
            SMS Notifications (Twilio required)
          </label>
          {formData.smsEnabled && (
            <input
              type="tel"
              placeholder="Phone number (e.g., +91XXXXXXXXXX)"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              style={styles.input}
            />
          )}

          <div style={styles.modalButtons}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.saveButton}>
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
    color: '#8b5cf6',
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
    gridTemplateColumns: 'repeat(3, 1fr)',
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
    background: '#8b5cf6',
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
    color: '#8b5cf6',
    background: '#f3e8ff',
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
    background: '#8b5cf6',
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
    borderTopColor: '#8b5cf6',
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
    background: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

// Add animation CSS
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