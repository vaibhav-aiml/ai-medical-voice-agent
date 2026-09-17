import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import PricingPlans from '../../src/components/subscription/PricingPlans';

// Mock useBreakpoint
vi.mock('../../src/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({
    isMobile: false,
    isTablet: false,
  }),
}));

// Mock useSubscription
const mockSetSubscriptionTier = vi.fn();
let currentTier: 'free' | 'pro' | 'family' = 'free';

vi.mock('../../src/context/SubscriptionContext', () => ({
  useSubscription: () => ({
    subscription: {
      tier: currentTier,
      consultationsUsed: 0,
      consultationLimit: 5,
      familyMembers: 1,
      expiresAt: null,
    },
    setSubscriptionTier: mockSetSubscriptionTier,
  }),
}));

describe('PricingPlans Component - Phase 2 Professional Cleanup Tests', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    currentTier = 'free';
  });

  it('renders Free tier as active and Pro tier with Most Popular badge when user is on free tier', () => {
    currentTier = 'free';
    render(<PricingPlans onClose={mockOnClose} />);

    // Free card should have the active badge
    const freeCard = screen.getByTestId('plan-card-free');
    expect(freeCard).toHaveTextContent('✓ Active Plan');

    // Free card action button should be disabled with "Active Plan"
    const freeButton = screen.getByTestId('action-button-free');
    expect(freeButton).toBeDisabled();
    expect(freeButton).toHaveTextContent('Active Plan');

    // Pro card should have Most Popular badge
    const proCard = screen.getByTestId('plan-card-pro');
    expect(proCard).toHaveTextContent('★ Most Popular');

    // Pro card action button should be enabled with "Upgrade"
    const proButton = screen.getByTestId('action-button-pro');
    expect(proButton).not.toBeDisabled();
    expect(proButton).toHaveTextContent('Upgrade');
  });

  it('implements badge distinction cleanly when user is on Pro tier (no top-rim collision, eyebrow shown)', () => {
    currentTier = 'pro';
    render(<PricingPlans onClose={mockOnClose} />);

    const proCard = screen.getByTestId('plan-card-pro');

    // Pro card should have top-rim Active Plan badge
    expect(proCard).toHaveTextContent('✓ Active Plan');

    // Pro card should render eyebrow tag "Popular Choice" inside card
    const eyebrow = screen.getByTestId('eyebrow-popular');
    expect(eyebrow).toBeInTheDocument();
    expect(eyebrow).toHaveTextContent('★ Popular Choice');

    // Pro button should be disabled as Active Plan
    const proButton = screen.getByTestId('action-button-pro');
    expect(proButton).toBeDisabled();
    expect(proButton).toHaveTextContent('Active Plan');

    // Free card button should say "Downgrade"
    const freeButton = screen.getByTestId('action-button-free');
    expect(freeButton).toHaveTextContent('Downgrade');
  });

  it('toggles billing cycle from Monthly to Yearly and reflects discount calculations', () => {
    render(<PricingPlans onClose={mockOnClose} />);

    // Monthly is default
    expect(screen.getByText('₹499')).toBeInTheDocument();
    expect(screen.getByText('₹999')).toBeInTheDocument();

    // Switch to Yearly
    const yearlyButton = screen.getByText(/Yearly/i);
    fireEvent.click(yearlyButton);

    // Yearly prices rendered
    expect(screen.getByText('₹4990')).toBeInTheDocument();
    expect(screen.getByText('₹9990')).toBeInTheDocument();

    // Savings badge rendered
    expect(screen.getByText('Save ₹998 per year')).toBeInTheDocument();
  });

  it('triggers tier upgrade on upgrade button click', () => {
    currentTier = 'free';
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<PricingPlans onClose={mockOnClose} />);

    const proButton = screen.getByTestId('action-button-pro');
    fireEvent.click(proButton);

    expect(mockSetSubscriptionTier).toHaveBeenCalledWith('pro');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('invokes onClose when close button is clicked', () => {
    render(<PricingPlans onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText(/Close pricing modal/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
