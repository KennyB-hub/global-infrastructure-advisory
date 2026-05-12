function inferIntent(persona: Persona, text: string, context: any) {
  const t = text.toLowerCase();

  if (persona === "farmer") {
    if (t.includes("move") && t.includes("head")) return "cattle-load-create";
    if (t.includes("hauler") || t.includes("truck")) return "cattle-load-match";
    if (t.includes("lease") || t.includes("rent")) return "farmer-document-lease";
  }

  if (persona === "public") {
    if (t.includes("rental") || t.includes("lease")) return "public-rental-agreement";
    if (t.includes("complaint")) return "public-complaint-letter";
    if (t.includes("notice")) return "public-notice-explainer";
  }

  if (persona === "contractor") {
    if (t.includes("bid") || t.includes("proposal")) return "contractor-bid-generator";
    if (t.includes("job") || t.includes("work")) return "contractor-find-jobs";
    if (t.includes("hauler") || t.includes("truck")) return "contractor-hauler-register";
  }

  if (persona === "gov") {
    if (t.includes("compliance") || t.includes("pack")) return "gov-compliance-pack";
    if (t.includes("risk")) return "gov-risk-analysis";
    if (t.includes("sector")) return "gov-sector-analysis";
  }

  return "general";
}
