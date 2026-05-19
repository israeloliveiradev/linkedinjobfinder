import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim(), 
});

export const { useSession, signIn, signOut } = authClient;
