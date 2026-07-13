import { betterAuth } from 'better-auth';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const useSsl = (process.env.DATABASE_URL || '').includes('supabase.co') || 
               (process.env.DATABASE_URL || '').includes('render.com') || 
               (process.env.DATABASE_URL || '').includes('neon.tech') || 
               process.env.DB_SSL === 'true';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});


export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  trustedOrigins: ['http://localhost:3000', 'https://vagas.rankia.cloud', process.env.ALLOWED_ORIGIN].filter(Boolean),
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  }
});
