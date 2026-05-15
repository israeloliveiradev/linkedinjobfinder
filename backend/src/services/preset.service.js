import { generateId } from '../utils/generateId.js';

export class PresetService {
  constructor(presetRepository) {
    this.presetRepository = presetRepository;
  }

  async getAll() {
    return this.presetRepository.findAll();
  }

  async getByName(name) {
    return this.presetRepository.findByName(name);
  }

  async savePreset(presetData) {
    const preset = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...presetData,
    };
    await this.presetRepository.add(preset);
    return preset;
  }

  async deletePreset(name) {
    await this.presetRepository.deleteByName(name);
  }
}
