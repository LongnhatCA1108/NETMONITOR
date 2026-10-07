// ponytail: dashboard controller handling requests for network metrics and system summary
const { dashboardService } = require('./service');

class DashboardController {
  async getSummary(req, res) {
    const data = await dashboardService.getSummary();
    res.json(data);
  }
}

const dashboardController = new DashboardController();
module.exports = { DashboardController, dashboardController };
