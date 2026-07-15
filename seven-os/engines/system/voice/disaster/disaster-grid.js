// system/disaster/disaster-grid.js

import { selectVoiceMode } from "../voice/voice-mode.js";

// ---------------------------------------------
// Disaster Types Seven Understands
// ---------------------------------------------
export const DISASTER_TYPES = {
  FIRE: "fire",
  FLOOD: "flood",
  TORNADO: "tornado",
  EARTHQUAKE: "earthquake",
  CHEMICAL: "chemical",
  STRUCTURAL: "structural",
  MEDICAL: "medical",
  UNKNOWN: "unknown"
};

// ---------------------------------------------
// Severity Levels
// ---------------------------------------------
export const SEVERITY = {
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
  CRITICAL: "critical"
};

// ---------------------------------------------
// Main Disaster Grid Engine
// ---------------------------------------------
export function analyzeDisasterGrid(input) {
  const { text, sensors = {}, role } = input;

  const detected = detectDisaster(text, sensors);
  const severity = classifySeverity(detected, sensors);
  const zone = determineImpactZone(detected, sensors);
  const routing = generateRouting(detected, severity, zone);
  const mode = selectVoiceMode(role, severityToPriority(severity));

  return {
    detected,
    severity,
    zone,
    routing,
    mode,
    priority: severityToPriority(severity),
    spokenText: buildSpokenResponse(detected, severity, zone),
    displayText: buildDisplayResponse(detected, severity, zone),
    actions: buildActions(detected, severity, zone)
  };
}

// ---------------------------------------------
// Disaster Detection (NLP + Sensor Fusion)
// ---------------------------------------------
function detectDisaster(text, sensors) {
  const t = text.toLowerCase();

  if (t.includes("fire") || sensors.temperature > 180) return DISASTER_TYPES.FIRE;
  if (t.includes("flood") || sensors.waterLevel > 0.7) return DISASTER_TYPES.FLOOD;
  if (t.includes("tornado") || sensors.windSpeed > 120) return DISASTER_TYPES.TORNADO;
  if (t.includes("earthquake") || sensors.seismic > 5.0) return DISASTER_TYPES.EARTHQUAKE;
  if (t.includes("chemical") || sensors.airQuality < 30) return DISASTER_TYPES.CHEMICAL;
  if (t.includes("collapse") || sensors.structuralIntegrity < 0.4) return DISASTER_TYPES.STRUCTURAL;
  if (t.includes("injury") || t.includes("medical emergency")) return DISASTER_TYPES.MEDICAL;

  return DISASTER_TYPES.UNKNOWN;
}

// ---------------------------------------------
// Severity Classification
// ---------------------------------------------
function classifySeverity(type, sensors) {
  switch (type) {
    case DISASTER_TYPES.FIRE:
      return sensors.temperature > 300 ? SEVERITY.CRITICAL : SEVERITY.HIGH;

    case DISASTER_TYPES.FLOOD:
      return sensors.waterLevel > 0.9 ? SEVERITY.CRITICAL : SEVERITY.MODERATE;

    case DISASTER_TYPES.TORNADO:
      return sensors.windSpeed > 150 ? SEVERITY.CRITICAL : SEVERITY.HIGH;

    case DISASTER_TYPES.EARTHQUAKE:
      return sensors.seismic > 6.5 ? SEVERITY.CRITICAL : SEVERITY.HIGH;

    case DISASTER_TYPES.CHEMICAL:
      return sensors.airQuality < 15 ? SEVERITY.CRITICAL : SEVERITY.HIGH;

    case DISASTER_TYPES.STRUCTURAL:
      return sensors.structuralIntegrity < 0.2 ? SEVERITY.CRITICAL : SEVERITY.HIGH;

    case DISASTER_TYPES.MEDICAL:
      return SEVERITY.MODERATE;

    default:
      return SEVERITY.LOW;
  }
}

// ---------------------------------------------
// Impact Zone Determination
// ---------------------------------------------
function determineImpactZone(type, sensors) {
  return {
    lat: sensors.lat || null,
    lon: sensors.lon || null,
    radius: calculateRadius(type, sensors)
  };
}

function calculateRadius(type, sensors) {
  switch (type) {
    case DISASTER_TYPES.FIRE:
      return sensors.temperature / 10;
    case DISASTER_TYPES.FLOOD:
      return sensors.waterLevel * 100;
    case DISASTER_TYPES.TORNADO:
      return sensors.windSpeed * 0.5;
    case DISASTER_TYPES.EARTHQUAKE:
      return sensors.seismic * 10;
    default:
      return 50;
  }
}

// ---------------------------------------------
// Routing Logic (Evacuation / Tactical / EMT)
// ---------------------------------------------
function generateRouting(type, severity, zone) {
  if (severity === SEVERITY.CRITICAL) {
    return "evacuate_north";
  }
  if (type === DISASTER_TYPES.MEDICAL) {
    return "route_to_medical";
  }
  if (type === DISASTER_TYPES.STRUCTURAL) {
    return "avoid_collapse_zone";
  }
  return "maintain_position";
}

// ---------------------------------------------
// Priority Mapping
// ---------------------------------------------
function severityToPriority(severity) {
  switch (severity) {
    case SEVERITY.CRITICAL:
      return "critical";
    case SEVERITY.HIGH:
      return "emergency";
    case SEVERITY.MODERATE:
      return "warning";
    default:
      return "normal";
  }
}

// ---------------------------------------------
// Spoken Response Builder
// ---------------------------------------------
function buildSpokenResponse(type, severity, zone) {
  return `Disaster detected: ${type}. Severity level ${severity}. Impact radius ${zone.radius} meters.`;
}

// ---------------------------------------------
// Display Response Builder
// ---------------------------------------------
function buildDisplayResponse(type, severity, zone) {
  return `> SEVEN: ${type.toUpperCase()} detected. Severity: ${severity}. Radius: ${zone.radius}m.`;
}

// ---------------------------------------------
// Action Builder (Map, Drone, Alerts)
// ---------------------------------------------
function buildActions(type, severity, zone) {
  const actions = [];

  actions.push({
    type: "MARK_ZONE",
    lat: zone.lat,
    lon: zone.lon,
    radius: zone.radius
  });

  if (severity === SEVERITY.CRITICAL) {
    actions.push({ type: "DEPLOY_DRONE" });
    actions.push({ type: "SEND_ALERT" });
  }

  if (type === DISASTER_TYPES.MEDICAL) {
    actions.push({ type: "SHOW_VITALS" });
  }

  return actions;
}
