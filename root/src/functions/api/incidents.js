// incidents.js
// Incident Response API

const {
  openIncidentsFromAlerts,
  listIncidents,
  setIncidentStatus,
  addIncidentNote
} = require("../ai/incident-response-workflow");

module.exports = function (router) {
  // Trigger incident creation from current alerts
  router.post("/security/incidents/scan", (req, res) => {
    try {
      const incidents = openIncidentsFromAlerts();
      res.json({ created: incidents.length, incidents });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // List all incidents
  router.get("/security/incidents", (req, res) => {
    try {
      const incidents = listIncidents();
      res.json({ total: incidents.length, incidents });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update incident status
  router.post("/security/incidents/:id/status", (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = setIncidentStatus(id, status);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add note to incident
  router.post("/security/incidents/:id/notes", (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const updated = addIncidentNote(id, note);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
