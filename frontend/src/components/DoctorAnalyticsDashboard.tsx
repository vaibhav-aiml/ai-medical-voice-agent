import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, Calendar, Star, Activity, BarChart3,
  Clock, Stethoscope, Heart, Brain, Bone, Baby,
  Download, RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalPatients: number;
  totalConsultations: number;
  averageRating: number;
  patientSatisfaction: number;
  consultationTrends: {
    daily: { date: string; count: number }[];
    weekly: { week: string; count: number }[];
    monthly: { month: string; count: number }[];
  };
  commonSymptoms: { symptom: string; count: number; percentage: number }[];
  specialistDistribution: { specialist: string; count: number; percentage: number }[];
  patientDemographics: {
    ageGroups: { group: string; count: number; percentage: number }[];
    genderDistribution: { gender: string; count: number; percentage: number }[];
  };
  recentConsultations: {
    id: string;
    patientName: string;
    specialistType: string;
    date: Date;
    symptoms: string;
    duration: number;
    rating?: number;
  }[];
  peakHours: { hour: number; count: number }[];
  topDoctors: { name: string; consultations: number; rating: number }[];
}

interface Props {
  consultations: any[];
  ratings?: any;
  onClose?: () => void;
}

const DoctorAnalyticsDashboard: React.FC<Props> = ({ consultations, ratings, onClose }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'symptoms' | 'specialists' | 'patients'>('overview');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  // ✅ CORRECT - Just the URL, no extra text
  const API_URL = 'https://ai-medical-voice-agent-ygc5.onrender.com';

  useEffect(() => {
    fetchAnalytics();
  }, [consultations, ratings]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/api/analytics/dashboard`;
      console.log('Fetching analytics from:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consultations, ratings }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getSpecialistIcon = (type: string) => {
    switch(type) {
      case 'general': return <Stethoscope size={16} />;
      case 'orthopedic': return <Bone size={16} />;
      case 'cardiologist': return <Heart size={16} />;
      case 'neurologist': return <Brain size={16} />;
      case 'pediatrician': return <Baby size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getSpecialistTypeName = (type: string) => {
    const names: Record<string, string> = {
      general: 'General Physician',
      orthopedic: 'Orthopedic',
      cardiologist: 'Cardiologist',
      neurologist: 'Neurologist',
      pediatrician: 'Pediatrician',
    };
    return names[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading analytics dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.errorContainer}>
            <p style={{ color: '#ef4444' }}>Error: {error}</p>
            <button onClick={fetchAnalytics} style={styles.retryButton}>
              <RefreshCw size={16} /> Retry
            </button>
            {onClose && <button onClick={onClose} style={styles.closeButton}>Close</button>}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const getTrendData = () => {
    switch(dateRange) {
      case 'week': return analytics.consultationTrends.daily.slice(-7);
      case 'month': return analytics.consultationTrends.daily.slice(-30);
      default: return analytics.consultationTrends.monthly;
    }
  };

  const maxCount = Math.max(...getTrendData().map(d => d.count), 1);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <TrendingUp size={24} color="#00C2FF" />
            <div>
              <h2 style={styles.title}>Doctor Analytics Dashboard</h2>
              <p style={styles.subtitle}>Comprehensive insights into your practice</p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button onClick={fetchAnalytics} style={styles.refreshBtn}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button style={styles.exportBtn}>
              <Download size={16} /> Export
            </button>
            {onClose && (
              <button onClick={onClose} style={styles.closeBtn}>×</button>
            )}
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}><Users size={20} /></div>
            <div>
              <div style={styles.statNumber}>{analytics.totalPatients}</div>
              <div style={styles.statLabel}>Total Patients</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}><Calendar size={20} /></div>
            <div>
              <div style={styles.statNumber}>{analytics.totalConsultations}</div>
              <div style={styles.statLabel}>Consultations</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}><Star size={20} color="#f59e0b" /></div>
            <div>
              <div style={styles.statNumber}>{analytics.averageRating.toFixed(1)}</div>
              <div style={styles.statLabel}>Avg Rating</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}><Activity size={20} color="#10b981" /></div>
            <div>
              <div style={styles.statNumber}>{Math.round(analytics.patientSatisfaction)}%</div>
              <div style={styles.statLabel}>Satisfaction</div>
            </div>
          </div>
        </div>

        <div style={styles.tabs}>
          <button onClick={() => setActiveTab('overview')} style={{ ...styles.tab, ...(activeTab === 'overview' ? styles.activeTab : {}) }}>
            <BarChart3 size={16} /> Overview
          </button>
          <button onClick={() => setActiveTab('symptoms')} style={{ ...styles.tab, ...(activeTab === 'symptoms' ? styles.activeTab : {}) }}>
            <Activity size={16} /> Common Symptoms
          </button>
          <button onClick={() => setActiveTab('specialists')} style={{ ...styles.tab, ...(activeTab === 'specialists' ? styles.activeTab : {}) }}>
            <Stethoscope size={16} /> Specialists
          </button>
          <button onClick={() => setActiveTab('patients')} style={{ ...styles.tab, ...(activeTab === 'patients' ? styles.activeTab : {}) }}>
            <Users size={16} /> Patient Demographics
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === 'overview' && (
            <>
              <div style={styles.dateRange}>
                <button onClick={() => setDateRange('week')} style={{ ...styles.rangeBtn, ...(dateRange === 'week' ? styles.activeRange : {}) }}>Last 7 Days</button>
                <button onClick={() => setDateRange('month')} style={{ ...styles.rangeBtn, ...(dateRange === 'month' ? styles.activeRange : {}) }}>Last 30 Days</button>
                <button onClick={() => setDateRange('year')} style={{ ...styles.rangeBtn, ...(dateRange === 'year' ? styles.activeRange : {}) }}>Monthly</button>
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Consultation Trends</h3>
                <div style={styles.chartContainer}>
                  {getTrendData().map((item: any, idx: number) => {
                    const height = (item.count / maxCount) * 150;
                    return (
                      <div key={idx} style={styles.barWrapper}>
                        <div style={styles.barLabel}>{dateRange === 'year' ? item.month : item.date?.slice(5)}</div>
                        <div style={styles.barContainer}>
                          <div style={{ ...styles.bar, height: `${height}px` }} />
                        </div>
                        <div style={styles.barValue}>{item.count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={styles.twoColumnGrid}>
                <div style={styles.infoCard}>
                  <h3 style={styles.infoTitle}><Clock size={16} /> Peak Consultation Hours</h3>
                  {analytics.peakHours.map((hour: any) => (
                    <div key={hour.hour} style={styles.peakHourItem}>
                      <span>{hour.hour}:00 - {hour.hour + 1}:00</span>
                      <span style={{ color: '#00C2FF' }}>{hour.count} consultations</span>
                    </div>
                  ))}
                </div>

                <div style={styles.infoCard}>
                  <h3 style={styles.infoTitle}><Star size={16} /> Top Performing Specialists</h3>
                  {analytics.topDoctors.map((doctor: any, idx: number) => (
                    <div key={idx} style={styles.topDoctorItem}>
                      <div style={styles.topDoctorRank}>{idx + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff' }}>{doctor.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{doctor.consultations} consultations</div>
                      </div>
                      <div style={{ color: '#f59e0b' }}>⭐ {doctor.rating.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'symptoms' && (
            <div>
              {analytics.commonSymptoms.map((symptom: any, idx: number) => (
                <div key={idx} style={styles.symptomCard}>
                  <div style={styles.symptomRank}>{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', textTransform: 'capitalize' }}>{symptom.symptom}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{symptom.count} reports</div>
                  </div>
                  <div style={{ width: 120 }}>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${symptom.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #00C2FF, #0066FF)', borderRadius: 3 }} />
                    </div>
                  </div>
                  <div style={{ width: 45, textAlign: 'right', color: '#00C2FF' }}>{Math.round(symptom.percentage)}%</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'specialists' && (
            <div>
              {analytics.specialistDistribution.map((spec: any, idx: number) => (
                <div key={idx} style={styles.specialistCard}>
                  <div style={styles.specialistIcon}>{getSpecialistIcon(spec.specialist)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff' }}>{getSpecialistTypeName(spec.specialist)}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{spec.count} consultations</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#00C2FF' }}>{Math.round(spec.percentage)}%</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'patients' && (
            <div style={styles.twoColumnGrid}>
              <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>Age Distribution</h3>
                {analytics.patientDemographics.ageGroups.map((group: any) => (
                  <div key={group.group} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#fff' }}>{group.group}</span>
                      <span style={{ color: '#00C2FF' }}>{Math.round(group.percentage)}%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${group.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #00C2FF, #0066FF)', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>Gender Distribution</h3>
                {analytics.patientDemographics.genderDistribution.map((gender: any) => (
                  <div key={gender.gender} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#fff' }}>{gender.gender}</span>
                      <span style={{ color: '#00C2FF' }}>{Math.round(gender.percentage)}%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${gender.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #00C2FF, #0066FF)', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={styles.recentSection}>
          <h3 style={styles.recentTitle}>📋 Recent Consultations</h3>
          {analytics.recentConsultations.map((c: any) => (
            <div key={c.id} style={styles.recentRow}>
              <div><span style={{ fontWeight: 600 }}>{c.patientName}</span><br /><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{new Date(c.date).toLocaleDateString()}</span></div>
              <div><span style={{ color: '#00C2FF' }}>{getSpecialistTypeName(c.specialistType)}</span><br /><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{c.duration} min</span></div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{c.symptoms?.substring(0, 40)}...</div>
              <div>{c.rating ? `⭐ ${c.rating}` : 'Not rated'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1px solid rgba(0,180,255,0.2)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid rgba(0,180,255,0.15)',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '4px',
  },
  headerRight: {
    display: 'flex',
    gap: '12px',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(0,180,255,0.2)',
    borderRadius: '8px',
    color: '#00C2FF',
    cursor: 'pointer',
    fontSize: '12px',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'linear-gradient(90deg, #0066FF, #00C2FF)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '20px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    padding: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(0,180,255,0.1)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    background: 'rgba(0,180,255,0.1)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00C2FF',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#fff',
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    padding: '0 24px',
    borderBottom: '1px solid rgba(0,180,255,0.15)',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '14px',
  },
  activeTab: {
    background: 'rgba(0,180,255,0.1)',
    color: '#00C2FF',
  },
  content: {
    padding: '24px',
  },
  dateRange: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  rangeBtn: {
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(0,180,255,0.2)',
    borderRadius: '6px',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '12px',
  },
  activeRange: {
    background: 'rgba(0,180,255,0.15)',
    color: '#00C2FF',
    borderColor: '#00C2FF',
  },
  chartCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
  },
  chartTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '20px',
  },
  chartContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    height: '200px',
    overflowX: 'auto',
    padding: '10px 0',
  },
  barWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    minWidth: '50px',
  },
  barLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
  },
  barContainer: {
    height: '150px',
    display: 'flex',
    alignItems: 'flex-end',
  },
  bar: {
    width: '30px',
    background: 'linear-gradient(180deg, #00C2FF, #0066FF)',
    borderRadius: '4px',
  },
  barValue: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  infoCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    padding: '20px',
  },
  infoTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '16px',
  },
  peakHourItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  topDoctorItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  topDoctorRank: {
    width: '28px',
    height: '28px',
    background: 'rgba(0,180,255,0.15)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    color: '#00C2FF',
  },
  symptomCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    marginBottom: '8px',
  },
  symptomRank: {
    width: '32px',
    height: '32px',
    background: 'rgba(0,180,255,0.15)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    color: '#00C2FF',
  },
  specialistCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    marginBottom: '8px',
  },
  specialistIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(0,180,255,0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00C2FF',
  },
  recentSection: {
    padding: '24px',
    borderTop: '1px solid rgba(0,180,255,0.15)',
  },
  recentTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '16px',
  },
  recentRow: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 2fr 0.8fr',
    gap: '16px',
    padding: '12px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '8px',
    marginBottom: '8px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(0,180,255,0.2)',
    borderTopColor: '#00C2FF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    gap: '16px',
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  closeButton: {
    padding: '10px 20px',
    background: '#ef4444',
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
document.head.appendChild(styleSheet);

export default DoctorAnalyticsDashboard;