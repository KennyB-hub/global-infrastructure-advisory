export function enforceAIPolicy({ trustZone, workflow }) {
  const blocked = [
    { trustZone: "public", workflow: "gov-sectors" },
    { trustZone: "public", workflow: "system-heartbeat" },
    { trustZone: "public", workflow: "gov-intel" }
  ];

  const hit = blocked.find(
    r => r.trustZone === trustZone && r.workflow === workflow
  );

  if (hit) return { allowed: false, reason: "AI_POLICY_BLOCKED" };
  return { allowed: true };
}
