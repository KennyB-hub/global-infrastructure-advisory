const intentFields: Record<string, string[]> = {
  "cattle-load-create": ["origin", "destination", "headCount", "earliestPickup", "latestPickup"],
  "cattle-load-match": ["loadId"],
  "public-rental-agreement": ["location"],
  "contractor-bid-generator": ["jobType", "location"],
  "gov-compliance-pack": ["program"],
  // etc…
};

function findMissingField(intent: string, context: any): string | null {
  const fields = intentFields[intent] || [];
  for (const f of fields) {
    if (context[f] == null) return f;
  }
  return null;
}
