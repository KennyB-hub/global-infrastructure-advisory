function mapPersonaToTrustZone(persona: Persona): string {
  switch (persona) {
    case "farmer": return "farmer";
    case "public": return "public";
    case "contractor": return "contractor";
    case "gov": return "gov";
    default: return "public";
  }
}
