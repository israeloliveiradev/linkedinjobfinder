/**
 * llmParser.js — Integração com Groq via cliente OpenAI-compatible
 * Responsável por interpretar linguagem natural em parâmetros de busca.
 */

import OpenAI from 'openai';
import { sleep, extractJsonFromString } from './utils.js';
import logger from './logger.js';

// ─── Cliente Groq (compatível com SDK OpenAI) ─────────────────────────────────
// A validação da chave é feita em index.js antes de qualquer chamada LLM.
// Usamos dangerouslyAllowBrowser=false (padrão) + apiKey lazy para não crashar no import.
export const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || 'placeholder-validated-at-startup',
  baseURL: 'https://api.groq.com/openai/v1',
});

// ─── Rate Limiting ────────────────────────────────────────────────────────────
let lastCallTime = 0;
const MIN_INTERVAL = 500; // ms entre chamadas à API

async function applyRateLimit() {
  const elapsed = Date.now() - lastCallTime;
  if (lastCallTime > 0 && elapsed < MIN_INTERVAL) {
    await sleep(MIN_INTERVAL - elapsed);
  }
  lastCallTime = Date.now();
}

// ─── Retry com Backoff Exponencial ───────────────────────────────────────────

/**
 * Executa uma função com retry e backoff exponencial.
 * @param {Function} fn          - Função async a executar
 * @param {number}   maxRetries  - Número máximo de tentativas
 * @param {number}   baseDelay   - Delay base em ms
 * @returns {Promise<any>}
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn(`Tentativa ${attempt + 1}/${maxRetries} falhou. Aguardando ${delay}ms... (${err.message})`);
      await sleep(delay);
    }
  }
  throw lastError;
}

// ─── System Prompt Principal ──────────────────────────────────────────────────
const SYSTEM_PROMPT = `Você é um especialista em extração de parâmetros de busca de emprego.
Analise o input e extraia parâmetros para busca no LinkedIn.
Retorne APENAS JSON válido sem markdown:

{
  "keywords": "cargo ou palavras-chave",
  "location": "cidade, estado ou país em português",
  "period": "valor exato: 30min|1h|2h|3h|6h|12h|24h|2d|3d|7d|14d|30d",
  "jobType": ["valores: clt|pj|freelance|estagio|temporario|part-time"],
  "experienceLevel": ["valores: junior|pleno|senior|diretor|executivo|estagio"],
  "workMode": ["valores: presencial|remoto|hibrido"],
  "sortBy": "recente ou relevancia",
  "distance": numero_inteiro,
  "easyApply": boolean,
  "lowApplicants": boolean,
  "company": "nome da empresa ou null"
}

REGRAS CRÍTICAS:
- keywords: APENAS o cargo/função, sem localidade/período/modalidade
- easyApply: true se mencionar "candidatura fácil", "easy apply", "aplicar direto"
- lowApplicants: true se mencionar "poucas vagas", "pouco concorrido", "menos candidatos", "menos de 10"
- company: extrair se o usuário mencionar empresa específica
- period defaults: "hoje"→"24h", "essa semana"→"7d", "esse mês"→"30d", "última hora"→"1h", "agora"→"30min"
- distance: aumentar para 50 se mencionar "região", "arredores", "próximo"

EXEMPLOS (few-shot):

Input: "vagas de dev React júnior remoto easy apply nas últimas 6 horas"
Output: {"keywords":"desenvolvedor React","location":"brasil","period":"6h","jobType":[],"experienceLevel":["junior"],"workMode":["remoto"],"sortBy":"recente","distance":25,"easyApply":true,"lowApplicants":false,"company":null}

Input: "engenheiro de dados sênior CLT São Paulo postadas hoje menos de 10 candidatos"
Output: {"keywords":"engenheiro de dados","location":"são paulo","period":"24h","jobType":["clt"],"experienceLevel":["senior"],"workMode":[],"sortBy":"recente","distance":25,"easyApply":false,"lowApplicants":true,"company":null}

Input: "product manager híbrido pleno ou sênior últimos 3 dias na Nubank"
Output: {"keywords":"product manager","location":"brasil","period":"3d","jobType":[],"experienceLevel":["pleno","senior"],"workMode":["hibrido"],"sortBy":"recente","distance":25,"easyApply":false,"lowApplicants":false,"company":"Nubank"}

Input: "analista de marketing PJ Curitiba essa semana por relevância"
Output: {"keywords":"analista de marketing","location":"curitiba","period":"7d","jobType":["pj"],"experienceLevel":[],"workMode":[],"sortBy":"relevancia","distance":25,"easyApply":false,"lowApplicants":false,"company":null}

Input: "qualquer vaga de TI remoto nas últimas 30 minutos"
Output: {"keywords":"tecnologia da informação","location":"brasil","period":"30min","jobType":[],"experienceLevel":[],"workMode":["remoto"],"sortBy":"recente","distance":25,"easyApply":false,"lowApplicants":false,"company":null}`;

// ─── Parâmetros padrão de fallback ────────────────────────────────────────────
const DEFAULT_PARSED = {
  keywords: '',
  location: 'brasil',
  period: '24h',
  jobType: [],
  experienceLevel: [],
  workMode: [],
  sortBy: 'recente',
  distance: 25,
  easyApply: false,
  lowApplicants: false,
  company: null,
};

/**
 * Interpreta uma query em linguagem natural e extrai parâmetros de busca.
 *
 * @param {string} userInput - Texto livre do usuário
 * @returns {Promise<object>} Parâmetros estruturados
 */
export async function parseJobSearchIntent(userInput) {
  await applyRateLimit();

  try {
    const result = await retryWithBackoff(async () => {
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        max_tokens: 600,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userInput },
        ],
      });

      logger.debug(`Payload LLM (parse): ${JSON.stringify(response.choices[0]?.message)}`);

      const content = response.choices[0]?.message?.content || '';

      // Tentativa direta de parse
      try {
        return JSON.parse(content);
      } catch (_) {
        // Fallback: extrai JSON de string com texto ao redor
        const extracted = extractJsonFromString(content);
        if (extracted) return extracted;
        throw new Error('Resposta da LLM não contém JSON válido.');
      }
    });

    // Garante que todos os campos existam (merge com defaults)
    return { ...DEFAULT_PARSED, ...result };
  } catch (err) {
    logger.warn(`Falha ao interpretar com LLM: ${err.message}. Usando parâmetros padrão.`);
    // Retorna defaults + keywords do input original como fallback
    return {
      ...DEFAULT_PARSED,
      keywords: userInput.slice(0, 100),
    };
  }
}
