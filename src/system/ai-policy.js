export function enforceAIPolicy({ trustZone, workflow }) {
  const blocked = [
    // --- Public cannot access sensitive workflows ---
    { trustZone: "public", workflow: "gov-sectors" },
    { trustZone: "public", workflow: "system-heartbeat" },
    { trustZone: "public", workflow: "gov-intel" },

    // --- Public cannot use AIM at all ---
    { trustZone: "public", workflow: "aim-farmer" },
    { trustZone: "public", workflow: "aim-contractor" },
    { trustZone: "public", workflow: "aim-gov" },
    { trustZone: "public", workflow: "aim-apps" },

    // --- Farmer cannot access contractor or gov AIM ---
    { trustZone: "farmer", workflow: "aim-contractor" },
    { trustZone: "farmer", workflow: "aim-gov" },

    // --- Contractor cannot access farmer or gov AIM ---
    { trustZone: "contractor", workflow: "aim-farmer" },
    { trustZone: "contractor", workflow: "aim-gov" },

    // --- Gov can access all AIM modes (optional) ---
    // No blocks for gov
  ];

  const hit = blocked.find(
    r => r.trustZone === trustZone && r.workflow === workflow
  );

  if (hit) {
    return { allowed: false, reason: "AI_POLICY_BLOCKED" };
  }

  return { allowed: true };
}
