// /src/security/clearance-guard.js
export function clearanceGuard(payload, requiredLevel) {
  if (!payload || !payload.clearance) return false;

  const levels = ["PUBLIC", "C1", "B2", "A1"];
  const userLevel = levels.indexOf(payload.clearance);
  const required = levels.indexOf(requiredLevel);

  return userLevel >= required;
}
