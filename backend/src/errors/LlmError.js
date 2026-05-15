import { AppError } from './AppError.js';

export class LlmError extends AppError {
  constructor(message) {
    super(message, 502);
  }
}
