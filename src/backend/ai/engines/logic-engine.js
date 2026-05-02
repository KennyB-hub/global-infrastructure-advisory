// Decision logic for routing, dispatch, sector workflows
export class LogicEngine {
  // Basic rule engine
  evaluateRules(rules, context) {
    for (const rule of rules) {
      if (rule.when(context)) {
        return rule.then(context);
      }
    }
    return null;
  }

  // Priority resolver
  resolvePriority(items) {
    return items.sort((a, b) => b.priority - a.priority)[0];
  }

  // Sector router
  routeToSector(input) {
    const map = {
      "veteran": "vets",
      "education": "education",
      "job": "jobs",
      "contract": "contracts",
      "payment": "payments",
      "hr": "hr"
    };

    return map[input.toLowerCase()] || "general";
  }
}
