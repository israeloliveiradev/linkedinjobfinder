export class PresetController {
  constructor(presetService) {
    this.presetService = presetService;
  }

  async getAll(req, res, next) {
    try {
      const presets = await this.presetService.getAll();
      res.status(200).json({ success: true, data: presets });
    } catch (error) {
      next(error);
    }
  }

  async getByName(req, res, next) {
    try {
      const { name } = req.params;
      const preset = await this.presetService.getByName(name);
      res.status(200).json({ success: true, data: preset });
    } catch (error) {
      next(error);
    }
  }

  async save(req, res, next) {
    try {
      const preset = await this.presetService.savePreset(req.body);
      res.status(201).json({ success: true, data: preset });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { name } = req.params;
      await this.presetService.deletePreset(name);
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }
}
