const RULES = [
  // Public cannot touch gov/system workflows
  { zone: "public", pathPrefix: "/api/gov/", allow: false },
  { zone: "public", pathPrefix: "/api/system/", allow: false },

  // Gov cannot use public‑only debug endpoints (if any)
  // (optional, for symmetry)
];

export function applyPolicy({ request, path, zone }) {
  const hit = RULES.find(
    r => r.zone === zone && path.startsWith(r.pathPrefix)
  );
  const templates = loadRuntime().templates;

  if (hit && hit.allow === false) {
    return { allowed: false, reason: "POLICY_BLOCKED_CROSS_DOMAIN" };
  }

  return { allowed: true };
}
