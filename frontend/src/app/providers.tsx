'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { isDarkMode } = useUIStore();

  return (
    <QueryClientProvider client={queryClient}>
      <div className={isDarkMode ? 'dark' : 'light'}>
        {children}
      </div>
    </QueryClientProvider>
  );
}
