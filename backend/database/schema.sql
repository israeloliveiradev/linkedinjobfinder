-- Tabela de Histórico de Buscas
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    name TEXT UNIQUE NOT NULL,
    query TEXT NOT NULL,
    params JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_presets_name ON search_presets(name);
