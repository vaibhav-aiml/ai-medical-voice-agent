import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import TriageDisplay from '../../src/components/consultation/TriageDisplay';

describe('TriageDisplay Component Tests', () => {
  it('should render correct urgency result for RED level', () => {
    const mockResult = {
      colorCode: 'red' as const,
      urgencyLevel: 'emergency_immediate' as const,
      score: 95,
      recommendation: 'Seek Immediate Emergency Care',
      suggestedAction: 'Call 108',
      riskFactors: ['Chest Pain'],
      requiresAmbulance: true
    };

    render(<TriageDisplay result={mockResult} onClose={() => {}} />);
    expect(screen.getByText(/Seek Immediate Emergency Care/i)).toBeInTheDocument();
  });
});
