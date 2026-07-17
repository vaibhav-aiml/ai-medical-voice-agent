import { useState, useEffect } from 'react';
import { X, Target, TrendingUp, Droplet, Moon, Activity, Apple, Brain, Heart, Award, Flame, Calendar, CheckCircle, Circle, Edit2, Trash2, Plus, BarChart3 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  category: string;
  deadline: Date;
  createdAt: Date;
  completed: boolean;
  icon: string;
}

interface DailyLog {
  id: string;
  date: string;
  water: number;
  steps: number;
  sleep: number;
  calories: number;
  mood: number;
  notes: string;
}

const goalCategories = [
  { id: 'water', name: 'Hydration', icon: '💧', unit: 'glasses', defaultTarget: 8, color: '#3b82f6' },
  { id: 'steps', name: 'Steps', icon: '👣', unit: 'steps', defaultTarget: 10000, color: '#10b981' },
  { id: 'sleep', name: 'Sleep', icon: '😴', unit: 'hours', defaultTarget: 8, color: '#8b5cf6' },
  { id: 'calories', name: 'Calories', icon: '🔥', unit: 'calories', defaultTarget: 2000, color: '#f59e0b' },
  { id: 'exercise', name: 'Exercise', icon: '💪', unit: 'minutes', defaultTarget: 30, color: '#ef4444' },
  { id: 'meditation', name: 'Meditation', icon: '🧘', unit: 'minutes', defaultTarget: 10, color: '#06b6d4' },
];

const moodOptions = [
  { value: 5, label: 'Excellent', emoji: '😁', color: '#10b981' },
  { value: 4, label: 'Good', emoji: '🙂', color: '#3b82f6' },
  { value: 3, label: 'Neutral', emoji: '😐', color: '#f59e0b' },
  { value: 2, label: 'Low', emoji: '😔', color: '#ef4444' },
  { value: 1, label: 'Poor', emoji: '😫', color: '#dc2626' },
];

interface Props {
  onClose: () => void;
}

export default function HealthGoals({ onClose }: Props) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    water: 0,
    steps: 0,
    sleep: 0,
    calories: 0,
    mood: 3,
    notes: '',
  });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showLogEntry, setShowLogEntry] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newGoal, setNewGoal] = useState({
    title: '',
    target: 0,
    category: '',
    deadline: '',
  });
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [history, setHistory] = useState<DailyLog[]>([]);

  useEffect(() => {
    loadGoals();
    loadHistory();
    loadTodayLog();
  }, []);

  const loadGoals = () => {
    const saved = localStorage.getItem('healthGoals');
    if (saved) {
      const parsed = JSON.parse(saved);
      setGoals(parsed.map((g: any) => ({ ...g, deadline: new Date(g.deadline), createdAt: new Date(g.createdAt) })));
    } else {
      // Default goals
      const defaultGoals: Goal[] = [
        {
          id: '1',
          title: 'Daily Water Intake',
          target: 8,
          current: 0,
          unit: 'glasses',
          category: 'Hydration',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          completed: false,
          icon: '💧',
        },
        {
          id: '2',
          title: 'Daily Steps',
          target: 10000,
          current: 0,
          unit: 'steps',
          category: 'Fitness',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          completed: false,
          icon: '👣',
        },
        {
          id: '3',
          title: 'Sleep Hours',
          target: 8,
          current: 0,
          unit: 'hours',
          category: 'Sleep',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          completed: false,
          icon: '😴',
        },
      ];
      setGoals(defaultGoals);
      localStorage.setItem('healthGoals', JSON.stringify(defaultGoals));
    }
  };

  const loadHistory = () => {
    const saved = localStorage.getItem('dailyHealthLogs');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  };

  const loadTodayLog = () => {
    const saved = localStorage.getItem('dailyHealthLog');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === new Date().toISOString().split('T')[0]) {
        setDailyLog(parsed);
      }
    }
  };

  const saveGoals = (newGoals: Goal[]) => {
    localStorage.setItem('healthGoals', JSON.stringify(newGoals));
    setGoals(newGoals);
  };

  const saveDailyLog = (log: DailyLog) => {
    localStorage.setItem('dailyHealthLog', JSON.stringify(log));
    
    // Add to history
    const existingHistory = JSON.parse(localStorage.getItem('dailyHealthLogs') || '[]');
    const existingIndex = existingHistory.findIndex((h: DailyLog) => h.date === log.date);
    if (existingIndex >= 0) {
      existingHistory[existingIndex] = log;
    } else {
      existingHistory.push(log);
    }
    localStorage.setItem('dailyHealthLogs', JSON.stringify(existingHistory));
    setHistory(existingHistory);
    setDailyLog(log);
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.target || !newGoal.category) {
      alert('Please fill all fields');
      return;
    }

    const category = goalCategories.find(c => c.name === newGoal.category);
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      target: newGoal.target,
      current: 0,
      unit: category?.unit || 'units',
      category: newGoal.category,
      deadline: new Date(newGoal.deadline),
      createdAt: new Date(),
      completed: false,
      icon: category?.icon || '🎯',
    };
    
    const newGoals = [...goals, goal];
    saveGoals(newGoals);
    setShowAddGoal(false);
    setNewGoal({ title: '', target: 0, category: '', deadline: '' });
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    const updated = goals.map(goal => {
      if (goal.id === goalId) {
        const newCurrent = Math.min(goal.target, goal.current + progress);
        const completed = newCurrent >= goal.target;
        return { ...goal, current: newCurrent, completed };
      }
      return goal;
    });
    saveGoals(updated);
  };

  const deleteGoal = (goalId: string) => {
    const filtered = goals.filter(g => g.id !== goalId);
    saveGoals(filtered);
  };

  const updateDailyLog = (field: keyof DailyLog, value: number | string) => {
    const updated = { ...dailyLog, [field]: value };
    saveDailyLog(updated);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  const getWeeklyProgress = () => {
    const last7Days = history.slice(-7);
    const avgWater = Math.round(last7Days.reduce((acc, d) => acc + d.water, 0) / (last7Days.length || 1));
    const avgSteps = Math.round(last7Days.reduce((acc, d) => acc + d.steps, 0) / (last7Days.length || 1));
    const avgSleep = (last7Days.reduce((acc, d) => acc + d.sleep, 0) / (last7Days.length || 1)).toFixed(1);
    return { avgWater, avgSteps, avgSleep };
  };

  const weeklyProgress = getWeeklyProgress();

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <Target size={24} />
          </div>
          <h2 style={styles.title}>Health Goals & Tracking</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {/* Daily Log Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3>📝 Today's Log - {new Date().toLocaleDateString()}</h3>
            </div>
            <div style={styles.dailyLogGrid}>
              <div style={styles.logCard}>
                <Droplet size={20} color="#3b82f6" />
                <span>Water</span>
                <input
                  type="number"
                  value={dailyLog.water}
                  onChange={(e) => updateDailyLog('water', parseInt(e.target.value) || 0)}
                  style={styles.logInput}
                />
                <span>glasses</span>
              </div>
              <div style={styles.logCard}>
                <Activity size={20} color="#10b981" />
                <span>Steps</span>
                <input
                  type="number"
                  value={dailyLog.steps}
                  onChange={(e) => updateDailyLog('steps', parseInt(e.target.value) || 0)}
                  style={styles.logInput}
                />
                <span>steps</span>
              </div>
              <div style={styles.logCard}>
                <Moon size={20} color="#8b5cf6" />
                <span>Sleep</span>
                <input
                  type="number"
                  step="0.5"
                  value={dailyLog.sleep}
                  onChange={(e) => updateDailyLog('sleep', parseFloat(e.target.value) || 0)}
                  style={styles.logInput}
                />
                <span>hours</span>
              </div>
              <div style={styles.logCard}>
                <Flame size={20} color="#f59e0b" />
                <span>Calories</span>
                <input
                  type="number"
                  value={dailyLog.calories}
                  onChange={(e) => updateDailyLog('calories', parseInt(e.target.value) || 0)}
                  style={styles.logInput}
                />
                <span>kcal</span>
              </div>
              <div style={styles.logCard}>
                <Brain size={20} color="#06b6d4" />
                <span>Mood</span>
                <select
                  value={dailyLog.mood}
                  onChange={(e) => updateDailyLog('mood', parseInt(e.target.value))}
                  style={styles.logSelect}
                >
                  {moodOptions.map(m => (
                    <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              placeholder="Add notes about your day..."
              value={dailyLog.notes}
              onChange={(e) => updateDailyLog('notes', e.target.value)}
              style={styles.notesInput}
              rows={2}
            />
          </div>

          {/* Weekly Progress */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3>📊 Weekly Average</h3>
              <BarChart3 size={18} color="#64748b" />
            </div>
            <div style={styles.weeklyStats}>
              <div style={styles.statCard}>
                <Droplet size={18} />
                <span>{weeklyProgress.avgWater} glasses</span>
                <small>Water</small>
              </div>
              <div style={styles.statCard}>
                <Activity size={18} />
                <span>{weeklyProgress.avgSteps.toLocaleString()} steps</span>
                <small>Steps</small>
              </div>
              <div style={styles.statCard}>
                <Moon size={18} />
                <span>{weeklyProgress.avgSleep} hours</span>
                <small>Sleep</small>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3>🎯 Your Health Goals</h3>
              <button onClick={() => setShowAddGoal(true)} style={styles.addButton}>
                <Plus size={18} /> Add Goal
              </button>
            </div>
            <div style={styles.goalsList}>
              {goals.map((goal) => (
                <div key={goal.id} style={styles.goalCard}>
                  <div style={styles.goalHeader}>
                    <div style={styles.goalIcon}>{goal.icon}</div>
                    <div style={styles.goalInfo}>
                      <h4>{goal.title}</h4>
                      <span style={styles.goalTarget}>{goal.target} {goal.unit} by {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                    <div style={styles.goalActions}>
                      <button onClick={() => updateGoalProgress(goal.id, 1)} style={styles.progressButton}>+1</button>
                      <button onClick={() => deleteGoal(goal.id)} style={styles.deleteGoalButton}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${getProgressPercentage(goal.current, goal.target)}%` }} />
                    </div>
                    <div style={styles.progressStats}>
                      <span>{goal.current} / {goal.target} {goal.unit}</span>
                      <span style={styles.progressPercent}>{getProgressPercentage(goal.current, goal.target)}%</span>
                    </div>
                  </div>
                  {goal.completed && (
                    <div style={styles.completedBadge}>
                      <CheckCircle size={14} /> Completed!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div style={styles.formOverlay}>
            <div style={styles.formModal}>
              <h3>Set New Health Goal</h3>
              <input
                type="text"
                placeholder="Goal Title (e.g., Drink more water)"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                style={styles.formInput}
              />
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                style={styles.formSelect}
              >
                <option value="">Select Category</option>
                {goalCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Target Value"
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                style={styles.formInput}
              />
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                style={styles.formInput}
              />
              <div style={styles.formButtons}>
                <button onClick={() => setShowAddGoal(false)} style={styles.cancelButton}>Cancel</button>
                <button onClick={addGoal} style={styles.saveButton}>Create Goal</button>
              </div>
            </div>
          </div>
        )}
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
    maxWidth: '800px',
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
    background: 'linear-gradient(135deg, #10b981, #059669)',
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
    marginBottom: '32px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  dailyLogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '12px',
  },
  logCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    background: 'var(--badge-bg)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
  },
  logInput: {
    width: '70px',
    padding: '6px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '6px',
    textAlign: 'center' as const,
  },
  logSelect: {
    flex: 1,
    padding: '6px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '6px',
  },
  notesInput: {
    width: '100%',
    padding: '10px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '10px',
    resize: 'vertical' as const,
    marginTop: '8px',
  },
  weeklyStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  statCard: {
    textAlign: 'center' as const,
    padding: '12px',
    background: 'var(--badge-bg)',
    borderRadius: '10px',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  goalsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  goalCard: {
    padding: '16px',
    background: 'var(--badge-bg)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  goalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  goalIcon: {
    fontSize: '28px',
  },
  goalInfo: {
    flex: 1,
  },
  goalTarget: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  goalActions: {
    display: 'flex',
    gap: '8px',
  },
  progressButton: {
    padding: '4px 10px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteGoalButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#ef4444',
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: '8px',
    background: 'var(--border-color)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981, #059669)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressStats: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  progressPercent: {
    fontWeight: 600,
    color: '#10b981',
  },
  completedBadge: {
    marginTop: '8px',
    padding: '4px 8px',
    background: '#10b981',
    color: 'white',
    borderRadius: '6px',
    fontSize: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
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
    maxWidth: '400px',
  },
  formInput: {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
  },
  formSelect: {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
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
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};