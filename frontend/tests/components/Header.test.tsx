import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import Header from '../../src/components/shared/Header';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ user: { id: 'test-user-id', firstName: 'John' } }),
}));

vi.mock('../../src/services/apiClient', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: [
          { id: '1', name: 'Amoxicillin', dosage: '500mg', frequency: 'twice_daily', times: ['08:00', '20:00'] },
        ],
      },
    }),
  },
}));

vi.mock('../../src/components/profile/ProfileDropdown', () => ({
  default: () => <div data-testid="mock-profile-dropdown">Profile</div>,
}));

let mockBreakpoint = {
  isMobile: false,
  isTablet: false,
  width: 1200,
};

vi.mock('../../src/hooks/useBreakpoint', () => ({
  useBreakpoint: () => mockBreakpoint,
}));

describe('Header Component - Widened Breakpoint & Mobile Nav Tests', () => {
  const defaultProps = {
    setShowSymptomChecker: vi.fn(),
    setShowHealthTips: vi.fn(),
    setShowEmergencyContacts: vi.fn(),
    setShowHealthGoals: vi.fn(),
    setShowVoiceCustomization: vi.fn(),
    setShowProgressDashboard: vi.fn(),
    setShowDataExport: vi.fn(),
    setShowTwoFactorAuth: vi.fn(),
    setShowAppointmentsList: vi.fn(),
    setShowVoiceBiometricsEnrollment: vi.fn(),
    setShowFHIRConnector: vi.fn(),
    onNewConsultation: vi.fn(),
    onUpgrade: vi.fn(),
    onOpenReminders: vi.fn(),
    userName: 'Dr. Smith',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Navigation (> 1024px)', () => {
    beforeEach(() => {
      mockBreakpoint = { isMobile: false, isTablet: false, width: 1200 };
    });

    it('renders desktop navigation bar with links and action buttons', () => {
      render(<Header {...defaultProps} />);

      // Desktop nav links exist
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(screen.getByText('Appointments')).toBeInTheDocument();
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
      expect(screen.getByText('New Consultation')).toBeInTheDocument();

      // Hamburger button should NOT be rendered
      expect(screen.queryByLabelText('Open navigation menu')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Close navigation menu')).not.toBeInTheDocument();
    });
  });

  describe('Tablet Navigation at Widened Breakpoint (800px, 900px, 1024px)', () => {
    beforeEach(() => {
      // isTablet: true triggers showMobileNav
      mockBreakpoint = { isMobile: false, isTablet: true, width: 1024 };
    });

    it('renders hamburger button and hides top-level desktop nav buttons', async () => {
      let container: HTMLElement;
      await act(async () => {
        const renderResult = render(<Header {...defaultProps} />);
        container = renderResult.container;
      });

      // Hamburger button is rendered
      const hamburger = screen.getByLabelText('Open navigation menu');
      expect(hamburger).toBeInTheDocument();

      // Desktop nav links and desktop upgrade button should NOT be rendered
      expect(container.querySelector('.upgrade-button')).not.toBeInTheDocument();
      expect(container.querySelector('.consult-button')).not.toBeInTheDocument();
    });

    it('opens mobile slide-down menu when hamburger is clicked', () => {
      render(<Header {...defaultProps} />);

      const hamburger = screen.getByLabelText('Open navigation menu');
      fireEvent.click(hamburger);

      // Now aria-label is updated
      expect(screen.getByLabelText('Close navigation menu')).toBeInTheDocument();

      // Navigation items are present in mobile menu
      const navMenu = screen.getByRole('navigation', { name: 'Mobile navigation' });
      expect(navMenu).toBeInTheDocument();

      // Check key navigation actions inside mobile menu
      expect(screen.getByText('New Consultation')).toBeInTheDocument();
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
      expect(screen.getByText('Reminders')).toBeInTheDocument();
      expect(screen.getByText('Symptom Checker')).toBeInTheDocument();
      expect(screen.getByText('Health Tips')).toBeInTheDocument();
      expect(screen.getByText('Emergency Contacts')).toBeInTheDocument();
    });

    it('triggers action and closes mobile menu when an item is clicked', () => {
      render(<Header {...defaultProps} />);

      const hamburger = screen.getByLabelText('Open navigation menu');
      fireEvent.click(hamburger);

      const upgradeBtn = screen.getByText('Upgrade');
      fireEvent.click(upgradeBtn);

      expect(defaultProps.onUpgrade).toHaveBeenCalledTimes(1);
      // Menu should be closed
      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    });

    it('closes mobile menu on Escape key press', () => {
      render(<Header {...defaultProps} />);

      const hamburger = screen.getByLabelText('Open navigation menu');
      fireEvent.click(hamburger);
      expect(screen.getByLabelText('Close navigation menu')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation (<= 600px)', () => {
    beforeEach(() => {
      mockBreakpoint = { isMobile: true, isTablet: false, width: 375 };
    });

    it('renders hamburger navigation on mobile viewport', () => {
      render(<Header {...defaultProps} />);

      const hamburger = screen.getByLabelText('Open navigation menu');
      expect(hamburger).toBeInTheDocument();
    });
  });
});
