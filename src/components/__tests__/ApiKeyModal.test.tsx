import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ApiKeyModal } from '../ApiKeyModal';

describe('ApiKeyModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ApiKeyModal isOpen={false} onClose={vi.fn()} apiKey="" onSaveApiKey={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with API key input when isOpen is true', () => {
    render(<ApiKeyModal isOpen={true} onClose={vi.fn()} apiKey="test-key-123" onSaveApiKey={vi.fn()} />);
    expect(screen.getByText('Google Gemini API Key')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('AIzaSy...') as HTMLInputElement;
    expect(input.value).toBe('test-key-123');
  });

  it('calls onSaveApiKey when save button is submitted', () => {
    const onSave = vi.fn();
    render(<ApiKeyModal isOpen={true} onClose={vi.fn()} apiKey="" onSaveApiKey={onSave} />);

    const input = screen.getByPlaceholderText('AIzaSy...');
    fireEvent.change(input, { target: { value: 'AIzaSyNewKey' } });

    const saveBtn = screen.getByText('Save API Key');
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith('AIzaSyNewKey');
  });

  it('closes modal when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<ApiKeyModal isOpen={true} onClose={onClose} apiKey="" onSaveApiKey={vi.fn()} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
