-- Tabelas do Better Auth
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL,
  "image" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "user"("email");

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'user';
UPDATE "user" SET "role" = 'admin' WHERE "email" = 'israeloliveiracontact@gmail.com';

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "token" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "session_token_key" ON "session"("token");

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3),
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3),
  CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- Tabela de Histórico de Buscas
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    original_query TEXT NOT NULL,
    parsed_params JSONB NOT NULL,
    expanded_keywords TEXT[] DEFAULT '{}',
    boolean_query TEXT NOT NULL,
    urls JSONB NOT NULL,
    filters_applied INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Presets (Filtros Salvos)
CREATE TABLE IF NOT EXISTS search_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    query TEXT NOT NULL,
    params JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Migração de tabelas antigas (Adiciona user_id caso já existam)
ALTER TABLE search_history ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT 'anon';
ALTER TABLE search_presets ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT 'anon';

-- Configurações do Admin (Preços e PIX)
CREATE TABLE IF NOT EXISTS admin_config (
    id SERIAL PRIMARY KEY,
    pix_key TEXT NOT NULL DEFAULT '',
    qr_code_url TEXT NOT NULL DEFAULT '',
    pro_price DECIMAL(10,2) NOT NULL DEFAULT 49.90,
    pro_price_mensal DECIMAL(10,2) NOT NULL DEFAULT 10.90,
    pro_price_trimestral DECIMAL(10,2) NOT NULL DEFAULT 25.90,
    pro_price_semestral DECIMAL(10,2) NOT NULL DEFAULT 29.90,
    free_limit INTEGER NOT NULL DEFAULT 5,
    free_copilot_limit INTEGER NOT NULL DEFAULT 2,
    whatsapp_number TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS whatsapp_number TEXT NOT NULL DEFAULT '';
ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS pro_price_semestral DECIMAL(10,2) NOT NULL DEFAULT 29.90;
ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS pro_price_mensal DECIMAL(10,2) NOT NULL DEFAULT 10.90;
ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS pro_price_trimestral DECIMAL(10,2) NOT NULL DEFAULT 25.90;
ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS free_copilot_limit INTEGER NOT NULL DEFAULT 2;

-- Inserir configuração padrão caso não exista
INSERT INTO admin_config (id) VALUES (1) ON CONFLICT DO NOTHING;
UPDATE admin_config SET free_limit = 5 WHERE id = 1 AND free_limit = 10;

-- Assinaturas dos usuários
CREATE TABLE IF NOT EXISTS subscriptions (
    user_id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'free',
    search_count INTEGER NOT NULL DEFAULT 0,
    copilot_count INTEGER NOT NULL DEFAULT 0,
    extra_copilot_credits INTEGER NOT NULL DEFAULT 0,
    extra_express_credits INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    reset_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_express BOOLEAN NOT NULL DEFAULT false,
    used_posts_vaga BOOLEAN NOT NULL DEFAULT false,
    used_posts_hiring BOOLEAN NOT NULL DEFAULT false,
    used_posts_curriculo BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS copilot_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS extra_copilot_credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS extra_express_credits INTEGER NOT NULL DEFAULT 0;

-- Currículos dos candidatos (Biblioteca de Currículos PRO)
CREATE TABLE IF NOT EXISTS user_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'Currículo Padrão',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_history_user ON search_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_presets_user ON search_presets(user_id, name);
CREATE INDEX IF NOT EXISTS idx_resumes_user ON user_resumes(user_id);

