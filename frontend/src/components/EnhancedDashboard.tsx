import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Calendar, TrendingUp, Activity, Clock, Award, Brain, Heart, Star, Users } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

interface ConsultationData {
  id: string;
  date: Date;
  specialistType: string;
  duration: number;
  rating?: number;
  symptoms: string;
}

interface Props {
  consultations: any[];
  stats: any;
}

export default function EnhancedDashboard({ consultations, stats }: Props) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartData, setChartData] = useState<any>(null);
  const [specialistChart, setSpecialistChart] = useState<any>(null);
  const [ratingChart, setRatingChart] = useState<any>(null);

  useEffect(() => {
    prepareChartData();
    prepareSpecialistChart();
    prepareRatingChart();
  }, [consultations, timeRange]);

  const getFilteredData = () => {
    const now = new Date();
    const filterDays = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const cutoff = new Date(now.setDate(now.getDate() - filterDays));
    return consultations.filter(c => new Date(c.startedAt) >= cutoff);
  };

  const prepareChartData = () => {
    const filtered = getFilteredData();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const consultationsByDay = last7Days.map(day => {
      const dayIndex = last7Days.indexOf(day);
      const date = new Date();
      date.setDate(date.getDate() - (6 - dayIndex));
      return filtered.filter(c => new Date(c.startedAt).toDateString() === date.toDateString()).length;
    });

    const durationsByDay = last7Days.map(day => {
      const dayIndex = last7Days.indexOf(day);
      const date = new Date();
      date.setDate(date.getDate() - (6 - dayIndex));
      const dayConsultations = filtered.filter(c => new Date(c.startedAt).toDateString() === date.toDateString());
      const totalDuration = dayConsultations.reduce((sum, c) => sum + c.duration, 0);
      return dayConsultations.length > 0 ? Math.round(totalDuration / dayConsultations.length) : 0;
    });

    setChartData({
      consultations: {
        labels: last7Days,
        datasets: [
          {
            label: 'Consultations',
            data: consultationsByDay,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      durations: {
        labels: last7Days,
        datasets: [
          {
            label: 'Average Duration (minutes)',
            data: durationsByDay,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
    });
  };

  const prepareSpecialistChart = () => {
    const filtered = getFilteredData();
    const specialistCounts: Record<string, number> = {};
    filtered.forEach(c => {
      specialistCounts[c.specialistType] = (specialistCounts[c.specialistType] || 0) + 1;
    });

    setSpecialistChart({
      labels: Object.keys(specialistCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [
        {
          data: Object.values(specialistCounts),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
          borderWidth: 0,
        },
      ],
    });
  };

  const prepareRatingChart = () => {
    const filtered = getFilteredData().filter(c => c.rating);
    const ratings = [1, 2, 3, 4, 5].map(r => filtered.filter(c => c.rating === r).length);
    
    setRatingChart({
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      datasets: [
        {
          data: ratings,
          backgroundColor: ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#3b82f6'],
          borderWidth: 0,
        },
      ],
    });
  };

  const getTrend = () => {
    const filtered = getFilteredData();
    const lastWeek = filtered.filter(c => new Date(c.startedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const previousWeek = filtered.filter(c => {
      const date = new Date(c.startedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return date >= twoWeeksAgo && date < weekAgo;
    });
    
    const trend = lastWeek.length - previousWeek.length;
    return {
      percentage: previousWeek.length > 0 ? Math.round((trend / previousWeek.length) * 100) : 0,
      direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'same',
    };
  };

  const trend = getTrend();
  const filteredConsultations = getFilteredData();
  const avgRating = filteredConsultations.filter(c => c.rating).reduce((acc, c) => acc + (c.rating || 0), 0) / (filteredConsultations.filter(c => c.rating).length || 1);
  const totalMinutes = filteredConsultations.reduce((acc, c) => acc + c.duration, 0);
  const avgDuration = filteredConsultations.length > 0 ? Math.round(totalMinutes / filteredConsultations.length) : 0;

  return (
    <div style={styles.container}>
      {/* Time Range Selector */}
      <div style={styles.timeRangeSelector}>
        <button onClick={() => setTimeRange('week')} style={{ ...styles.rangeButton, ...(timeRange === 'week' ? styles.rangeActive : {}) }}>Last 7 Days</button>
        <button onClick={() => setTimeRange('month')} style={{ ...styles.rangeButton, ...(timeRange === 'month' ? styles.rangeActive : {}) }}>Last 30 Days</button>
        <button onClick={() => setTimeRange('year')} style={{ ...styles.rangeButton, ...(timeRange === 'year' ? styles.rangeActive : {}) }}>Last Year</button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><Calendar size={24} color="#3b82f6" /></div>
          <div>
            <div style={styles.statValue}>{filteredConsultations.length}</div>
            <div style={styles.statLabel}>Consultations</div>
          </div>
          <div style={{ ...styles.trendBadge, ...(trend.direction === 'up' ? styles.trendUp : styles.trendDown) }}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {Math.abs(trend.percentage)}%
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><Star size={24} color="#f59e0b" /></div>
          <div>
            <div style={styles.statValue}>{avgRating.toFixed(1)}</div>
            <div style={styles.statLabel}>Avg Rating</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><Clock size={24} color="#10b981" /></div>
          <div>
            <div style={styles.statValue}>{avgDuration}</div>
            <div style={styles.statLabel}>Avg Duration (min)</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><Activity size={24} color="#8b5cf6" /></div>
          <div>
            <div style={styles.statValue}>{totalMinutes}</div>
            <div style={styles.statLabel}>Total Minutes</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3>Consultations Trend</h3>
          {chartData && <Line data={chartData.consultations} options={chartOptions} />}
        </div>
        <div style={styles.chartCard}>
          <h3>Average Duration Trend</h3>
          {chartData && <Line data={chartData.durations} options={chartOptions} />}
        </div>
        <div style={styles.chartCard}>
          <h3>Specialist Distribution</h3>
          {specialistChart && <Doughnut data={specialistChart} options={doughnutOptions} />}
        </div>
        <div style={styles.chartCard}>
          <h3>Rating Distribution</h3>
          {ratingChart && <Bar data={ratingChart} options={barOptions} />}
        </div>
      </div>

      {/* Insights */}
      <div style={styles.insightsCard}>
        <h3>📈 Health Insights</h3>
        <div style={styles.insightsGrid}>
          <div style={styles.insightItem}>
            <TrendingUp size={20} color="#10b981" />
            <div>
              <div style={styles.insightTitle}>Most Active Day</div>
              <div style={styles.insightValue}>
                {chartData?.consultations.labels[
                  chartData?.consultations.datasets[0].data.indexOf(
                    Math.max(...(chartData?.consultations.datasets[0].data || [0]))
                  )
                ] || 'N/A'}
              </div>
            </div>
          </div>
          <div style={styles.insightItem}>
            <Brain size={20} color="#8b5cf6" />
            <div>
              <div style={styles.insightTitle}>Most Used Specialist</div>
              <div style={styles.insightValue}>
                {specialistChart?.labels[
                  specialistChart?.datasets[0].data.indexOf(
                    Math.max(...(specialistChart?.datasets[0].data || [0]))
                  )
                ] || 'N/A'}
              </div>
            </div>
          </div>
          <div style={styles.insightItem}>
            <Heart size={20} color="#ef4444" />
            <div>
              <div style={styles.insightTitle}>Best Rated Specialist</div>
              <div style={styles.insightValue}>
                {(() => {
                  const ratingsBySpecialist: Record<string, number[]> = {};
                  filteredConsultations.forEach(c => {
                    if (c.rating) {
                      if (!ratingsBySpecialist[c.specialistType]) ratingsBySpecialist[c.specialistType] = [];
                      ratingsBySpecialist[c.specialistType].push(c.rating);
                    }
                  });
                  let bestSpecialist = 'N/A';
                  let bestAvg = 0;
                  Object.entries(ratingsBySpecialist).forEach(([type, ratings]) => {
                    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                    if (avg > bestAvg) {
                      bestAvg = avg;
                      bestSpecialist = type;
                    }
                  });
                  return bestSpecialist.charAt(0).toUpperCase() + bestSpecialist.slice(1);
                })()}
              </div>
            </div>
          </div>
          <div style={styles.insightItem}>
            <Award size={20} color="#f59e0b" />
            <div>
              <div style={styles.insightTitle}>Total Consultations</div>
              <div style={styles.insightValue}>{stats.totalConsultations}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

const styles = {
  container: {
    padding: '24px',
  },
  timeRangeSelector: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    justifyContent: 'flex-end',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    position: 'relative' as const,
  },
  statIcon: {
    width: '48px',
    height: '48px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  trendBadge: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 500,
  },
  trendUp: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
  },
  trendDown: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    marginBottom: '24px',
  },
  chartCard: {
    padding: '20px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
  },
  insightsCard: {
    padding: '20px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
  },
  insightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  },
  insightItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'var(--badge-bg)',
    borderRadius: '12px',
  },
  insightTitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  insightValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
};