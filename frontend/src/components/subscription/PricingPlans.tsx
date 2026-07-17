import { useState } from 'react';
import { Check, Crown, Users, Sparkles, X } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';

export default function PricingPlans({ onClose }: { onClose: () => void }) {
  const { setSubscriptionTier, subscription } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      tier: 'free' as const,
      price: { monthly: 0, yearly: 0 },
      icon: <Sparkles size={24} />,
      color: '#64748b',
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
      icon: <Crown size={24} />,
      color: '#f59e0b',
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
      icon: <Users size={24} />,
      color: '#10b981',
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
      // Simulate payment - In production, integrate Razorpay/Stripe
      alert(`✨ ${tier.toUpperCase()} Plan Selected!\n\nPrice: ₹${billingCycle === 'monthly' ? plans.find(p => p.tier === tier)?.price.monthly : plans.find(p => p.tier === tier)?.price.yearly}\n\nThis is a demo. In production, payment gateway will be integrated.`);
      setSubscriptionTier(tier);
      onClose();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Choose Your Plan</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.billingToggle}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{ ...styles.toggleButton, ...(billingCycle === 'monthly' ? styles.toggleActive : {}) }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{ ...styles.toggleButton, ...(billingCycle === 'yearly' ? styles.toggleActive : {}) }}
          >
            Yearly <span style={styles.saveBadge}>Save 20%</span>
          </button>
        </div>

        <div style={styles.plansContainer}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                ...styles.planCard,
                ...(subscription.tier === plan.tier ? styles.currentPlan : {}),
                ...(plan.popular ? styles.popularPlan : {}),
              }}
            >
              {plan.popular && <div style={styles.popularBadge}>Most Popular</div>}
              {subscription.tier === plan.tier && <div style={styles.currentBadge}>Current Plan</div>}
              
              <div style={{ ...styles.planIcon, background: `${plan.color}20`, color: plan.color }}>
                {plan.icon}
              </div>
              <h3 style={styles.planName}>{plan.name}</h3>
              <div style={styles.planPrice}>
                <span style={styles.priceAmount}>₹{billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}</span>
                <span style={styles.pricePeriod}>/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
              </div>
              {plan.price.yearly > 0 && billingCycle === 'yearly' && (
                <div style={styles.savedAmount}>Save ₹{(plan.price.monthly * 12) - plan.price.yearly}</div>
              )}
              
              <div style={styles.featuresList}>
                <div style={styles.featuresTitle}>What's included:</div>
                {plan.features.map((feature, i) => (
                  <div key={i} style={styles.featureItem}>
                    <Check size={16} color="#10b981" />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature, i) => (
                  <div key={i} style={styles.featureItemDisabled}>
                    <X size={16} color="#ef4444" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => handleUpgrade(plan.tier)}
                disabled={subscription.tier === plan.tier}
                style={{
                  ...styles.upgradeButton,
                  ...(subscription.tier === plan.tier ? styles.currentButton : {}),
                  ...(plan.popular ? styles.popularButton : {}),
                }}
              >
                {subscription.tier === plan.tier ? 'Current Plan' : plan.tier === 'free' ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          ))}
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
    maxWidth: '1200px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto' as const,
    padding: '32px',
    border: '1px solid var(--border-color)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  billingToggle: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '32px',
  },
  toggleButton: {
    padding: '10px 24px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    transition: 'all 0.2s ease',
  },
  toggleActive: {
    background: '#3b82f6',
    borderColor: '#3b82f6',
    color: 'white',
  },
  saveBadge: {
    fontSize: '11px',
    marginLeft: '6px',
    padding: '2px 6px',
    background: '#10b981',
    borderRadius: '20px',
    color: 'white',
  },
  plansContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  planCard: {
    position: 'relative' as const,
    padding: '28px',
    background: 'var(--bg-secondary)',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    transition: 'transform 0.2s ease',
  },
  popularPlan: {
    border: '2px solid #f59e0b',
    transform: 'scale(1.02)',
  },
  currentPlan: {
    border: '2px solid #3b82f6',
    background: 'rgba(59, 130, 246, 0.05)',
  },
  popularBadge: {
    position: 'absolute' as const,
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#f59e0b',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
  },
  currentBadge: {
    position: 'absolute' as const,
    top: '-12px',
    right: '20px',
    background: '#3b82f6',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 500,
  },
  planIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  planName: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  planPrice: {
    marginBottom: '20px',
  },
  priceAmount: {
    fontSize: '36px',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  pricePeriod: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  savedAmount: {
    fontSize: '12px',
    color: '#10b981',
    marginTop: '4px',
  },
  featuresList: {
    marginBottom: '28px',
  },
  featuresTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
    fontSize: '13px',
    color: 'var(--text-primary)',
  },
  featureItemDisabled: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    opacity: 0.6,
  },
  upgradeButton: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease',
  },
  popularButton: {
    background: '#f59e0b',
    borderColor: '#f59e0b',
    color: 'white',
  },
  currentButton: {
    background: '#3b82f6',
    borderColor: '#3b82f6',
    color: 'white',
    cursor: 'default',
  },
};