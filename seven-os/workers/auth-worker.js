/**
 * © 2026 Global Infrastructure Advisory
 * Authentication Worker — Identity Anchor Gateway
 */

import { processAIRequest } from "../ai/engines/ai-core.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // LOGIN
    if (url.pathname === "/auth/login" && request.method === "POST") {
      const payload = await request.json();

      const result = await processAIRequest(
        {
          text: "auth login",
          trustZone: "public",
          ...payload
        },
        env
      );

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // VERIFY IDENTITY
    if (url.pathname === "/auth/verify" && request.method === "POST") {
      const payload = await request.json();

      const result = await processAIRequest(
        {
          text: "auth verify identity",
          trustZone: "admin",
          identityHash: payload.identityHash
        },
        env
      );

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // LOGOUT
    if (url.pathname === "/auth/logout" && request.method === "POST") {
      return new Response(
        JSON.stringify({
          status: "logged_out",
          timestamp: Date.now()
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response("Not Found", { status: 404 });
  }
};
