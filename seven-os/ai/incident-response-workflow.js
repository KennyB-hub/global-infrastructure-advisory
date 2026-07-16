// incident-response-workflow.js
// V12 Alpha – Incident Response Workflow

const { getSecurityAlerts } = require("./security-alerting-service");
const { createIncident, updateIncident, listIncidents } = require("./incident-store");
const { deactivateTemplate } = require("./incident-utils"); // helper we define below

/**
 * Map alert type → severity + default action.
 */
const ALERT_POLICY = {
  CRITICAL_RISK: { severity: "critical", autoContain: true },
  HIGH_RISK: { severity: "high", autoContain: false },
  BLOCKED_TEMPLATE: { severity: "high", autoContain: false },
  ESCALATED_TEMPLATE: { severity: "medium", autoContain: false },
  TRUSTZONE_OVERLOAD: { severity: "medium", autoContain: false },
  SECTOR_RISK: { severity: "medium", autoContain: false }
};

/**
 * Create incidents from current alerts.
 */
function openIncidentsFromAlerts() {
  const alerts = getSecurityAlerts();
  const incidents = [];

  alerts.forEach((alert) => {
    const policy = ALERT_POLICY[alert.type] || {
      severity: "low",
      autoContain: false
    };

    const incident = createIncident({
      type: alert.type,
      severity: policy.severity,
      source: "security-alerting-service",
      templateId: alert.templateId || null,
      trustZone: alert.trustZone || null,
      sector: alert.sector || null,
      message: alert.message,
      actions: [],
      notes: []
    });

    // Auto-containment if policy says so
    if (policy.autoContain && alert.templateId) {
      try {
        deactivateTemplate(alert.templateId);
        incident.actions.push({
          type: "AUTO_CONTAINMENT",
          templateId: alert.templateId,
          timestamp: new Date().toISOString(),
          detail: "Template deactivated due to critical risk."
        });
        incident.status = "mitigated";
        updateIncident(incident.id, incident);
      } catch (err) {
        incident.actions.push({
          type: "AUTO_CONTAINMENT_FAILED",
          templateId: alert.templateId,
          timestamp: new Date().toISOString(),
          error: err.message
        });
        updateIncident(incident.id, incident);
      }
    }

    incidents.push(incident);
  });

  return incidents;
}

/**
 * Manually update incident status (for console/UI).
 */
function setIncidentStatus(id, status) {
  return updateIncident(id, { status });
}

/**
 * Add a note to an incident.
 */
function addIncidentNote(id, note) {
  const incident = listIncidents().find((i) => i.id === id);
  if (!incident) throw new Error(`Incident not found: ${id}`);

  const notes = incident.notes || [];
  notes.push({
    timestamp: new Date().toISOString(),
    note
  });

  return updateIncident(id, { notes });
}

module.exports = {
  openIncidentsFromAlerts,
  setIncidentStatus,
  addIncidentNote,
  listIncidents
};
