// system/voice/voice-bus.ts

import { generateSevenResponse } from "./response-engine.js";
import { orchestrateMission } from "../mission/mission-orchestrator.js";

export const VoiceBus = {
  async dispatch(payload) {
    const { text, role, sessionId, sensors, resources } = payload;

    // Mission detection
    const missionKeywords = [
      "fire","flood","tornado","earthquake",
      "collapse","chemical","injury","disaster",
      "explosion","hazmat","rescue","evacuate"
    ];

    const isMission = missionKeywords.some(k =>
      text.toLowerCase().includes(k)
    );

    if (isMission) {
      return orchestrateMission({
        text,
        role,
        sessionId,
        sensors,
        resources
      });
    }

    // Normal command
    return generateSevenResponse({
      text,
      role,
      sessionId
    });
  }
};
