// /backend/ai/identity.js
export class Identity {
  constructor(env) {
    this.env = env;
  }

  getMetadata(request) {
    return {
      ip: request.headers.get("CF-Connecting-IP") || "unknown",
      ua: request.headers.get("User-Agent") || "unknown",
      timestamp: Date.now(),
      source: "AI-CORTEX"
    };
  }
}
