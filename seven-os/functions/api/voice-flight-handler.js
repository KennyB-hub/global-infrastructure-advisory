// src/functions/api/voiceFlightHandler.js

import { VoiceBus } from "../../../system/voice/voice-bus.js";

export async function voiceFlightHandler(payload) {
  const { message, role = "farmer", sessionId = "local-demo", sensors = {}, resources = {} } = payload;

  if (!message) {
    return {
      displayText: "> SEVEN: No input detected.",
      spokenText: "I did not receive any input.",
      priority: "normal",
      mode: "rural",
      actions: []
    };
  }

  // ⭐ Route everything through Seven’s unified voice bus
  const result = await VoiceBus.dispatch({
    text: message,
    role,
    sessionId,
    sensors,
    resources
  });

  return result;
}
