// routes/voice-flight.js

import express from 'express';
export const router = express.Router();

// Seven Intelligence Modules
import { generateSevenResponse } from "../system/voice/response-engine.js";
import { orchestrateMission } from "../system/mission/mission-orchestrator.js";

// ---------------------------------------------
// MAIN ROUTE: /api/voice-flight
// ---------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { text, role, sessionId, sensors, resources } = req.body;

    if (!text) {
      return res.status(400).json({
        spokenText: "I did not receive any input.",
        displayText: "> SEVEN: No input detected.",
        priority: "normal",
        mode: selectVoiceMode(role, "normal"),
        actions: []
      });
    }

    console.log(`[VOICE-FLIGHT] (${role}) ${sessionId}: ${text}`);

    // ---------------------------------------------
    // ⭐ 1. Disaster / Mission Detection
    // ---------------------------------------------
    const missionKeywords = [
      "fire", "flood", "tornado", "earthquake",
      "collapse", "chemical", "injury", "disaster",
      "explosion", "hazmat", "rescue", "evacuate"
    ];

    const isMission = missionKeywords.some(k =>
      text.toLowerCase().includes(k)
    );

    if (isMission) {
      const mission = orchestrateMission({
        text,
        role,
        sessionId,
        sensors: sensors || {},
        resources: resources || {}
      });

      return res.json(mission);
    }

    // ---------------------------------------------
    // ⭐ 2. Normal Voice Command → Seven Response Engine
    // ---------------------------------------------
    const response = await generateSevenResponse({
      text,
      role,
      sessionId
    });

    return res.json(response);

  } catch (err) {
    console.error("Voice Flight Error:", err);
    return res.status(500).json({
      spokenText: "A system error occurred.",
      displayText: "> SEVEN: System error.",
      priority: "critical",
      mode: "emergency",
      actions: []
    });
  }
});

// ---------------------------------------------
// ⭐ Hybrid Voice Mode Selector (Seven-of-Nine)
// ---------------------------------------------
function selectVoiceMode(role, priority = "normal") {

  // Priority overrides role when danger is high
  if (priority === "critical") return "emergency";
  if (priority === "emergency") return "emergency";
  if (priority === "warning" && role === "rescue") return "tactical";

  switch (role) {
    case "farmer":
      return "rural";

    case "contractor":
      return "engineering";

    case "emt":
      return "emergency";

    case "rescue":
      return "tactical";

    default:
      return "rural";
  }
}
