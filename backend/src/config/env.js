import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const requiredEnvs = ['GROQ_API_KEY', 'LLM_MODEL'];

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
  groqApiKey: process.env.GROQ_API_KEY,
  llmModel: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
  allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  historyPath: path.join(process.cwd(), 'data', 'history.json'),
  presetsPath: path.join(process.cwd(), 'data', 'presets.json'),
};
