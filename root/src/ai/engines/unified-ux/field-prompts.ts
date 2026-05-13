function buildPromptForField(persona: Persona, intent: string, field: string): string {
  if (intent === "cattle-load-create") {
    if (field === "origin") return "Where are the cattle located?";
    if (field === "destination") return "Where do they need to go?";
    if (field === "headCount") return "How many head are you moving?";
    if (field === "earliestPickup") return "What’s the earliest pickup date?";
    if (field === "latestPickup") return "What’s the latest pickup date?";
  }

  if (intent === "public-rental-agreement" && field === "location") {
    return "What state is the rental property in?";
  }

  if (intent === "contractor-bid-generator" && field === "jobType") {
    return "What kind of job is this? (e.g., fencing, roofing, hauling)";
  }

  if (intent === "gov-compliance-pack" && field === "program") {
    return "Which program is this for? (e.g., agriculture, transportation)";
  }

  return "Can you tell me more about that?";
}
