# 🔗 LinkedIn Job Finder v3.0

> CLI profissional para geração de URLs de busca otimizadas do LinkedIn  
> com integração Groq LLM, presets, batch e exportação de resultados.

## ✨ Funcionalidades

- **Busca com IA** — descreva em linguagem natural, a LLM extrai os parâmetros
- **Expansão de keywords** — gera variações de cargo com boolean search automático
- **Modo Batch** — processa múltiplas buscas de uma vez
- **Presets** — salve buscas favoritas com nome para reutilização
- **Histórico persistente** — todas as buscas são salvas automaticamente
- **Exportação** — exporte resultados para TXT ou Markdown
- **40+ localizações** — cidades brasileiras e internacionais mapeadas

## 🚀 Instalação

```bash
cd linkedin-job-finder
npm install
```

## ⚙️ Configuração

Edite o arquivo `.env`:

```env
GROQ_API_KEY=sua_chave_aqui   # https://console.groq.com
DEBUG=false
```

## ▶️ Uso

```bash
npm start
```

## 💡 Exemplos de busca

```
vagas de dev React júnior remoto nas últimas 6h
engenheiro dados sênior CLT São Paulo easy apply hoje
product manager híbrido pleno Nubank 3 dias
analista financeiro PJ Curitiba pouco concorrido essa semana
"React OR Vue OR Angular" developer remoto 24h
```

## 📦 Comandos da CLI

| Comando | Ação |
|---------|------|
| `[texto livre]` | Busca com IA |
| `batch` | Modo batch |
| `preset salvar` / `ps` | Salva última busca |
| `preset listar` / `pl` | Lista presets |
| `preset usar [n]` / `pu [n]` | Executa preset |
| `historico` / `h` | Últimas 10 buscas |
| `exportar txt` / `et` | Exporta para TXT |
| `exportar md` / `em` | Exporta para Markdown |
| `config` | Ver/alterar configurações |
| `ajuda` / `?` | Help completo |
| `sair` / `q` | Encerrar |

## 🗂️ Estrutura

```
linkedin-job-finder/
├── src/
│   ├── index.js              ← CLI principal
│   ├── constants.js          ← Mapas e constantes
│   ├── linkedinUrlBuilder.js ← Motor de URLs
│   ├── llmParser.js          ← Integração Groq
│   ├── keywordExpander.js    ← Expansão de keywords
│   ├── batchProcessor.js     ← Processamento batch
│   ├── presetManager.js      ← Presets
│   ├── historyManager.js     ← Histórico
│   ├── configManager.js      ← Configurações
│   ├── exporter.js           ← Exportação
│   ├── validator.js          ← Validação
│   ├── logger.js             ← Logger colorido
│   └── utils.js              ← Helpers
├── data/                     ← Criado automaticamente
│   ├── history.json
│   ├── presets.json
│   └── exports/
├── config.json               ← Criado no primeiro uso
├── .env
└── package.json
```

## 🔧 Configurações

| Chave | Padrão | Descrição |
|-------|--------|-----------|
| `defaultLocation` | `brasil` | Localização padrão |
| `defaultPeriod` | `24h` | Período padrão |
| `autoOpenBrowser` | `false` | Abrir URL automaticamente |
| `expandKeywords` | `true` | Expandir keywords com IA |
| `defaultDistance` | `25` | Raio de busca em km |

Altere via CLI: `config autoOpenBrowser true`

## 🛠️ Stack

- **Node.js ESModules** (`"type": "module"`)
- **openai@^4** — cliente compatível com Groq
- **chalk@^5** — cores no terminal (ESM nativo)
- **dotenv@^16** — variáveis de ambiente
