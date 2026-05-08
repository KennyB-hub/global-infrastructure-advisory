// 2050 V12 Alpha — Frontend Worker Guard
// Protects UI trust-zones, hub boundaries, and workflow access

export function frontendGuard({ trustZone, workflow, hub }) {
  const blocked = [
    // Public cannot access any protected hub
    { trustZone: "public", hub: "gov" },
    { trustZone: "public", hub: "admin" },
    { trustZone: "public", hub: "system" },

    // Farmer cannot access contractor hub
    { trustZone: "farmer", hub: "contractor" },

    // Contractor cannot access farmer hub
    { trustZone: "contractor", hub: "farmer" },

    // Apps cannot access gov/admin/system hubs
    { trustZone: "apps", hub: "gov" },
    { trustZone: "apps", hub: "admin" },
    { trustZone: "apps", hub: "system" }
  ];

  const hit = blocked.find(
    r => r.trustZone === trustZone && r.hub === hub
  );

  if (hit) {
    return {
      allowed: false,
      reason: "UI_ZONE_BLOCKED"
    };
  }

  return { allowed: true };
}
