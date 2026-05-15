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
        throw new LlmError(`LLM call failed: ${error.message}`);
      }
    }, config.llmMaxRetries, config.llmRetryBaseDelayMs);
  }
}
