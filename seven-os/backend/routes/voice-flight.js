import { generateSevenResponse } from "../system/voice/response-engine.js";
import { orchestrateMission } from "../system/mission/mission-orchestrator.js";

export async function handleVoiceFlight(input) {
  try {
    const { text, role, sessionId, sensors, resources } = input;

    if (!text) {
      return {
        spokenText: "I did not receive any input.",
        displayText: "> SEVEN: No input detected.",
        priority: "normal",
        mode: selectVoiceMode(role, "normal"),
        actions: []
      };
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
      return orchestrateMission({
        text,
        role,
        sessionId,
        sensors: sensors || {},
        resources: resources || {}
      });
    }

    // ---------------------------------------------
    // ⭐ 2. Normal Voice Command → Seven Response Engine
    // ---------------------------------------------
    return await generateSevenResponse({
      text,
      role,
      sessionId
    });

  } catch (err) {
    console.error("Voice Flight Error:", err);
    return {
      spokenText: "A system error occurred.",
      displayText: "> SEVEN: System error.",
      priority: "critical",
      mode: "emergency",
      actions: []
    };
  }
}

function selectVoiceMode(role, priority = "normal") {

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
