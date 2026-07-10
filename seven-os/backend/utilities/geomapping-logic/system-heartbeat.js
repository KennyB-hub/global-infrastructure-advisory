/**
 * © 2026 Global Infrastructure Advisory
 * System Heartbeat Monitor — GISA Resilience v1
 */

export const checkSystemPulse = async (primaryEndpoint) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(primaryEndpoint, {
      method: "HEAD",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) return "ONLINE";
    return "DEGRADED";

  } catch {
    return "OFFLINE";
  }
};
