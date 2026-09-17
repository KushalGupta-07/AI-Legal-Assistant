import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChecklistTab } from '../ChecklistTab';
import type { LegalDocument } from '../../types/legal';

const mockDoc: LegalDocument = {
  id: 'doc-checklist-1',
  title: 'Lease Agreement Checklist Test',
  type: 'contract',
  fileName: 'lease.pdf',
  content: 'Rent is due on 1st of month.',
  uploadDate: '2026-09-01',
  wordCount: 10,
  analysis: {
    executiveSummary: 'Test summary',
    keyTakeaways: ['Point 1'],
    plainEnglishTranslation: 'Translation',
    laypersonRating: 'Simple',
    complexityScore: 30,
    overallRiskLevel: 'low',
    clauses: [],
    obligations: [],
    deadlines: [
      {
        id: 'dl-1',
        title: 'Submit Notice of Non-Renewal',
        dateOrTimeframe: '60 days prior',
        type: 'notice',
        details: 'Written notice mandatory',
        isCompleted: false,
        clauseRef: 'Section 4'
      }
    ],
    inconsistencies: []
  }
};

describe('ChecklistTab Component', () => {
  it('renders checklist items and progress tracker', () => {
    render(<ChecklistTab document={mockDoc} />);
    expect(screen.getByText('Actionable Compliance & Deadline Checklist')).toBeInTheDocument();
    expect(screen.getByText('Submit Notice of Non-Renewal')).toBeInTheDocument();
    expect(screen.getByText('0/1')).toBeInTheDocument();
  });

  it('toggles item completion state when checkbox button is clicked', () => {
    render(<ChecklistTab document={mockDoc} />);
    const checkboxBtn = screen.getByRole('checkbox');
    expect(checkboxBtn.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(checkboxBtn);
    expect(checkboxBtn.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText('1/1')).toBeInTheDocument();
  });
});
