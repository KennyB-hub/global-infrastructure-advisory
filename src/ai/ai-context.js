/**
 * AI Context Builder — Sandbox Layer
 * Builds lightweight context for the intelligence engine.
 */

export async function buildAIContext(payload, env) {
  return {
    timestamp: Date.now(),
    trustZone: payload.trustZone || "public",
    identityHash: payload.identityHash || null,
    environment: env.ENVIRONMENT || "unknown",
    platformVersion: env.PLATFORM_VERSION || "unknown",
    queryPreview: (payload.query || "").slice(0, 50)
  };
}
