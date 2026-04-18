// © 2026 Global Infrastructure Advisory
// AI Governor v1.1 — With Auto-Reset

export const checkAILoad = async (env) => {
  const now = new Date();
  const hourKey = `tasks_${now.getUTCFullYear()}_${now.getUTCMonth()}_${now.getUTCDate()}_${now.getUTCHours()}`;

  let taskCount = await env.WORKFORCE_KV.get(hourKey) || 0;
  taskCount = parseInt(taskCount);

  if (taskCount > 500) {
    console.error("⚠️ AI GOVERNOR: Hourly Limit Reached. Throttling GIA Node.");
    await env.WORKFORCE_KV.put("system_status", "THROTTLED");
    return false;
  }

  await env.WORKFORCE_KV.put(hourKey, (taskCount + 1).toString(), { expirationTtl: 3600 });
  return true;
};
