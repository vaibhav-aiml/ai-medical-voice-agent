import { useState, useEffect } from 'react';
import { X, Heart, Brain, Activity, Moon, Droplet, Apple, Wind, TrendingUp, BookOpen, Clock, ChevronRight } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  readTime: number;
  image: string;
  date: string;
  tips: string[];
}

interface Tip {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  category: string;
}

const healthTips: Tip[] = [
  {
    id: '1',
    title: 'Stay Hydrated',
    description: 'Drink 8-10 glasses of water daily for optimal health and energy levels.',
    icon: <Droplet size={24} />,
    category: 'Wellness',
  },
  {
    id: '2',
    title: 'Quality Sleep',
    description: 'Adults need 7-9 hours of quality sleep for proper brain function and immune health.',
    icon: <Moon size={24} />,
    category: 'Sleep',
  },
  {
    id: '3',
    title: 'Regular Exercise',
    description: '150 minutes of moderate exercise weekly reduces risk of chronic diseases.',
    icon: <Activity size={24} />,
    category: 'Fitness',
  },
  {
    id: '4',
    title: 'Balanced Diet',
    description: 'Include fruits, vegetables, whole grains, and lean proteins in your daily meals.',
    icon: <Apple size={24} />,
    category: 'Nutrition',
  },
  {
    id: '5',
    title: 'Stress Management',
    description: 'Practice deep breathing or meditation for 10 minutes daily to reduce stress.',
    icon: <Brain size={24} />,
    category: 'Mental Health',
  },
  {
    id: '6',
    title: 'Heart Health',
    description: 'Monitor blood pressure regularly and maintain a heart-healthy lifestyle.',
    icon: <Heart size={24} />,
    category: 'Cardiovascular',
  },
  {
    id: '7',
    title: 'Deep Breathing',
    description: 'Deep breathing exercises can lower blood pressure and reduce anxiety.',
    icon: <Wind size={24} />,
    category: 'Mental Health',
  },
  {
    id: '8',
    title: 'Track Your Health',
    description: 'Keep a health journal to track symptoms, medications, and lifestyle changes.',
    icon: <TrendingUp size={24} />,
    category: 'Wellness',
  },
];

const articles: Article[] = [
  {
    id: '1',
    title: 'Understanding Headaches: Types and Triggers',
    category: 'Neurology',
    content: 'Headaches are one of the most common medical complaints. Learn about different types of headaches including tension headaches, migraines, and cluster headaches. Understanding your triggers can help prevent future episodes.',
    readTime: 5,
    image: '🧠',
    date: '2024-03-15',
    tips: [
      'Keep a headache diary to track triggers',
      'Stay hydrated throughout the day',
      'Maintain regular sleep schedule',
      'Practice stress reduction techniques',
    ],
  },
  {
    id: '2',
    title: 'Boosting Your Immune System Naturally',
    category: 'Immunity',
    content: 'A strong immune system is your best defense against illness. Discover natural ways to boost your immunity through diet, exercise, sleep, and stress management.',
    readTime: 4,
    image: '🛡️',
    date: '2024-03-10',
    tips: [
      'Eat a variety of colorful fruits and vegetables',
      'Get adequate sleep (7-8 hours)',
      'Exercise regularly',
      'Reduce stress through meditation',
    ],
  },
  {
    id: '3',
    title: 'Heart-Healthy Lifestyle Guide',
    category: 'Cardiology',
    content: 'Heart disease remains a leading cause of death worldwide. Learn about lifestyle changes that can significantly reduce your risk of heart disease and improve cardiovascular health.',
    readTime: 6,
    image: '❤️',
    date: '2024-03-05',
    tips: [
      'Limit sodium intake to <2300mg daily',
      'Exercise 30 minutes daily',
      'Quit smoking',
      'Manage stress levels',
    ],
  },
  {
    id: '4',
    title: 'Mental Health Awareness',
    category: 'Mental Health',
    content: 'Mental health is just as important as physical health. Learn to recognize signs of anxiety, depression, and burnout, and discover coping strategies.',
    readTime: 5,
    image: '🧘',
    date: '2024-02-28',
    tips: [
      'Practice self-care daily',
      'Stay connected with loved ones',
      'Seek professional help when needed',
      'Limit social media exposure',
    ],
  },
  {
    id: '5',
    title: 'Sleep Hygiene: Better Rest Guide',
    category: 'Sleep',
    content: 'Quality sleep is essential for physical and mental health. Learn proven strategies to improve your sleep hygiene and wake up feeling refreshed.',
    readTime: 4,
    image: '😴',
    date: '2024-02-20',
    tips: [
      'Maintain consistent sleep schedule',
      'Avoid screens 1 hour before bed',
      'Create a relaxing bedtime routine',
      'Keep bedroom cool and dark',
    ],
  },
  {
    id: '6',
    title: 'Managing Back Pain',
    category: 'Orthopedic',
    content: 'Back pain affects millions worldwide. Discover effective strategies for preventing and managing back pain through proper posture, exercise, and ergonomics.',
    readTime: 5,
    image: '🦴',
    date: '2024-02-15',
    tips: [
      'Maintain good posture',
      'Use proper lifting techniques',
      'Stay active with low-impact exercises',
      'Use ergonomic furniture',
    ],
  },
];

const categories = ['All', 'Wellness', 'Sleep', 'Fitness', 'Nutrition', 'Mental Health', 'Cardiovascular', 'Neurology', 'Immunity', 'Orthopedic'];

interface Props {
  onClose: () => void;
}

export default function HealthTips({ onClose }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const filteredTips = healthTips.filter(tip => 
    (selectedCategory === 'All' || tip.category === selectedCategory) &&
    (tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tip.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredArticles = articles.filter(article =>
    (selectedCategory === 'All' || article.category === selectedCategory) &&
    (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     article.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const saveTip = (tipTitle: string) => {
    const savedTips = localStorage.getItem('savedHealthTips') || '[]';
    const saved = JSON.parse(savedTips);
    if (!saved.includes(tipTitle)) {
      saved.push(tipTitle);
      localStorage.setItem('savedHealthTips', JSON.stringify(saved));
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 2000);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <BookOpen size={24} />
          </div>
          <h2 style={styles.title}>Health Tips & Articles</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.searchSection}>
          <input
            type="text"
            placeholder="Search health tips or articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.categoriesSection}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...styles.categoryChip,
                ...(selectedCategory === cat ? styles.categoryChipActive : {}),
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {!selectedArticle ? (
          <div style={styles.content}>
            <div style={styles.tipsSection}>
              <h3 style={styles.sectionTitle}>💡 Quick Health Tips</h3>
              <div style={styles.tipsGrid}>
                {filteredTips.map((tip) => (
                  <div key={tip.id} style={styles.tipCard}>
                    <div style={styles.tipIcon}>{tip.icon}</div>
                    <div style={styles.tipContent}>
                      <h4>{tip.title}</h4>
                      <p>{tip.description}</p>
                      <button onClick={() => saveTip(tip.title)} style={styles.saveButton}>
                        Save Tip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.articlesSection}>
              <h3 style={styles.sectionTitle}>📖 Featured Articles</h3>
              <div style={styles.articlesGrid}>
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    style={styles.articleCard}
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div style={styles.articleImage}>{article.image}</div>
                    <div style={styles.articleContent}>
                      <span style={styles.articleCategory}>{article.category}</span>
                      <h4>{article.title}</h4>
                      <p>{article.content.substring(0, 80)}...</p>
                      <div style={styles.articleMeta}>
                        <span style={styles.readTime}>
                          <Clock size={14} /> {article.readTime} min read
                        </span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.articleDetail}>
            <button onClick={() => setSelectedArticle(null)} style={styles.backButton}>
              ← Back to all articles
            </button>
            <div style={styles.articleDetailContent}>
              <div style={styles.articleDetailImage}>{selectedArticle.image}</div>
              <span style={styles.articleDetailCategory}>{selectedArticle.category}</span>
              <h2>{selectedArticle.title}</h2>
              <div style={styles.articleDetailMeta}>
                <span><Clock size={16} /> {selectedArticle.readTime} min read</span>
                <span>📅 {new Date(selectedArticle.date).toLocaleDateString()}</span>
              </div>
              <p style={styles.articleDetailText}>{selectedArticle.content}</p>
              <div style={styles.keyTips}>
                <h3>✨ Key Takeaways</h3>
                <ul>
                  {selectedArticle.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {showSavedMessage && (
          <div style={styles.savedToast}>
            ✅ Tip saved to your profile!
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
    maxWidth: '900px',
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
  searchSection: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-color)',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '12px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  categoriesSection: {
    display: 'flex',
    gap: '8px',
    padding: '16px 24px',
    overflowX: 'auto' as const,
    borderBottom: '1px solid var(--border-color)',
  },
  categoryChip: {
    padding: '6px 14px',
    background: 'var(--badge-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap' as const,
  },
  categoryChipActive: {
    background: '#10b981',
    color: 'white',
    borderColor: '#10b981',
  },
  content: {
    padding: '24px',
  },
  tipsSection: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  tipCard: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    background: 'var(--badge-bg)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  tipIcon: {
    width: '48px',
    height: '48px',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#10b981',
  },
  tipContent: {
    flex: 1,
  },
  saveButton: {
    marginTop: '8px',
    padding: '4px 12px',
    background: 'transparent',
    border: '1px solid var(--button-primary)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'var(--button-primary)',
  },
  articlesSection: {
    marginBottom: '16px',
  },
  articlesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  articleCard: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  articleImage: {
    height: '120px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
  },
  articleContent: {
    padding: '16px',
  },
  articleCategory: {
    fontSize: '11px',
    color: '#10b981',
    textTransform: 'uppercase' as const,
    fontWeight: 600,
  },
  readTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  articleMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
  },
  articleDetail: {
    padding: '24px',
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--button-primary)',
    fontSize: '14px',
    marginBottom: '20px',
  },
  articleDetailContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  articleDetailImage: {
    fontSize: '80px',
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  articleDetailCategory: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    borderRadius: '20px',
    fontSize: '12px',
    marginBottom: '16px',
  },
  articleDetailMeta: {
    display: 'flex',
    gap: '16px',
    margin: '16px 0',
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  articleDetailText: {
    lineHeight: 1.6,
    color: 'var(--text-primary)',
    marginBottom: '24px',
  },
  keyTips: {
    background: 'var(--badge-bg)',
    padding: '20px',
    borderRadius: '16px',
    marginTop: '20px',
  },
  savedToast: {
    position: 'fixed' as const,
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#10b981',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    zIndex: 100,
  },
};