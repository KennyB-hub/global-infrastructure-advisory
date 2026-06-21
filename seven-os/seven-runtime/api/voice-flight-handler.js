import { VoiceBus } from seven("seven-os/voice/voice-bus.ts");

export async function voiceFlightHandler(payload) {
  const { message, role, sessionId, sensors, resources } = payload;

  const result = await VoiceBus.process({
    text: message,
    role,
    sessionId,
    sensors,
    resources
  });

  return {
    displayText: result.displayText,
    spokenText: result.spokenText,
    priority: result.priority || "info",
    actions: result.actions || []
  };
}
