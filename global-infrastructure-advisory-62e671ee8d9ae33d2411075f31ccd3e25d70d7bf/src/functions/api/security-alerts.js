// security-alerts.js
// API endpoint for Security Alerting Service

const { getSecurityAlerts } = require("../ai/security-alerting-service");

module.exports = function (router) {
  router.get("/security/alerts", (req, res) => {
    try {
      const alerts = getSecurityAlerts();
      res.json({ total: alerts.length, alerts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
