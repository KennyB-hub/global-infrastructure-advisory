const ROLE_ZONES = {
  public: ["public"],
  farmer: ["public", "farmer"],
  contractor: ["public", "contractor"],
  admin: ["admin"],
  gov: ["gov"],
  system: ["system"]
};

export function requireRole(requiredZone, request, env) {
  const token = request.headers.get("Authorization") || "";
  const role = decodeRoleFromToken(token); // your logic

  const allowedZones = ROLE_ZONES[role] || [];
  const allowed = allowedZones.includes(requiredZone);

  if (!allowed) {
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({ ok: false, error: { code: "FORBIDDEN" } }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    };
  }

  return { allowed: true, role, userId: extractUserId(token) };
}
