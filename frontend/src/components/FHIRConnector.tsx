import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { useAuth } from '@clerk/clerk-react';
import { 
  Database, RefreshCw, CheckCircle, AlertCircle, User, Calendar, 
  Activity, Shield, ExternalLink, Key, Check, Info, FileText, ClipboardList
} from 'lucide-react';

interface Props {
  userId: string;
  onClose: () => void;
  consultations: any[];
}

export default function FHIRConnector({ userId, onClose, consultations }: Props) {
  const { getToken } = useAuth();
  
  // Connection states
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  
  // Forms/inputs
  const [provider, setProvider] = useState('smart');
  const [fhirServerUrl, setFhirServerUrl] = useState('https://launch.smarthealthit.org/v/r4/fhir');
  const [clientId, setClientId] = useState('mock-client-id');
  const [scope, setScope] = useState('launch/patient patient/*.read patient/*.write openid fhirUser');

  // Fetched EHR data
  const [clinicalData, setClinicalData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'medications' | 'allergies' | 'vitals' | 'conditions' | 'appointments' | 'reports'>('profile');
  const [syncLoading, setSyncLoading] = useState<string | null>(null);
  const [syncStatusMap, setSyncStatusMap] = useState<Record<string, { success: boolean; id: string }>>({});
  
  // Real-time synchronization log and reconciliation states
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [reconciling, setReconciling] = useState(false);
  const [retryingQueue, setRetryingQueue] = useState(false);

  // Preset sandboxes mapping for developer comfort
  const sandboxes: Record<string, { name: string; url: string; clientId: string }> = {
    smart: {
      name: 'SMART Health IT Sandbox',
      url: 'https://launch.smarthealthit.org/v/r4/fhir',
      clientId: 'mock-client-id'
    },
    epic: {
      name: 'Epic Sandbox (Simulated)',
      url: 'https://open.epic.com/FHIR/api/FHIR/R4',
      clientId: 'epic-sandbox-client-id'
    },
    cerner: {
      name: 'Cerner Sandbox (Simulated)',
      url: 'https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701afe7583',
      clientId: 'cerner-sandbox-client-id'
    },
    athena: {
      name: 'Athenahealth Sandbox',
      url: 'https://api.athenahealth.com/fhir/r4',
      clientId: 'athena-sandbox-client-id'
    }
  };

  useEffect(() => {
    fetchConnectionStatus();
    
    // Listen for postMessage callback from popups
    const handleOauthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'EHR_CONNECTED') {
        fetchConnectionStatus();
      }
    };

    window.addEventListener('message', handleOauthMessage);
    return () => window.removeEventListener('message', handleOauthMessage);
  }, []);

  useEffect(() => {
    if (connectionStatus?.connected) {
      fetchClinicalData();
      fetchSyncLogs();
    }
  }, [connectionStatus]);

  const handleSandboxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    setProvider(key);
    if (sandboxes[key]) {
      setFhirServerUrl(sandboxes[key].url);
      setClientId(sandboxes[key].clientId);
    }
  };

  const fetchConnectionStatus = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/fhir/connection-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      console.error('Failed to get connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicalData = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/fhir/clinical-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClinicalData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch clinical data:', error);
    }
  };

  const fetchSyncLogs = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/interop/sync-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setSyncLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch sync logs:', error);
    }
  };

  const handleReconcile = async () => {
    setReconciling(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/interop/reconcile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.reconciled) {
        alert(`Reconciliation complete! Updated fields:\n${data.changes.map((c: any) => `${c.field}: ${c.oldVal} -> ${c.newVal}`).join('\n')}`);
        fetchClinicalData();
      } else {
        alert('Reconciliation complete. Profile is already up-to-date with EHR.');
      }
    } catch (error: any) {
      alert('Reconciliation failed: ' + error.message);
    } finally {
      setReconciling(false);
    }
  };

  const handleRetryQueue = async () => {
    setRetryingQueue(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/interop/retry`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      alert(`Retry process completed. Processed: ${data.processed}, Succeeded: ${data.succeeded}`);
      fetchSyncLogs();
    } catch (error: any) {
      alert('Retry queue execution failed: ' + error.message);
    } finally {
      setRetryingQueue(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/fhir/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider,
          fhirServerUrl,
          clientId,
          redirectUri: `${window.location.origin}/api/fhir/callback`,
          scope
        })
      });
      const data = await response.json();
      if (data.success && data.authorizationUrl) {
        // Open authorization redirect in a popup
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(
          data.authorizationUrl,
          'SMART on FHIR Connection',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
        );
      } else {
        alert('Failed to connect: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      alert('Error establishing connection: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleSyncConsultation = async (consultationId: string) => {
    setSyncLoading(consultationId);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/fhir/sync/${consultationId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSyncStatusMap(prev => ({
          ...prev,
          [consultationId]: { success: true, id: data.data.bundleId }
        }));
        fetchSyncLogs(); // Refresh logs after successful manual sync
      } else {
        alert('Sync failed: ' + (data.error || 'EHR rejection'));
      }
    } catch (error: any) {
      alert('Error during synchronization: ' + error.message);
    } finally {
      setSyncLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw style={styles.spinner} />
        <p>Loading EHR Connection Details...</p>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.titleArea}>
            <Database size={24} color="#3b82f6" />
            <h2 style={styles.title}>Enterprise EHR Connection</h2>
          </div>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <div style={styles.content}>
          {!connectionStatus?.connected ? (
            <div style={styles.connectPanel}>
              <div style={styles.infoBox}>
                <Shield size={20} color="#10b981" />
                <p>Connect your voice agent with FHIR-compliant Electronic Health Record (EHR) platforms (Epic, Cerner, Athenahealth) using SMART on FHIR authorization protocols.</p>
              </div>

              <form onSubmit={handleConnect} style={styles.form}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Select EHR Sandbox Provider</label>
                  <select value={provider} onChange={handleSandboxChange} style={styles.select}>
                    <option value="smart">SMART Health IT Sandbox (Generic R4)</option>
                    <option value="epic">Epic Sandbox (Simulated)</option>
                    <option value="cerner">Cerner Sandbox (Simulated)</option>
                    <option value="athena">Athenahealth Sandbox</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>EHR FHIR Server Base URL</label>
                  <input 
                    type="text" 
                    value={fhirServerUrl} 
                    onChange={e => setFhirServerUrl(e.target.value)} 
                    style={styles.input} 
                    required 
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>OAuth 2.0 Client ID</label>
                  <input 
                    type="text" 
                    value={clientId} 
                    onChange={e => setClientId(e.target.value)} 
                    style={styles.input} 
                    required 
                  />
                </div>

                <button type="submit" disabled={connecting} style={styles.submitButton}>
                  {connecting ? 'Authenticating with EHR...' : 'Authorize SMART on FHIR'}
                </button>
              </form>
            </div>
          ) : (
            <div style={styles.connectedDashboard}>
              <div style={styles.ehrStatusCard}>
                <div style={styles.statusRow}>
                  <div style={styles.statusLeft}>
                    <CheckCircle size={22} color="#10b981" />
                    <div>
                      <h3>EHR Server Active</h3>
                      <p>{connectionStatus.fhirServerUrl}</p>
                    </div>
                  </div>
                  <div style={styles.statusBadge}>
                    <span>Connected ({connectionStatus.provider.toUpperCase()})</span>
                  </div>
                </div>
                <div style={styles.metaRow}>
                  <span><strong>EHR Patient ID:</strong> {connectionStatus.patientId}</span>
                  <span><strong>Auth Expiry:</strong> {new Date(connectionStatus.tokenExpiresAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Aggregated Clinical Chart View */}
              <div style={styles.clinicalSection}>
                <h3>Real-Time EHR Patient Chart</h3>
                
                <div style={styles.tabBar}>
                  <button onClick={() => setActiveTab('profile')} style={{...styles.tabButton, ...(activeTab === 'profile' ? styles.tabActive : {})}}>Patient Profile</button>
                  <button onClick={() => setActiveTab('medications')} style={{...styles.tabButton, ...(activeTab === 'medications' ? styles.tabActive : {})}}>Medications</button>
                  <button onClick={() => setActiveTab('allergies')} style={{...styles.tabButton, ...(activeTab === 'allergies' ? styles.tabActive : {})}}>Allergies</button>
                  <button onClick={() => setActiveTab('vitals')} style={{...styles.tabButton, ...(activeTab === 'vitals' ? styles.tabActive : {})}}>Vitals</button>
                  <button onClick={() => setActiveTab('conditions')} style={{...styles.tabButton, ...(activeTab === 'conditions' ? styles.tabActive : {})}}>Conditions</button>
                  <button onClick={() => setActiveTab('appointments')} style={{...styles.tabButton, ...(activeTab === 'appointments' ? styles.tabActive : {})}}>Appointments</button>
                  <button onClick={() => setActiveTab('reports')} style={{...styles.tabButton, ...(activeTab === 'reports' ? styles.tabActive : {})}}>Reports</button>
                </div>

                <div style={styles.tabContent}>
                  {clinicalData ? (
                    <>
                      {activeTab === 'profile' && (
                        <div>
                          <div style={styles.profileGrid}>
                            <div style={styles.profileItem}>
                              <strong>Patient Name</strong>
                              <p>{clinicalData.patient?.name?.[0]?.text || clinicalData.patient?.name?.[0]?.family || 'N/A'}</p>
                            </div>
                            <div style={styles.profileItem}>
                              <strong>Gender</strong>
                              <p style={{textTransform: 'capitalize'}}>{clinicalData.patient?.gender || 'N/A'}</p>
                            </div>
                            <div style={styles.profileItem}>
                              <strong>Date of Birth</strong>
                              <p>{clinicalData.patient?.birthDate || 'N/A'}</p>
                            </div>
                            <div style={styles.profileItem}>
                              <strong>Address</strong>
                              <p>{clinicalData.patient?.address?.[0]?.text || clinicalData.patient?.address?.[0]?.city || 'N/A'}</p>
                            </div>
                          </div>
                          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                            <button 
                              onClick={handleReconcile} 
                              disabled={reconciling} 
                              style={styles.reconcileBtn}
                            >
                              {reconciling ? 'Reconciling...' : 'Reconcile Demographics'}
                            </button>
                          </div>
                        </div>
                      )}

                      {activeTab === 'medications' && (
                        <div style={styles.clinicalList}>
                          {clinicalData.medications?.length > 0 ? (
                            clinicalData.medications.map((med: any, idx: number) => (
                              <div key={idx} style={styles.clinicalListItem}>
                                <div style={styles.itemTitle}>💊 {med.medicationCodeableConcept?.text || 'Unnamed Medication'}</div>
                                <div style={styles.itemMeta}>Status: {med.status} | Instruction: {med.dosageInstruction?.[0]?.text || 'As directed'}</div>
                              </div>
                            ))
                          ) : <p style={styles.emptyState}>No medications listed in EHR.</p>}
                        </div>
                      )}

                      {activeTab === 'allergies' && (
                        <div style={styles.clinicalList}>
                          {clinicalData.allergies?.length > 0 ? (
                            clinicalData.allergies.map((all: any, idx: number) => (
                              <div key={idx} style={styles.clinicalListItem}>
                                <div style={styles.itemTitle}>⚠️ {all.code?.text || 'Allergy Details'}</div>
                                <div style={styles.itemMeta}>Category: {all.category?.join(', ') || 'N/A'} | Criticality: {all.criticality || 'N/A'}</div>
                              </div>
                            ))
                          ) : <p style={styles.emptyState}>No allergies listed in EHR.</p>}
                        </div>
                      )}

                      {activeTab === 'vitals' && (
                        <div style={styles.clinicalList}>
                          {clinicalData.observations?.length > 0 ? (
                            clinicalData.observations.map((obs: any, idx: number) => (
                              <div key={idx} style={styles.clinicalListItem}>
                                <div style={styles.itemTitle}>📊 {obs.code?.text || 'Observation'}</div>
                                <div style={styles.itemMeta}>Value: {obs.valueQuantity ? `${obs.valueQuantity.value} ${obs.valueQuantity.unit}` : obs.valueString || 'N/A'} | Date: {new Date(obs.effectiveDateTime).toLocaleDateString()}</div>
                              </div>
                            ))
                          ) : <p style={styles.emptyState}>No vital observations listed in EHR.</p>}
                        </div>
                      )}

                      {activeTab === 'conditions' && (
                        <div style={styles.clinicalList}>
                          {clinicalData.conditions?.length > 0 ? (
                            clinicalData.conditions.map((cond: any, idx: number) => (
                              <div key={idx} style={styles.clinicalListItem}>
                                <div style={styles.itemTitle}>🩺 {cond.code?.text || 'Condition Assessment'}</div>
                                <div style={styles.itemMeta}>Severity: {cond.severity?.text || 'N/A'} | Status: {cond.clinicalStatus?.coding?.[0]?.code || 'N/A'}</div>
                              </div>
                            ))
                          ) : <p style={styles.emptyState}>No clinical conditions listed in EHR.</p>}
                        </div>
                      )}

                      {activeTab === 'appointments' && (
                        <div style={styles.clinicalList}>
                          {clinicalData.appointments?.length > 0 ? (
                            clinicalData.appointments.map((apt: any, idx: number) => (
                              <div key={idx} style={styles.clinicalListItem}>
                                <div style={styles.itemTitle}>📅 {apt.description || 'EHR Appointment Slot'}</div>
                                <div style={styles.itemMeta}>Date: {new Date(apt.start).toLocaleString()} | Status: {apt.status}</div>
                              </div>
                            ))
                          ) : <p style={styles.emptyState}>No appointments found in EHR.</p>}
                        </div>
                      )}

                      {activeTab === 'reports' && (
                        <div style={styles.clinicalList}>
                          {clinicalData.reports?.length > 0 ? (
                            clinicalData.reports.map((rep: any, idx: number) => (
                              <div key={idx} style={styles.clinicalListItem}>
                                <div style={styles.itemTitle}>🔬 {rep.code?.text || 'Diagnostic Report'}</div>
                                <div style={styles.itemMeta}>Status: {rep.status} | Conclusion: {rep.conclusion || 'Pending'}</div>
                              </div>
                            ))
                          ) : <p style={styles.emptyState}>No diagnostic reports found in EHR.</p>}
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={styles.loadingPlaceholder}>Retrieving clinical data from EHR Server...</p>
                  )}
                </div>
              </div>

              {/* Consultation Synchronization List */}
              <div style={styles.syncSection}>
                <h3>Local Consultations Sync Dashboard</h3>
                <div style={styles.syncList}>
                  {consultations.length > 0 ? (
                    consultations.map((consult) => {
                      const status = syncStatusMap[consult.id];
                      return (
                        <div key={consult.id} style={styles.syncRow}>
                          <div style={styles.syncRowInfo}>
                            <strong>{consult.specialistName || 'General Consultation'}</strong>
                            <span>{new Date(consult.startedAt).toLocaleDateString()} — {consult.symptoms?.substring(0, 40) || 'No symptoms details'}...</span>
                          </div>
                          
                          <div style={styles.syncRowAction}>
                            {status?.success ? (
                              <div style={styles.syncedTag}>
                                <Check size={16} />
                                <span>Synced ({status.id.substring(0, 8)})</span>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleSyncConsultation(consult.id)}
                                disabled={syncLoading === consult.id}
                                style={styles.syncBtn}
                              >
                                {syncLoading === consult.id ? 'Syncing...' : 'Sync to EHR'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={styles.emptyState}>No local consultation sessions recorded to sync.</p>
                  )}
                </div>
              </div>

              {/* FHIR Sync Audit & Logs */}
              <div style={styles.syncSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>FHIR Sync Audit & Logs</h3>
                  <button 
                    onClick={handleRetryQueue} 
                    disabled={retryingQueue} 
                    style={styles.retryQueueBtn}
                  >
                    {retryingQueue ? 'Retrying Failed...' : 'Retry Failed Queue'}
                  </button>
                </div>
                <div style={styles.syncList}>
                  {syncLogs.length > 0 ? (
                    syncLogs.map((log: any) => (
                      <div key={log.id} style={styles.syncRow}>
                        <div style={styles.syncRowInfo}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong>{log.resourceType} Sync</strong>
                            <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#64748b' }}>v{log.version}</span>
                          </div>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            Last Sync: {new Date(log.updatedAt).toLocaleString()}
                          </span>
                          {log.error && (
                            <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>
                              Error: {log.error}
                            </span>
                          )}
                        </div>
                        <div style={styles.syncRowAction}>
                          {log.status === 'success' ? (
                            <div style={styles.syncedTag}>
                              <CheckCircle size={16} />
                              <span>Synced</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>
                              <AlertCircle size={16} />
                              <span>Failed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={styles.emptyState}>No synchronization logs found.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline sleek styling aligning with vanilla CSS & glassmorphism details
const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  container: {
    width: '90%',
    maxWidth: '850px',
    height: '85%',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    border: '1px solid var(--border-color)'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0 8px'
  },
  content: {
    padding: '24px',
    overflowY: 'auto' as const,
    flex: 1
  },
  connectPanel: {
    maxWidth: '500px',
    margin: '40px auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px'
  },
  infoBox: {
    backgroundColor: 'var(--status-completed-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    color: 'var(--status-completed-text)',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  select: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none'
  },
  submitButton: {
    marginTop: '10px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  connectedDashboard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px'
  },
  ehrStatusCard: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '18px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusLeft: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  statusBadge: {
    backgroundColor: 'var(--status-completed-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '4px 12px',
    color: 'var(--status-completed-text)',
    fontSize: '12px',
    fontWeight: '600'
  },
  metaRow: {
    display: 'flex',
    gap: '24px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px'
  },
  clinicalSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid var(--border-color)',
    overflowX: 'auto' as const,
    paddingBottom: '2px'
  },
  tabButton: {
    background: 'none',
    border: 'none',
    padding: '8px 16px',
    fontSize: '13px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap' as const
  },
  tabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
    fontWeight: '600'
  },
  tabContent: {
    minHeight: '120px',
    padding: '16px',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-primary)'
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  profileItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
  },
  clinicalList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  clinicalListItem: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px'
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  itemMeta: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '4px'
  },
  syncSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  syncList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    maxHeight: '200px',
    overflowY: 'auto' as const
  },
  syncRow: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '14px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  syncRowInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
  },
  syncRowAction: {
    display: 'flex',
    alignItems: 'center'
  },
  syncBtn: {
    backgroundColor: 'var(--badge-bg)',
    color: 'var(--badge-text)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  syncedTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#10b981',
    fontSize: '13px',
    fontWeight: '600'
  },
  emptyState: {
    textAlign: 'center' as const,
    color: 'var(--text-muted)',
    fontSize: '14px',
    padding: '24px'
  },
  loadingPlaceholder: {
    textAlign: 'center' as const,
    color: 'var(--text-muted)',
    fontSize: '14px',
    padding: '24px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    padding: '40px',
    color: 'var(--text-secondary)'
  },
  spinner: {
    animation: 'spin 1.5s linear infinite'
  },
  reconcileBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  retryQueueBtn: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};
