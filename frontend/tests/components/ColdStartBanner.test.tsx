import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import ColdStartBanner from '../../src/components/shared/ColdStartBanner';
import backendStatus from '../../src/services/backendStatus';

describe('ColdStartBanner Component Tests', () => {
  it('should render null when backend state is awake', () => {
    backendStatus.reportSuccess();
    const { container } = render(<ColdStartBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should render waking state banner when backend state is waking', () => {
    backendStatus.reportTimeout();
    render(<ColdStartBanner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Starting server.../i)).toBeInTheDocument();
  });
});
