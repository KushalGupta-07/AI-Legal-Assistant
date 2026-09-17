import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DisclaimerBanner } from '../DisclaimerBanner';

describe('DisclaimerBanner Component', () => {
  it('renders prominent legal disclaimer banner by default', () => {
    render(<DisclaimerBanner />);
    expect(screen.getByText(/Important Legal Notice:/i)).toBeInTheDocument();
    expect(screen.getByText(/attorney-client legal advice/i)).toBeInTheDocument();
  });

  it('collapses notice when dismiss button is clicked', () => {
    render(<DisclaimerBanner />);
    const dismissBtn = screen.getByLabelText(/Dismiss legal notice banner/i);
    fireEvent.click(dismissBtn);

    expect(screen.getByText(/View Full Disclaimer/i)).toBeInTheDocument();
  });

  it('re-expands notice when "View Full Disclaimer" is clicked', () => {
    render(<DisclaimerBanner />);
    const dismissBtn = screen.getByLabelText(/Dismiss legal notice banner/i);
    fireEvent.click(dismissBtn);

    const expandBtn = screen.getByText(/View Full Disclaimer/i);
    fireEvent.click(expandBtn);

    expect(screen.getByText(/Important Legal Notice:/i)).toBeInTheDocument();
  });
});
