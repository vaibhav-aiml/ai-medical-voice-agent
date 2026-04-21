import { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, AlertTriangle, Plus, Edit2, Trash2, Bell, Shield, Heart } from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

interface MedicalInfo {
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  emergencyNotes: string;
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

interface Props {
  onClose: () => void;
}

export default function EmergencyContacts({ onClose }: Props) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    bloodType: 'Unknown',
    allergies: [],
    chronicConditions: [],
    medications: [],
    emergencyNotes: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  useEffect(() => {
    loadContacts();
    loadMedicalInfo();
  }, []);

  const loadContacts = () => {
    const saved = localStorage.getItem('emergencyContacts');
    if (saved) {
      setContacts(JSON.parse(saved));
    } else {
      // Demo contact
      setContacts([
        {
          id: '1',
          name: 'John Doe',
          relationship: 'Spouse',
          phone: '+1 234 567 8900',
          email: 'john@example.com',
          isPrimary: true,
        },
      ]);
    }
  };

  const loadMedicalInfo = () => {
    const saved = localStorage.getItem('medicalInfo');
    if (saved) {
      setMedicalInfo(JSON.parse(saved));
    }
  };

  const saveContacts = (newContacts: EmergencyContact[]) => {
    localStorage.setItem('emergencyContacts', JSON.stringify(newContacts));
    setContacts(newContacts);
  };

  const saveMedicalInfo = (info: MedicalInfo) => {
    localStorage.setItem('medicalInfo', JSON.stringify(info));
    setMedicalInfo(info);
  };

  const addContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact = { ...contact, id: Date.now().toString() };
    const newContacts = [...contacts, newContact];
    saveContacts(newContacts);
    setShowAddForm(false);
  };

  const updateContact = (contact: EmergencyContact) => {
    const updated = contacts.map(c => c.id === contact.id ? contact : c);
    saveContacts(updated);
    setEditingContact(null);
  };

  const deleteContact = (id: string) => {
    const filtered = contacts.filter(c => c.id !== id);
    saveContacts(filtered);
  };

  const setPrimaryContact = (id: string) => {
    const updated = contacts.map(c => ({
      ...c,
      isPrimary: c.id === id,
    }));
    saveContacts(updated);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      const updated = {
        ...medicalInfo,
        allergies: [...medicalInfo.allergies, newAllergy.trim()],
      };
      saveMedicalInfo(updated);
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    const updated = {
      ...medicalInfo,
      allergies: medicalInfo.allergies.filter((_, i) => i !== index),
    };
    saveMedicalInfo(updated);
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      const updated = {
        ...medicalInfo,
        chronicConditions: [...medicalInfo.chronicConditions, newCondition.trim()],
      };
      saveMedicalInfo(updated);
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    const updated = {
      ...medicalInfo,
      chronicConditions: medicalInfo.chronicConditions.filter((_, i) => i !== index),
    };
    saveMedicalInfo(updated);
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      const updated = {
        ...medicalInfo,
        medications: [...medicalInfo.medications, newMedication.trim()],
      };
      saveMedicalInfo(updated);
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    const updated = {
      ...medicalInfo,
      medications: medicalInfo.medications.filter((_, i) => i !== index),
    };
    saveMedicalInfo(updated);
  };

  const ContactForm = ({ contact, onSave, onCancel }: { contact?: EmergencyContact; onSave: (contact: any) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      name: contact?.name || '',
      relationship: contact?.relationship || '',
      phone: contact?.phone || '',
      email: contact?.email || '',
      isPrimary: contact?.isPrimary || false,
    });

    return (
      <div style={styles.formOverlay}>
        <div style={styles.formModal}>
          <h3>{contact ? 'Edit Contact' : 'Add Emergency Contact'}</h3>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={styles.formInput}
          />
          <input
            type="text"
            placeholder="Relationship (e.g., Spouse, Parent, Sibling)"
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            style={styles.formInput}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={styles.formInput}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={styles.formInput}
          />
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.isPrimary}
              onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
            />
            Set as Primary Contact
          </label>
          <div style={styles.formButtons}>
            <button onClick={onCancel} style={styles.cancelButton}>Cancel</button>
            <button onClick={() => onSave(formData)} style={styles.saveButton}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  const MedicalForm = () => (
    <div style={styles.formOverlay}>
      <div style={styles.formModalLarge}>
        <h3>Medical Information</h3>
        
        <div style={styles.formGroup}>
          <label>Blood Type</label>
          <select
            value={medicalInfo.bloodType}
            onChange={(e) => saveMedicalInfo({ ...medicalInfo, bloodType: e.target.value })}
            style={styles.select}
          >
            {bloodTypes.map(bt => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Allergies</label>
          <div style={styles.tagList}>
            {medicalInfo.allergies.map((allergy, i) => (
              <span key={i} style={styles.tag}>
                {allergy}
                <button onClick={() => removeAllergy(i)} style={styles.tagRemove}>×</button>
              </span>
            ))}
          </div>
          <div style={styles.addRow}>
            <input
              type="text"
              placeholder="Add allergy (e.g., Penicillin, Peanuts)"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              style={styles.addInput}
            />
            <button onClick={addAllergy} style={styles.addButton}>Add</button>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label>Chronic Conditions</label>
          <div style={styles.tagList}>
            {medicalInfo.chronicConditions.map((condition, i) => (
              <span key={i} style={styles.tag}>
                {condition}
                <button onClick={() => removeCondition(i)} style={styles.tagRemove}>×</button>
              </span>
            ))}
          </div>
          <div style={styles.addRow}>
            <input
              type="text"
              placeholder="Add condition (e.g., Diabetes, Hypertension)"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              style={styles.addInput}
            />
            <button onClick={addCondition} style={styles.addButton}>Add</button>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label>Current Medications</label>
          <div style={styles.tagList}>
            {medicalInfo.medications.map((med, i) => (
              <span key={i} style={styles.tag}>
                {med}
                <button onClick={() => removeMedication(i)} style={styles.tagRemove}>×</button>
              </span>
            ))}
          </div>
          <div style={styles.addRow}>
            <input
              type="text"
              placeholder="Add medication (e.g., Lisinopril 10mg)"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              style={styles.addInput}
            />
            <button onClick={addMedication} style={styles.addButton}>Add</button>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label>Emergency Notes</label>
          <textarea
            placeholder="Additional medical information for emergency responders..."
            value={medicalInfo.emergencyNotes}
            onChange={(e) => saveMedicalInfo({ ...medicalInfo, emergencyNotes: e.target.value })}
            style={styles.textarea}
            rows={3}
          />
        </div>

        <button onClick={() => setShowMedicalForm(false)} style={styles.closeMedicalButton}>
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <Shield size={24} />
          </div>
          <h2 style={styles.title}>Emergency Information</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {/* Medical Info Banner */}
          <div style={styles.medicalBanner} onClick={() => setShowMedicalForm(true)}>
            <Heart size={20} />
            <div>
              <strong>Medical Information</strong>
              <p>Blood Type: {medicalInfo.bloodType} | Allergies: {medicalInfo.allergies.length} | Conditions: {medicalInfo.chronicConditions.length}</p>
            </div>
            <Edit2 size={16} />
          </div>

          {/* Emergency Contacts Section */}
          <div style={styles.contactsHeader}>
            <h3>Emergency Contacts</h3>
            <button onClick={() => setShowAddForm(true)} style={styles.addContactButton}>
              <Plus size={18} /> Add Contact
            </button>
          </div>

          {contacts.length === 0 ? (
            <div style={styles.emptyState}>
              <AlertTriangle size={48} />
              <p>No emergency contacts added yet</p>
              <button onClick={() => setShowAddForm(true)} style={styles.emptyButton}>
                Add Emergency Contact
              </button>
            </div>
          ) : (
            <div style={styles.contactsList}>
              {contacts.map((contact) => (
                <div key={contact.id} style={styles.contactCard}>
                  <div style={styles.contactHeader}>
                    <div>
                      <h4>{contact.name}</h4>
                      <span style={styles.relationship}>{contact.relationship}</span>
                      {contact.isPrimary && <span style={styles.primaryBadge}>Primary</span>}
                    </div>
                    <div style={styles.contactActions}>
                      <button onClick={() => setEditingContact(contact)} style={styles.editButton}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteContact(contact.id)} style={styles.deleteButton}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div style={styles.contactDetails}>
                    <p><Phone size={14} /> {contact.phone}</p>
                    <p><Mail size={14} /> {contact.email}</p>
                  </div>
                  {!contact.isPrimary && contacts.length > 1 && (
                    <button onClick={() => setPrimaryContact(contact.id)} style={styles.setPrimaryButton}>
                      Set as Primary
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Emergency Instructions */}
          <div style={styles.emergencyInstructions}>
            <h4><AlertTriangle size={18} /> In Case of Emergency</h4>
            <ul>
              <li>Call emergency services immediately for life-threatening situations</li>
              <li>Share your medical information with first responders</li>
              <li>Emergency contacts will be notified if needed</li>
              <li>Keep this information updated regularly</li>
            </ul>
          </div>
        </div>

        {showAddForm && (
          <ContactForm
            onSave={(contact) => addContact(contact)}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {editingContact && (
          <ContactForm
            contact={editingContact}
            onSave={(contact) => updateContact({ ...editingContact, ...contact })}
            onCancel={() => setEditingContact(null)}
          />
        )}

        {showMedicalForm && <MedicalForm />}
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
    maxWidth: '600px',
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
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
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
  medicalBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '12px',
    marginBottom: '24px',
    cursor: 'pointer',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  contactsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  addContactButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: 'var(--text-secondary)',
  },
  emptyButton: {
    marginTop: '16px',
    padding: '10px 20px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  contactsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginBottom: '24px',
  },
  contactCard: {
    padding: '16px',
    background: 'var(--badge-bg)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  contactHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  relationship: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginLeft: '4px',
  },
  primaryBadge: {
    display: 'inline-block',
    marginLeft: '8px',
    padding: '2px 8px',
    background: '#10b981',
    color: 'white',
    borderRadius: '12px',
    fontSize: '10px',
  },
  contactActions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  deleteButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#ef4444',
  },
  contactDetails: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  setPrimaryButton: {
    marginTop: '12px',
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid var(--button-primary)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'var(--button-primary)',
  },
  emergencyInstructions: {
    padding: '16px',
    background: 'rgba(239, 68, 68, 0.05)',
    borderRadius: '12px',
    marginTop: '16px',
  },
  formOverlay: {
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
  formModal: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '450px',
  },
  formModalLarge: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '550px',
    maxHeight: '80vh',
    overflow: 'auto' as const,
  },
  formInput: {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  formButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '8px 16px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  formGroup: {
    marginBottom: '20px',
  },
  select: {
    width: '100%',
    padding: '10px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginBottom: '12px',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '20px',
    fontSize: '13px',
  },
  tagRemove: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: 'var(--text-secondary)',
  },
  addRow: {
    display: 'flex',
    gap: '8px',
  },
  addInput: {
    flex: 1,
    padding: '8px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '6px',
  },
  addButton: {
    padding: '8px 16px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    resize: 'vertical' as const,
  },
  closeMedicalButton: {
    width: '100%',
    padding: '10px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '16px',
  },
};
