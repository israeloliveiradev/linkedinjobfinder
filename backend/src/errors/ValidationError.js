import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400);
    this.details = details;
  }
}
