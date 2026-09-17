import { useState } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Check, Crown, Users, Sparkles, X } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';

export default function PricingPlans({ onClose }: { onClose: () => void }) {
  const { isMobile, isTablet } = useBreakpoint();
  const { setSubscriptionTier, subscription } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      tier: 'free' as const,
      price: { monthly: 0, yearly: 0 },
      icon: <Sparkles size={22} />,
      features: [
        '5 Consultations per month',
        'Basic Medical Reports',
        'Email Support',
        'Standard Response Time',
        'Basic Analytics',
      ],
      notIncluded: [
        'Unlimited Consultations',
        'Detailed Reports',
        'Priority Support',
        'Family Members',
        'Advanced Analytics',
      ],
    },
    {
      name: 'Pro',
      tier: 'pro' as const,
      price: { monthly: 499, yearly: 4990 },
      icon: <Crown size={22} />,
      popular: true,
      features: [
        'Unlimited Consultations',
        'Detailed Medical Reports',
        'Priority Email Support',
        'Advanced Health Analytics',
        'Voice Customization',
        'Data Export',
      ],
      notIncluded: [
        'Family Members',
      ],
    },
    {
      name: 'Family',
      tier: 'family' as const,
      price: { monthly: 999, yearly: 9990 },
      icon: <Users size={22} />,
      features: [
        '5 Family Members',
        'Unlimited Consultations',
        'Detailed Medical Reports',
        '24/7 Priority Support',
        'Advanced Analytics',
        'Voice Customization',
        'Data Export',
        'Family Dashboard',
      ],
      notIncluded: [],
    },
  ];

  const handleUpgrade = (tier: 'free' | 'pro' | 'family') => {
    if (tier === 'free') {
      setSubscriptionTier('free');
      onClose();
    } else {
      alert(`✨ ${tier.toUpperCase()} Plan Selected!\n\nPrice: ₹${billingCycle === 'monthly' ? plans.find(p => p.tier === tier)?.price.monthly : plans.find(p => p.tier === tier)?.price.yearly}\n\nThis is a demo. In production, payment gateway will be integrated.`);
      setSubscriptionTier(tier);
      onClose();
    }
  };

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="pricing-modal-title">
      <div style={{ ...styles.modal, padding: isMobile ? '24px 16px' : '32px' }}>
        <div style={styles.header}>
          <h2 id="pricing-modal-title" style={styles.title}>Choose Your Plan</h2>
          <button onClick={onClose} style={styles.closeButton} aria-label="Close pricing modal">
            <X size={24} />
          </button>
        </div>

        <div style={styles.billingToggleWrapper}>
          <div style={styles.billingToggle}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{ ...styles.toggleButton, ...(billingCycle === 'monthly' ? styles.toggleActive : {}) }}
              type="button"
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              style={{ ...styles.toggleButton, ...(billingCycle === 'yearly' ? styles.toggleActive : {}) }}
              type="button"
            >
              Yearly <span style={styles.saveBadge}>Save 20%</span>
            </button>
          </div>
        </div>

        <div style={{
          ...styles.plansContainer,
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
        }}>
          {plans.map((plan) => {
            const isCurrent = subscription.tier === plan.tier;
            const isPopular = !!plan.popular;

            return (
              <div
                key={plan.name}
                data-testid={`plan-card-${plan.tier}`}
                style={{
                  ...styles.planCard,
                  ...(isCurrent ? styles.currentPlan : isPopular ? styles.popularPlan : {}),
                }}
              >
                {/* Top-rim badge logic: separates active status from marketing promotion */}
                {isCurrent ? (
                  <div style={styles.activeBadge} data-testid="badge-active">✓ Active Plan</div>
                ) : isPopular ? (
                  <div style={styles.popularBadge} data-testid="badge-popular">★ Most Popular</div>
                ) : null}

                <div>
                  <div style={styles.planIcon}>
                    {plan.icon}
                  </div>

                  {/* Eyebrow sub-badge when active plan is also the popular tier */}
                  {isCurrent && isPopular && (
                    <div style={styles.popularEyebrow} data-testid="eyebrow-popular">
                      ★ Popular Choice
                    </div>
                  )}

                  <h3 style={styles.planName}>{plan.name}</h3>

                  <div style={styles.planPrice}>
                    <span style={styles.priceAmount}>
                      ₹{billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    </span>
                    <span style={styles.pricePeriod}>
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>

                  {plan.price.yearly > 0 && billingCycle === 'yearly' && (
                    <div style={styles.savedAmount}>
                      Save ₹{(plan.price.monthly * 12) - plan.price.yearly} per year
                    </div>
                  )}

                  <div style={styles.featuresList}>
                    <div style={styles.featuresTitle}>What's included:</div>
                    {plan.features.map((feature, i) => (
                      <div key={i} style={styles.featureItem}>
                        <Check size={16} color="var(--accent-clinical)" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, i) => (
                      <div key={i} style={styles.featureItemDisabled}>
                        <X size={16} color="var(--text-muted)" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={isCurrent}
                  data-testid={`action-button-${plan.tier}`}
                  style={{
                    ...styles.upgradeButton,
                    ...(isCurrent
                      ? styles.currentButton
                      : isPopular
                        ? styles.popularActionButton
                        : {}),
                  }}
                >
                  {isCurrent ? 'Active Plan' : plan.tier === 'free' ? 'Downgrade' : 'Upgrade'}
                </button>
              </div>
            );
          })}
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
    background: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: '24px',
    maxWidth: '1140px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--card-shadow-hover)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  },
  billingToggleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  billingToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'var(--bg-primary)',
    padding: '4px',
    borderRadius: '50px',
    border: '1px solid var(--border-color)',
  },
  toggleButton: {
    padding: '8px 20px',
    background: 'transparent',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    transition: 'all 0.2s ease',
  },
  toggleActive: {
    background: 'var(--accent-clinical)',
    color: '#ffffff',
    fontWeight: 600,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
  },
  saveBadge: {
    fontSize: '11px',
    marginLeft: '6px',
    padding: '2px 8px',
    background: 'var(--status-completed-bg)',
    color: 'var(--status-completed-text)',
    borderRadius: '20px',
    fontWeight: 600,
  },
  plansContainer: {
    display: 'grid',
    gap: '24px',
    alignItems: 'stretch',
  },
  planCard: {
    position: 'relative' as const,
    padding: '32px 28px',
    background: 'var(--bg-card)',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    boxShadow: 'var(--card-shadow)',
  },
  popularPlan: {
    border: '1.5px solid var(--accent-clinical)',
    boxShadow: 'var(--card-shadow-hover)',
  },
  currentPlan: {
    border: '2px solid var(--accent-clinical)',
    background: 'var(--accent-clinical-soft)',
    boxShadow: 'var(--card-shadow-hover)',
  },
  activeBadge: {
    position: 'absolute' as const,
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--accent-clinical)',
    color: '#ffffff',
    padding: '4px 14px',
    borderRadius: 'var(--radius-full)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    boxShadow: '0 2px 8px var(--accent-clinical-soft)',
    whiteSpace: 'nowrap' as const,
  },
  popularBadge: {
    position: 'absolute' as const,
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--accent-clinical-soft)',
    border: '1.5px solid var(--accent-clinical)',
    color: 'var(--accent-clinical)',
    padding: '4px 14px',
    borderRadius: 'var(--radius-full)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
  },
  popularEyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--accent-clinical)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
  },
  planIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '1.5px solid var(--accent-clinical-soft)',
    background: 'var(--accent-clinical-soft)',
    color: 'var(--accent-clinical)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    flexShrink: 0,
  },
  planName: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '10px',
    letterSpacing: '-0.01em',
  },
  planPrice: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginBottom: '6px',
  },
  priceAmount: {
    fontSize: '34px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  pricePeriod: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  savedAmount: {
    fontSize: '12px',
    color: 'var(--status-completed-text)',
    fontWeight: 600,
    marginBottom: '18px',
  },
  featuresList: {
    marginTop: '16px',
    marginBottom: '28px',
  },
  featuresTitle: {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: 1.4,
  },
  featureItemDisabled: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
    opacity: 0.65,
  },
  upgradeButton: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '1.5px solid var(--accent-clinical)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--accent-clinical)',
    transition: 'all 0.2s ease',
    marginTop: 'auto',
  },
  popularActionButton: {
    background: 'var(--accent-clinical)',
    borderColor: 'var(--accent-clinical)',
    color: '#ffffff',
  },
  currentButton: {
    background: 'transparent',
    borderColor: 'var(--border-color)',
    color: 'var(--text-muted)',
    cursor: 'default',
  },
};