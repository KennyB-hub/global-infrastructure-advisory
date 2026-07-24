// incidents-scan-button.js
// Backend route for "Run Incident Scan" dashboard button

const { openIncidentsFromAlerts } = require("../../ai/incident-response-workflow");

module.exports = function (router) {
  router.post("/admin/run-incident-scan", (req, res) => {
    try {
      const incidents = openIncidentsFromAlerts();

      res.json({
        ok: true,
        created: incidents.length,
        incidents
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: err.message
      });
    }
  });
};
