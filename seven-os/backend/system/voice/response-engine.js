// system/voice/response-engine.js

import { matchVoiceCommand } from "./command-matcher.js";
import { fallbackAskToLearn, fallbackAskIntent, fallbackStoreLearned } from "./command-fallback.js";
import { selectVoiceMode } from "../../routes/selectVoiceMode.js";


// ---------------------------------------------
// MAIN RESPONSE ENGINE
// ---------------------------------------------
export async function generateSevenResponse({ text, role, sessionId, learn, learnIntent }) {
  const cleaned = text.trim();

  // ---------------------------------------------
  // 1. Handle learning flow
  // ---------------------------------------------
  if (learn && learn.phrase && learn.confirm === true) {
    // User said "yes, learn it"
    return fallbackAskIntent(learn.phrase, role);
  }

  if (learnIntent && learnIntent.phrase && learnIntent.intent) {
    // User provided the intent for the new command
    return fallbackStoreLearned(learnIntent.phrase, role, learnIntent.intent);
  }

  // ---------------------------------------------
  // 2. Match command (built-in, learned, fuzzy)
  // ---------------------------------------------
  const match = matchVoiceCommand(cleaned, role);

  if (!match) {
    // Unknown → ask user if Seven should learn it
    return fallbackAskToLearn(cleaned, role);
  }

  // ---------------------------------------------
  // 3. Route to intent handler
  // ---------------------------------------------
  const response = await routeIntent(match, { text: cleaned, role, sessionId });

  // ---------------------------------------------
  // 4. Add hybrid voice mode
  // ---------------------------------------------
  response.mode = selectVoiceMode(role, response.priority);

  return response;
}

// ---------------------------------------------
// INTENT ROUTER (Seven’s operational switchboard)
// ---------------------------------------------
async function routeIntent(match, context) {
  const { intent, priority, source, pattern } = match;

  switch (intent) {

    // ---------------------------------------------
    // AGRICULTURE
    // ---------------------------------------------
    case "agri.cattle.locate":
      return {
        spokenText: "Your cattle are clustered near the south pasture fence.",
        displayText: "> SEVEN: Cattle cluster detected near south pasture fence.",
        priority,
        actions: [{ type: "FOCUS_MAP", target: "herd_cluster_south" }]
      };

    case "agri.boundary.check":
      return {
        spokenText: "All boundaries are stable. No drift detected.",
        displayText: "> SEVEN: Boundary sweep complete. All stable.",
        priority,
        actions: []
      };

    case "agri.route.safe":
      return {
        spokenText: "Safe route identified. Proceed north for 300 meters.",
        displayText: "> SEVEN: Safe route uploaded.",
        priority,
        actions: [{ type: "DRAW_ROUTE", target: "safe_corridor_north" }]
      };

    // ---------------------------------------------
    // ENGINEERING
    // ---------------------------------------------
    case "eng.equipment.check":
      return {
        spokenText: "Equipment diagnostics are nominal. No faults detected.",
        displayText: "> SEVEN: Equipment scan complete.",
        priority,
        actions: [{ type: "SCAN_EQUIPMENT" }]
      };

    case "eng.site.hazard":
      return {
        spokenText: "Hazard sweep complete. One unstable zone detected near the east trench.",
        displayText: "> SEVEN: Hazard detected near east trench.",
        priority,
        actions: [{ type: "MARK_HAZARD", target: "east_trench" }]
      };

    // ---------------------------------------------
    // EMERGENCY / EMT
    // ---------------------------------------------
    case "emt.vitals.check":
      return {
        spokenText: "Vitals stable. Pulse 82. Respiration normal.",
        displayText: "> SEVEN: Patient vitals stable.",
        priority,
        actions: [{ type: "SHOW_VITALS" }]
      };

    case "emt.route.hospital":
      return {
        spokenText: "Fastest route to the nearest hospital is uploaded.",
        displayText: "> SEVEN: Hospital route ready.",
        priority,
        actions: [{ type: "DRAW_ROUTE", target: "nearest_hospital" }]
      };

    // ---------------------------------------------
    // TACTICAL / RESCUE
    // ---------------------------------------------
    case "tac.survivor.scan":
      return {
        spokenText: "Thermal scan active. One heat signature detected northwest.",
        displayText: "> SEVEN: Survivor detected northwest.",
        priority,
        actions: [{ type: "FOCUS_THERMAL", target: "survivor_nw" }]
      };

    case "tac.drone.deploy":
      return {
        spokenText: "Drone deployed. Establishing aerial feed.",
        displayText: "> SEVEN: Drone launched.",
        priority,
        actions: [{ type: "DEPLOY_DRONE" }]
      };

    // ---------------------------------------------
    // FALLBACK (should never hit here)
    // ---------------------------------------------
    default:
      return {
        spokenText: "I do not have a handler for that intent.",
        displayText: "> SEVEN: Missing handler.",
        priority: "normal",
        actions: []
      };
  }
}
