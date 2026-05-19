import { generateId } from '../utils/generateId.js';

export class HistoryService {
  constructor(historyRepository) {
    this.historyRepository = historyRepository;
  }

  async getAll(userId) {
    return this.historyRepository.findAll(userId);
  }

  async addEntry(entryData) {
    const entry = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...entryData,
    };
    await this.historyRepository.add(entry);
    return entry;
  }

  async removeEntry(id, userId) {
    await this.historyRepository.deleteById(id, userId);
  }

  async clearAll(userId) {
    await this.historyRepository.clear(userId);
  }
}
