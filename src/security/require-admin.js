// /backend/security/require-admin.js
export function requireAdmin(payload) {
  if (!payload || !payload.role) return false;
  return payload.role === "admin" || payload.clearance === "A1";
}
