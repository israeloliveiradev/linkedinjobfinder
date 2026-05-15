import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const requiredEnvs = ['GROQ_API_KEY', 'LLM_MODEL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

export const validateEnv = () => {
  const missing = requiredEnvs.filter(env => !process.env[env]);

  if (missing.length > 0) {
    console.error('❌ [Config] Variáveis de ambiente faltando:', missing.join(', '));
    process.exit(1);
  }

  console.log('✅ [Config] Variáveis de ambiente validadas.');
};

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  groqApiKey: process.env.GROQ_API_KEY?.trim(),
  llmModel: process.env.LLM_MODEL?.trim() || 'llama-3.3-70b-versatile',
  allowedOrigin: process.env.ALLOWED_ORIGIN?.trim() || 'http://localhost:3000',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  llmMaxRetries: parseInt(process.env.LLM_MAX_RETRIES) || 3,
  llmRetryBaseDelayMs: parseInt(process.env.LLM_RETRY_BASE_DELAY_MS) || 500,
};
