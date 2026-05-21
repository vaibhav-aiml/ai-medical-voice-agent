import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SubscriptionTier = 'free' | 'pro' | 'family';

interface SubscriptionInfo {
  tier: SubscriptionTier;
  consultationsUsed: number;
  consultationLimit: number;
  familyMembers: number;
  expiresAt: Date | null;
}

interface SubscriptionContextType {
  subscription: SubscriptionInfo;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  incrementConsultation: () => boolean;
  canStartConsultation: () => boolean;
  addFamilyMember: (email: string) => boolean;
  getRemainingConsultations: () => number;
  getTierBenefits: () => any;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const TIER_LIMITS = {
  free: {
    consultationsPerMonth: 5,
    familyMembers: 1,
    features: ['Basic Reports', '5 Consultations/month', 'Email Support'],
  },
  pro: {
    consultationsPerMonth: 999999,
    familyMembers: 1,
    features: ['Unlimited Consultations', 'Detailed Reports', 'Priority Email Support', 'Advanced Analytics'],
  },
  family: {
    consultationsPerMonth: 999999,
    familyMembers: 5,
    features: ['Unlimited Consultations', 'Detailed Reports', 'Priority Support', '5 Family Members', 'Advanced Analytics'],
  },
};

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionInfo>(() => {
    const saved = localStorage.getItem('subscription');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      tier: 'free',
      consultationsUsed: 0,
      consultationLimit: TIER_LIMITS.free.consultationsPerMonth,
      familyMembers: 1,
      expiresAt: null,
    };
  });

  useEffect(() => {
    localStorage.setItem('subscription', JSON.stringify(subscription));
  }, [subscription]);

  const setSubscriptionTier = (tier: SubscriptionTier) => {
    const limits = TIER_LIMITS[tier];
    setSubscription({
      tier,
      consultationsUsed: 0,
      consultationLimit: limits.consultationsPerMonth,
      familyMembers: limits.familyMembers,
      expiresAt: tier === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    alert(`✅ Subscription upgraded to ${tier.toUpperCase()} plan!`);
  };

  const incrementConsultation = () => {
    if (subscription.consultationsUsed < subscription.consultationLimit) {
      setSubscription(prev => ({
        ...prev,
        consultationsUsed: prev.consultationsUsed + 1,
      }));
      return true;
    }
    return false;
  };

  const canStartConsultation = () => {
    if (subscription.tier !== 'free') return true;
    return subscription.consultationsUsed < subscription.consultationLimit;
  };

  const getRemainingConsultations = () => {
    return subscription.consultationLimit - subscription.consultationsUsed;
  };

  const addFamilyMember = (email: string) => {
    const familyMembers = JSON.parse(localStorage.getItem('familyMembers') || '[]');
    if (familyMembers.length >= subscription.familyMembers) {
      alert(`You can only add up to ${subscription.familyMembers} family member(s) on your plan`);
      return false;
    }
    familyMembers.push({ email, addedAt: new Date().toISOString() });
    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
    alert(`Family member ${email} added successfully!`);
    return true;
  };

  const getTierBenefits = () => {
    return TIER_LIMITS[subscription.tier];
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        setSubscriptionTier,
        incrementConsultation,
        canStartConsultation,
        addFamilyMember,
        getRemainingConsultations,
        getTierBenefits,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};