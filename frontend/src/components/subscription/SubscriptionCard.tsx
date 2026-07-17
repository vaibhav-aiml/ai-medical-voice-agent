import { useSubscription } from '../../context/SubscriptionContext';

export default function SubscriptionCard({ onUpgrade }: { onUpgrade: () => void }) {
  const { subscription, getRemainingConsultations, getTierBenefits } = useSubscription();
  const remaining = getRemainingConsultations();
  const benefits = getTierBenefits();

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Current Plan</h3>
          <div style={styles.tierBadge}>
            {subscription.tier.toUpperCase()} PLAN
          </div>
        </div>
        {subscription.tier !== 'family' && (
          <button onClick={onUpgrade} style={styles.upgradeButton}>
            Upgrade
          </button>
        )}
      </div>
      
      <div style={styles.statsGrid}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{remaining}</div>
          <div style={styles.statLabel}>Consultations Left</div>
          <div style={styles.statProgress}>
            <div style={{...styles.progressBar, width: `${(subscription.consultationsUsed / subscription.consultationLimit) * 100}%` }} />
          </div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{benefits.features.length}</div>
          <div style={styles.statLabel}>Features Included</div>
        </div>
        {subscription.expiresAt && (
          <div style={styles.statItem}>
            <div style={styles.statValue}>
              {new Date(subscription.expiresAt).toLocaleDateString()}
            </div>
            <div style={styles.statLabel}>Renewal Date</div>
          </div>
        )}
      </div>
      
      <div style={styles.features}>
        <strong>✓ Included Features:</strong>
        <ul>
          {benefits.features.map((feature, i) => (
            <li key={i}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid var(--border-color)',
    marginBottom: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  tierBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: 'white',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
  },
  upgradeButton: {
    padding: '8px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  statItem: {
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  statProgress: {
    marginTop: '8px',
    height: '4px',
    background: 'var(--border-color)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: '#3b82f6',
    borderRadius: '2px',
  },
  features: {
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
};