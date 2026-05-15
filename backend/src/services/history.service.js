import { generateId } from '../utils/generateId.js';

export class HistoryService {
  constructor(historyRepository) {
    this.historyRepository = historyRepository;
  }

  async getAll() {
    return this.historyRepository.findAll();
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

  async removeEntry(id) {
    await this.historyRepository.deleteById(id);
  }

  async clearAll() {
    await this.historyRepository.clear();
  }
}
