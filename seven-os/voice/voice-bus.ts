// seven/voice/voice-bus.ts

import { generateSevenResponse } from "./response-engine.js";
import { orchestrateMission } from "../mission/mission-orchestrator.js";

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
