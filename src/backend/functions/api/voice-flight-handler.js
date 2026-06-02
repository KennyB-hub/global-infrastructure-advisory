async function voiceFlightHandler(payload) {
  const { message } = payload;

  // Seven’s intent engine
  if (message.toLowerCase().includes('diagnostic')) {
    return {
      displayText: "> SEVEN: Voice diagnostic complete.",
      spokenText: "Voice diagnostic complete. All systems operational.",
      priority: "info"
    };
  }

  return {
    displayText: "> SEVEN: Command received.",
    spokenText: "Command received.",
    priority: "info"
  };
}

module.exports = { voiceFlightHandler };
