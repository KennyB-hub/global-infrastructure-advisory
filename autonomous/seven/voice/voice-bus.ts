// seven/voice/voice-bus.ts

import { generateSevenResponse } from ".ai/response-engine.js";
import { orchestrateMission } from "ai/engines/system/voice/mission/mission-orchestrator.js";

export const VoiceBus = {
  async dispatch({ text, role, sessionId, sensors, resources }) {

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

    return generateSevenResponse({
      text,
      role,
      sessionId
    });
  }
};