export class HistoryController {
  constructor(historyService) {
    this.historyService = historyService;
  }

  async getAll(req, res, next) {
    try {
      const history = await this.historyService.getAll(req.user.id);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.historyService.removeEntry(id, req.user.id);
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }

  async clear(req, res, next) {
    try {
      await this.historyService.clearAll(req.user.id);
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }
}
