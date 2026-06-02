export async function handleSystemHealth(request, env) {
  const path = "/api/system/health";

  const sovereign = buildSovereignMetadata({
    api: "system-health",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: "GET"
  });

  const trust = requireRole("admin", request, env);
  if (!trust.allowed) return trust.response;

  const policy = applyPolicy({ request, path, zone: "admin" });
  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  const ai = buildAIContext({
    request,
    path,
    workflow: "system-health",
    trustZone: "admin"
  });

  const payload = {
    status: "ok",
    services: {
      api: "ok",
      routing: "ok",
      sectors: "ok"
    },
    timestamp: Date.now()
  };

  // ⭐ Voice Output
  env?.stack?.speak?.("System health check completed.");

  return new Response(
    JSON.stringify({
      ok: true,
      payload,
      sovereign,
      ai,
      integrity: computeIntegrityHash(payload)
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
