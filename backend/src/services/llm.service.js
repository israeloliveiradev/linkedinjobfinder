import OpenAI from 'openai';
import { config } from '../config/env.js';
import { retryWithBackoff } from '../utils/retry.js';
import { LlmError } from '../errors/LlmError.js';

export class LlmService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async chat(messages, options = {}) {
    return retryWithBackoff(async () => {
      try {
        const response = await this.client.chat.completions.create({
          model: config.llmModel,
          messages,
          temperature: options.temperature ?? 0,
          max_tokens: options.maxTokens ?? 1000,
          response_format: options.json ? { type: 'json_object' } : undefined,
        });
        return response.choices[0].message.content;
      } catch (error) {
        console.warn(`[LLM Service] Groq falhou: ${error.message}. Tentando Gemini...`);
        if (!config.geminiApiKey) {
          throw new LlmError(`LLM call failed (Groq), e sem chave Gemini para fallback.`);
        }
        const geminiClient = new OpenAI({
          apiKey: config.geminiApiKey,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
        try {
          const geminiResponse = await geminiClient.chat.completions.create({
            model: config.geminiModel,
            messages,
            temperature: options.temperature ?? 0,
            max_tokens: options.maxTokens ?? 1000,
            response_format: options.json ? { type: 'json_object' } : undefined,
          });
          return geminiResponse.choices[0].message.content;
        } catch (geminiError) {
          throw new LlmError(`LLM call failed em ambos (Groq e Gemini). Erro Gemini: ${geminiError.message}`);
        }
      }
    }, config.llmMaxRetries, config.llmRetryBaseDelayMs);
  }
}
