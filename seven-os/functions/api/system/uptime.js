export async function handleSystemUptime(request, env) {
  const path = "/api/system/uptime";

  const sovereign = buildSovereignMetadata({
    api: "system-uptime",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: "GET"
  });

  const trust = requireRole("system", request, env);
  if (!trust.allowed) return trust.response;

  const policy = applyPolicy({ request, path, zone: "system" });
  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  const ai = buildAIContext({
    request,
    path,
    workflow: "system-uptime",
    trustZone: "system"
  });

  let uptimeMs;
  try {
    uptimeMs = getUptime();
  } catch (err) {
    return sovereignError("UPTIME_ENGINE_FAILURE", err.message, sovereign);
  }

  const payload = {
    uptime_ms: uptimeMs,
    timestamp: Date.now()
  };

  // ⭐ Voice Output
  env?.stack?.speak?.("System uptime check completed.");

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
