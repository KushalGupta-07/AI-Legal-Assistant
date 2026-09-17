import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.scrollTo
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  });

  // Mock Element.prototype.scrollIntoView
  Element.prototype.scrollIntoView = vi.fn();

  // Mock clipboard API if not present
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });
  }

  // Mock URL.createObjectURL and revokeObjectURL
  if (!window.URL.createObjectURL) {
    Object.defineProperty(window.URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:http://localhost/test-blob'),
      writable: true,
    });
  }
  if (!window.URL.revokeObjectURL) {
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      value: vi.fn(),
      writable: true,
    });
  }
}
