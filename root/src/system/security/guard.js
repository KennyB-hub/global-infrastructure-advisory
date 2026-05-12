// 2050 V12 Alpha — Frontend Worker Guard (Defense‑Aware)
// Protects UI trust-zones, hub boundaries, workflow access, and defense surfaces

export function frontendGuard({ trustZone, workflow, hub }) {
  const blocked = [
    //
    // PUBLIC
    //
    { trustZone: "public", hub: "gov" },
    { trustZone: "public", hub: "admin" },
    { trustZone: "public", hub: "system" },
    { trustZone: "public", hub: "defense" },     // NEW
    { trustZone: "public", workflow: "cyber-defense" },
    { trustZone: "public", workflow: "aim-defense" },

    //
    // FARMER
    //
    { trustZone: "farmer", hub: "contractor" },
    { trustZone: "farmer", hub: "defense" },     // NEW
    { trustZone: "farmer", workflow: "cyber-defense" },
    { trustZone: "farmer", workflow: "aim-defense" },

    //
    // CONTRACTOR
    //
    { trustZone: "contractor", hub: "farmer" },
    { trustZone: "contractor", hub: "defense" }, // NEW
    { trustZone: "contractor", workflow: "cyber-defense" },
    { trustZone: "contractor", workflow: "aim-defense" },

    //
    // APPS
    //
    { trustZone: "apps", hub: "gov" },
    { trustZone: "apps", hub: "admin" },
    { trustZone: "apps", hub: "system" },
    { trustZone: "apps", hub: "defense" },       // NEW
    { trustZone: "apps", workflow: "cyber-defense" },
    { trustZone: "apps", workflow: "aim-defense" }

    //
    // GOV + SYSTEM have NO blocks here.
    // They can access:
    // - GovHub Threat Dashboard
    // - SystemHub Cyber Command
    // - Defense Hub
    // - AIM Defense Mode
    // - Cyber Defense workflows
    //
  ];

  const hit = blocked.find(
    r =>
      r.trustZone === trustZone &&
      (r.hub === hub || r.workflow === workflow)
  );

  if (hit) {
    return {
      allowed: false,
      reason: "UI_ZONE_BLOCKED"
    };
  }

  return { allowed: true };
}
