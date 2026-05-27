import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: () => null,
      replace: () => null,
    };
  },
  usePathname() {
    return '';
  },
}));
