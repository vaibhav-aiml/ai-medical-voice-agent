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
  const [activeTab, setActiveTab] = useState<'overview' | 'symptoms' | 'specialists' | 'patients'>('overview');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [consultations, ratings]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultations, ratings }),
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
    return names[type] || type;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading analytics dashboard...</p>
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
            <TrendingUp size={24} style={styles.headerIcon} />
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
            <div style={styles.statIcon}><Star size={20} style={{ color: '#f59e0b' }} /></div>
            <div>
              <div style={styles.statNumber}>{analytics.averageRating.toFixed(1)}</div>
              <div style={styles.statLabel}>Avg Rating</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}><Activity size={20} style={{ color: '#10b981' }} /></div>
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
                  {getTrendData().map((item, idx) => {
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
                  <div style={styles.peakHoursGrid}>
                    {analytics.peakHours.map(hour => (
                      <div key={hour.hour} style={styles.peakHourItem}>
                        <span style={styles.peakHourTime}>{hour.hour}:00 - {hour.hour + 1}:00</span>
                        <span style={styles.peakHourCount}>{hour.count} consultations</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.infoCard}>
                  <h3 style={styles.infoTitle}><Star size={16} /> Top Performing Specialists</h3>
                  {analytics.topDoctors.map((doctor, idx) => (
                    <div key={idx} style={styles.topDoctorItem}>
                      <div style={styles.topDoctorRank}>{idx + 1}</div>
                      <div style={styles.topDoctorInfo}>
                        <div style={styles.topDoctorName}>{doctor.name}</div>
                        <div style={styles.topDoctorStats}>{doctor.consultations} consultations • Rating {doctor.rating.toFixed(1)}</div>
                      </div>
                      <div style={styles.topDoctorRating}>⭐ {doctor.rating.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'symptoms' && (
            <div style={styles.symptomsGrid}>
              {analytics.commonSymptoms.map((symptom, idx) => (
                <div key={idx} style={styles.symptomCard}>
                  <div style={styles.symptomRank}>{idx + 1}</div>
                  <div style={styles.symptomInfo}>
                    <div style={styles.symptomName}>{symptom.symptom}</div>
                    <div style={styles.symptomCount}>{symptom.count} reports</div>
                  </div>
                  <div style={styles.symptomPercentage}>
                    <div style={{ ...styles.symptomBar, width: `${symptom.percentage}%` }} />
                    <span>{Math.round(symptom.percentage)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'specialists' && (
            <div style={styles.specialistGrid}>
              {analytics.specialistDistribution.map((spec, idx) => (
                <div key={idx} style={styles.specialistCard}>
                  <div style={styles.specialistIcon}>{getSpecialistIcon(spec.specialist)}</div>
                  <div style={styles.specialistInfo}>
                    <div style={styles.specialistDisplayName}>{getSpecialistTypeName(spec.specialist)}</div>
                    <div style={styles.specialistCount}>{spec.count} consultations</div>
                  </div>
                  <div style={styles.specialistPercent}>{Math.round(spec.percentage)}%</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'patients' && (
            <div style={styles.twoColumnGrid}>
              <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>Age Distribution</h3>
                {analytics.patientDemographics.ageGroups.map(group => (
                  <div key={group.group} style={styles.demographicItem}>
                    <span style={styles.demographicLabel}>{group.group}</span>
                    <div style={styles.demographicBarContainer}>
                      <div style={{ ...styles.demographicBar, width: `${group.percentage}%` }} />
                    </div>
                    <span style={styles.demographicPercent}>{Math.round(group.percentage)}%</span>
                  </div>
                ))}
              </div>
              <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>Gender Distribution</h3>
                {analytics.patientDemographics.genderDistribution.map(gender => (
                  <div key={gender.gender} style={styles.demographicItem}>
                    <span style={styles.demographicLabel}>{gender.gender}</span>
                    <div style={styles.demographicBarContainer}>
                      <div style={{ ...styles.demographicBar, width: `${gender.percentage}%` }} />
                    </div>
                    <span style={styles.demographicPercent}>{Math.round(gender.percentage)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={styles.recentSection}>
          <h3 style={styles.recentTitle}>📋 Recent Consultations</h3>
          <div style={styles.recentTable}>
            <div style={styles.tableHeader}>
              <span>Patient</span>
              <span>Specialist</span>
              <span>Date</span>
              <span>Symptoms</span>
              <span>Rating</span>
            </div>
            {analytics.recentConsultations.map(consultation => (
              <div key={consultation.id} style={styles.tableRow}>
                <span style={styles.patientNameText}>{consultation.patientName}</span>
                <span style={styles.specialistTypeText}>{getSpecialistTypeName(consultation.specialistType)}</span>
                <span style={styles.dateText}>{new Date(consultation.date).toLocaleDateString()}</span>
                <span style={styles.symptomsText}>{consultation.symptoms.substring(0, 40)}...</span>
                <span style={styles.ratingText}>
                  {consultation.rating ? `⭐ ${consultation.rating}` : 'Not rated'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes spin {
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
    background: 'rgba(0,0,0,0.7)',
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
    overflow: 'auto' as const,
    border: '1px solid rgba(0,180,255,0.2)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid rgba(0,180,255,0.15)',
    flexWrap: 'wrap' as const,
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerIcon: {
    color: '#00C2FF',
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
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '20px',
    width: '36px',
    height: '36px',
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
    transition: 'all 0.2s',
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
    border: '1px solid rgba(0,180,255,0.1)',
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
    overflowX: 'auto' as const,
    padding: '10px 0',
  },
  barWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
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
    transition: 'height 0.3s',
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
    border: '1px solid rgba(0,180,255,0.1)',
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
  peakHoursGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  peakHourItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  peakHourTime: {
    fontSize: '13px',
    color: '#fff',
  },
  peakHourCount: {
    fontSize: '12px',
    color: '#00C2FF',
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
    fontSize: '12px',
    fontWeight: 600,
    color: '#00C2FF',
  },
  topDoctorInfo: {
    flex: 1,
  },
  topDoctorName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#fff',
  },
  topDoctorStats: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
  },
  topDoctorRating: {
    fontSize: '12px',
    color: '#f59e0b',
  },
  symptomsGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  symptomCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
  },
  symptomRank: {
    width: '32px',
    height: '32px',
    background: 'rgba(0,180,255,0.15)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    color: '#00C2FF',
  },
  symptomInfo: {
    flex: 1,
  },
  symptomName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#fff',
    textTransform: 'capitalize' as const,
  },
  symptomCount: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
  },
  symptomPercentage: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '120px',
  },
  symptomBar: {
    height: '6px',
    background: 'linear-gradient(90deg, #00C2FF, #0066FF)',
    borderRadius: '3px',
  },
  specialistGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  specialistCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
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
  specialistInfo: {
    flex: 1,
  },
  specialistDisplayName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#fff',
  },
  specialistCount: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
  },
  specialistPercent: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#00C2FF',
  },
  demographicItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  demographicLabel: {
    width: '60px',
    fontSize: '13px',
    color: '#fff',
  },
  demographicBarContainer: {
    flex: 1,
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  demographicBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #00C2FF, #0066FF)',
    borderRadius: '4px',
  },
  demographicPercent: {
    width: '45px',
    fontSize: '12px',
    color: '#00C2FF',
    textAlign: 'right' as const,
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
  recentTable: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 2fr 0.8fr',
    padding: '12px',
    background: 'rgba(0,180,255,0.1)',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#00C2FF',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 2fr 0.8fr',
    padding: '12px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
  },
  patientNameText: {
    fontWeight: 500,
    color: '#fff',
  },
  specialistTypeText: {
    color: '#00C2FF',
  },
  dateText: {
    color: 'rgba(255,255,255,0.5)',
  },
  symptomsText: {
    color: 'rgba(255,255,255,0.6)',
  },
  ratingText: {
    color: '#f59e0b',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(0,180,255,0.2)',
    borderTopColor: '#00C2FF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default DoctorAnalyticsDashboard;