export class PresetController {
  constructor(presetService) {
    this.presetService = presetService;
  }

  async getAll(req, res, next) {
    try {
      const userId = req.user?.id;
      const presets = await this.presetService.getAll(userId);
      res.status(200).json({ success: true, data: presets });
    } catch (error) {
      next(error);
    }
  }

  async getByName(req, res, next) {
    try {
      const { name } = req.params;
      const userId = req.user?.id;
      const preset = await this.presetService.getByName(name, userId);
      res.status(200).json({ success: true, data: preset });
    } catch (error) {
      next(error);
    }
  }

  async save(req, res, next) {
    try {
      const userId = req.user?.id;
      const preset = await this.presetService.savePreset(req.body, userId);
      res.status(201).json({ success: true, data: preset });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { name } = req.params;
      const userId = req.user?.id;
      await this.presetService.deletePreset(name, userId);
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }
}
