function buildHumanSummary(persona: Persona, intent: string, payload: any): string {
  if (intent === "cattle-load-create") {
    return `Move ${payload.headCount} head from ${payload.origin} to ${payload.destination} between ${payload.earliestPickup} and ${payload.latestPickup}.`;
  }
  if (intent === "public-rental-agreement") {
    return `Create a rental agreement for a property in ${payload.location}.`;
  }
  if (intent === "contractor-bid-generator") {
    return `Generate a bid for a ${payload.jobType} job in ${payload.location}.`;
  }
  if (intent === "gov-compliance-pack") {
    return `Generate a compliance pack for the ${payload.program} program.`;
  }
  return "General request.";
}
