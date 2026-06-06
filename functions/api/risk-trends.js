// risk-trends.js
// API endpoint for Risk Trend Analytics Engine

const { analyzeRiskTrends } = require("../ai/risk-trend-analytics-engine");

module.exports = function (router) {
  router.get("/security/risk-trends", (req, res) => {
    try {
      const trends = analyzeRiskTrends();
      res.json(trends);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
