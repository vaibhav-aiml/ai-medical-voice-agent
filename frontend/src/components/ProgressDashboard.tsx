import { useState, useEffect } from 'react';
import { X, TrendingUp, Activity, Droplet, Moon, Flame, Brain, Calendar, Award, Target, BarChart3, LineChart, PieChart } from 'lucide-react';

interface HealthData {
  date: string;
  water: number;
  steps: number;
  sleep: number;
  calories: number;
  mood: number;
}

interface ConsultationData {
  id: string;
  date: Date;
  specialistType: string;
  duration: number;
  rating?: number;
}

interface Props {
  onClose: () => void;
}

export default function ProgressDashboard({ onClose }: Props) {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [activeTab, setActiveTab] = useState<'health' | 'consultations' | 'insights'>('health');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadHealthData();
    loadConsultations();
  }, []);

  const loadHealthData = () => {
    const saved = localStorage.getItem('dailyHealthLogs');
    if (saved) {
      const parsed = JSON.parse(saved);
      setHealthData(parsed.sort((a: HealthData, b: HealthData) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } else {
      // Generate mock data for demo
      const mockData: HealthData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toISOString().split('T')[0],
          water: Math.floor(Math.random() * 8) + 2,
          steps: Math.floor(Math.random() * 8000) + 2000,
          sleep: Math.floor(Math.random() * 4) + 5,
          calories: Math.floor(Math.random() * 1000) + 1500,
          mood: Math.floor(Math.random() * 5) + 1,
        });
      }
      setHealthData(mockData);
    }
  };

  const loadConsultations = () => {
    const userId = localStorage.getItem('userId') || 'user';
    const saved = localStorage.getItem(`consultations_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      const ratings = JSON.parse(localStorage.getItem('consultationRatings') || '{}');
      const formatted = parsed.map((c: any) => ({
        id: c.id,
        date: new Date(c.startedAt),
        specialistType: c.specialistType,
        duration: c.duration,
        rating: ratings[c.id]?.rating,
      }));
      setConsultations(formatted);
    }
  };

  const getFilteredHealthData = () => {
    const now = new Date();
    const filterDays = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const cutoff = new Date(now.setDate(now.getDate() - filterDays));
    return healthData.filter(d => new Date(d.date) >= cutoff);
  };

  const getFilteredConsultations = () => {
    const now = new Date();
    const filterDays = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const cutoff = new Date(now.setDate(now.getDate() - filterDays));
    return consultations.filter(c => c.date >= cutoff);
  };

  const calculateAverages = () => {
    const filtered = getFilteredHealthData();
    if (filtered.length === 0) return { water: 0, steps: 0, sleep: 0, calories: 0, mood: 0 };
    
    return {
      water: Math.round(filtered.reduce((acc, d) => acc + d.water, 0) / filtered.length),
      steps: Math.round(filtered.reduce((acc, d) => acc + d.steps, 0) / filtered.length),
      sleep: (filtered.reduce((acc, d) => acc + d.sleep, 0) / filtered.length).toFixed(1),
      calories: Math.round(filtered.reduce((acc, d) => acc + d.calories, 0) / filtered.length),
      mood: (filtered.reduce((acc, d) => acc + d.mood, 0) / filtered.length).toFixed(1),
    };
  };

  const calculateTrend = (key: keyof HealthData) => {
    const filtered = getFilteredHealthData();
    if (filtered.length < 2) return 0;
    const recent = filtered.slice(-3).reduce((acc, d) => acc + (d[key] as number), 0) / 3;
    const previous = filtered.slice(-6, -3).reduce((acc, d) => acc + (d[key] as number), 0) / 3;
    return recent > previous ? 'up' : recent < previous ? 'down' : 'same';
  };

  const averages = calculateAverages();
  const filteredConsultations = getFilteredConsultations();
  const avgRating = filteredConsultations.filter(c => c.rating).reduce((acc, c) => acc + (c.rating || 0), 0) / (filteredConsultations.filter(c => c.rating).length || 1);
  const totalMinutes = filteredConsultations.reduce((acc, c) => acc + c.duration, 0);
  const specialistCounts = filteredConsultations.reduce((acc, c) => {
    acc[c.specialistType] = (acc[c.specialistType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getMoodEmoji = (mood: number) => {
    const moods = ['😫', '😔', '😐', '🙂', '😁'];
    return moods[mood - 1] || '😐';
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <TrendingUp size={24} />
          </div>
          <h2 style={styles.title}>Progress Dashboard</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('health')}
            style={{ ...styles.tab, ...(activeTab === 'health' ? styles.tabActive : {}) }}
          >
            <Activity size={16} /> Health Metrics
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            style={{ ...styles.tab, ...(activeTab === 'consultations' ? styles.tabActive : {}) }}
          >
            <Calendar size={16} /> Consultations
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            style={{ ...styles.tab, ...(activeTab === 'insights' ? styles.tabActive : {}) }}
          >
            <Brain size={16} /> Insights
          </button>
        </div>

        <div style={styles.timeRangeSelector}>
          <button onClick={() => setTimeRange('week')} style={{ ...styles.rangeButton, ...(timeRange === 'week' ? styles.rangeActive : {}) }}>Week</button>
          <button onClick={() => setTimeRange('month')} style={{ ...styles.rangeButton, ...(timeRange === 'month' ? styles.rangeActive : {}) }}>Month</button>
          <button onClick={() => setTimeRange('year')} style={{ ...styles.rangeButton, ...(timeRange === 'year' ? styles.rangeActive : {}) }}>Year</button>
        </div>

        <div style={styles.content}>
          {activeTab === 'health' && (
            <>
              {/* Summary Cards */}
              <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                  <Droplet size={20} color="#3b82f6" />
                  <div>
                    <div style={styles.summaryValue}>{averages.water} glasses</div>
                    <div style={styles.summaryLabel}>Daily Water</div>
                  </div>
                  <span style={{ ...styles.trend, color: calculateTrend('water') === 'up' ? '#10b981' : '#ef4444' }}>
                    {calculateTrend('water') === 'up' ? '↑' : calculateTrend('water') === 'down' ? '↓' : '→'}
                  </span>
                </div>
                <div style={styles.summaryCard}>
                  <Activity size={20} color="#10b981" />
                  <div>
                    <div style={styles.summaryValue}>{averages.steps.toLocaleString()}</div>
                    <div style={styles.summaryLabel}>Daily Steps</div>
                  </div>
                  <span style={{ ...styles.trend, color: calculateTrend('steps') === 'up' ? '#10b981' : '#ef4444' }}>
                    {calculateTrend('steps') === 'up' ? '↑' : calculateTrend('steps') === 'down' ? '↓' : '→'}
                  </span>
                </div>
                <div style={styles.summaryCard}>
                  <Moon size={20} color="#8b5cf6" />
                  <div>
                    <div style={styles.summaryValue}>{averages.sleep} hrs</div>
                    <div style={styles.summaryLabel}>Sleep</div>
                  </div>
                  <span style={{ ...styles.trend, color: calculateTrend('sleep') === 'up' ? '#10b981' : '#ef4444' }}>
                    {calculateTrend('sleep') === 'up' ? '↑' : calculateTrend('sleep') === 'down' ? '↓' : '→'}
                  </span>
                </div>
                <div style={styles.summaryCard}>
                  <Flame size={20} color="#f59e0b" />
                  <div>
                    <div style={styles.summaryValue}>{averages.calories}</div>
                    <div style={styles.summaryLabel}>Calories</div>
                  </div>
                  <span style={{ ...styles.trend, color: calculateTrend('calories') === 'up' ? '#10b981' : '#ef4444' }}>
                    {calculateTrend('calories') === 'up' ? '↑' : calculateTrend('calories') === 'down' ? '↓' : '→'}
                  </span>
                </div>
              </div>

              {/* Mood Tracker */}
              <div style={styles.section}>
                <h3>Mood Tracker</h3>
                <div style={styles.moodGrid}>
                  {getFilteredHealthData().slice(-7).map((day, i) => (
                    <div key={i} style={styles.moodDay}>
                      <div style={styles.moodEmoji}>{getMoodEmoji(day.mood)}</div>
                      <div style={styles.moodDate}>{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Progress Bars */}
              <div style={styles.section}>
                <h3>Weekly Progress</h3>
                {['water', 'steps', 'sleep', 'calories'].map(metric => (
                  <div key={metric} style={styles.progressItem}>
                    <div style={styles.progressLabel}>
                      <span>{metric === 'water' ? '💧 Water' : metric === 'steps' ? '👣 Steps' : metric === 'sleep' ? '😴 Sleep' : '🔥 Calories'}</span>
                      <span>{getFilteredHealthData().slice(-7).reduce((acc, d) => acc + (d[metric as keyof HealthData] as number), 0)} / 
                        {metric === 'water' ? '56' : metric === 'steps' ? '70000' : metric === 'sleep' ? '56' : '14000'} {metric === 'steps' ? 'steps' : metric === 'water' ? 'glasses' : metric === 'sleep' ? 'hrs' : 'kcal'}</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${Math.min(100, (getFilteredHealthData().slice(-7).reduce((acc, d) => acc + (d[metric as keyof HealthData] as number), 0) / 
                          (metric === 'water' ? 56 : metric === 'steps' ? 70000 : metric === 'sleep' ? 56 : 14000)) * 100)}%`
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'consultations' && (
            <>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                  <Calendar size={20} color="#3b82f6" />
                  <div>
                    <div style={styles.summaryValue}>{filteredConsultations.length}</div>
                    <div style={styles.summaryLabel}>Consultations</div>
                  </div>
                </div>
                <div style={styles.summaryCard}>
                  <Star size={20} color="#f59e0b" />
                  <div>
                    <div style={styles.summaryValue}>{avgRating.toFixed(1)}</div>
                    <div style={styles.summaryLabel}>Avg Rating</div>
                  </div>
                </div>
                <div style={styles.summaryCard}>
                  <Clock size={20} color="#10b981" />
                  <div>
                    <div style={styles.summaryValue}>{totalMinutes}</div>
                    <div style={styles.summaryLabel}>Total Minutes</div>
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h3>Specialist Distribution</h3>
                <div style={styles.specialistList}>
                  {Object.entries(specialistCounts).map(([type, count]) => (
                    <div key={type} style={styles.specialistItem}>
                      <span style={styles.specialistName}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      <div style={styles.specialistBar}>
                        <div style={{ ...styles.specialistFill, width: `${(count / filteredConsultations.length) * 100}%` }} />
                      </div>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.section}>
                <h3>Recent Consultations</h3>
                <div style={styles.recentList}>
                  {filteredConsultations.slice(-5).reverse().map(consult => (
                    <div key={consult.id} style={styles.recentItem}>
                      <div>
                        <div style={styles.recentTitle}>{consult.specialistType}</div>
                        <div style={styles.recentDate}>{consult.date.toLocaleDateString()}</div>
                      </div>
                      <div style={styles.recentStats}>
                        <span>{consult.duration} min</span>
                        {consult.rating && <span>⭐ {consult.rating}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'insights' && (
            <div style={styles.insightsContainer}>
              <div style={styles.insightCard}>
                <Award size={24} color="#f59e0b" />
                <h3>Health Score</h3>
                <div style={styles.healthScore}>
                  {Math.round((averages.water / 8 * 25) + (averages.steps / 10000 * 25) + (parseFloat(averages.sleep as string) / 8 * 25) + (parseFloat(averages.mood as string) / 5 * 25))}
                </div>
                <p>out of 100</p>
              </div>

              <div style={styles.insightCard}>
                <Target size={24} color="#3b82f6" />
                <h3>Recommendations</h3>
                <ul style={styles.recommendations}>
                  {averages.water < 8 && <li>💧 Drink more water (target: 8 glasses/day)</li>}
                  {averages.steps < 10000 && <li>👣 Increase daily steps (target: 10,000 steps)</li>}
                  {parseFloat(averages.sleep as string) < 8 && <li>😴 Get more sleep (target: 8 hours)</li>}
                  {avgRating < 4 && <li>⭐ Share feedback to improve AI responses</li>}
                  {averages.water >= 8 && averages.steps >= 10000 && parseFloat(averages.sleep as string) >= 8 && 
                    <li>🎉 Great job! You're meeting all your health goals!</li>}
                </ul>
              </div>

              <div style={styles.insightCard}>
                <Brain size={24} color="#10b981" />
                <h3>AI Health Tips</h3>
                <ul style={styles.tipsList}>
                  <li>Consistency is key for health improvement</li>
                  <li>Small daily habits lead to big changes</li>
                  <li>Track your progress to stay motivated</li>
                  <li>Regular consultations help monitor health</li>
                </ul>
              </div>
            </div>
          )}
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
    maxWidth: '700px',
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
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    padding: '0 24px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
  timeRangeSelector: {
    display: 'flex',
    gap: '8px',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-color)',
  },
  rangeButton: {
    padding: '6px 16px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  rangeActive: {
    background: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  },
  content: {
    padding: '24px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'var(--badge-bg)',
    borderRadius: '12px',
    position: 'relative' as const,
  },
  summaryValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  summaryLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  trend: {
    position: 'absolute' as const,
    right: '12px',
    top: '12px',
    fontSize: '14px',
  },
  section: {
    marginBottom: '24px',
  },
  moodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginTop: '12px',
  },
  moodDay: {
    textAlign: 'center' as const,
    padding: '8px',
    background: 'var(--badge-bg)',
    borderRadius: '8px',
  },
  moodEmoji: {
    fontSize: '24px',
    marginBottom: '4px',
  },
  moodDate: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  progressItem: {
    marginBottom: '16px',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '6px',
  },
  progressBar: {
    height: '8px',
    background: 'var(--border-color)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
    borderRadius: '4px',
  },
  specialistList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  specialistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  specialistName: {
    width: '100px',
    fontSize: '13px',
    textTransform: 'capitalize' as const,
  },
  specialistBar: {
    flex: 1,
    height: '8px',
    background: 'var(--border-color)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  specialistFill: {
    height: '100%',
    background: '#3b82f6',
    borderRadius: '4px',
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  recentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'var(--badge-bg)',
    borderRadius: '10px',
  },
  recentTitle: {
    fontWeight: 500,
    textTransform: 'capitalize' as const,
  },
  recentDate: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  recentStats: {
    display: 'flex',
    gap: '12px',
    fontSize: '13px',
  },
  insightsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  insightCard: {
    padding: '20px',
    background: 'var(--badge-bg)',
    borderRadius: '16px',
    textAlign: 'center' as const,
  },
  healthScore: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#3b82f6',
    margin: '10px 0',
  },
  recommendations: {
    textAlign: 'left' as const,
    marginTop: '12px',
    paddingLeft: '20px',
    color: 'var(--text-secondary)',
  },
  tipsList: {
    textAlign: 'left' as const,
    marginTop: '12px',
    paddingLeft: '20px',
    color: 'var(--text-secondary)',
  },
};