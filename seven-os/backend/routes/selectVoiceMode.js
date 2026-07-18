// routes/selectVoiceMode.js

export function selectVoiceMode(role, priority = "normal") {

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
