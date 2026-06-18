/**
 * © 2026 Global Infrastructure Advisory
 * Project Search Worker — Resilient Mode
 */

import { runResilientProjectSearch } from "../backend/hubs-logic/resilient-search.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/search-projects" && request.method === "POST") {
      const { lat, lon } = await request.json();

      const results = await runResilientProjectSearch(
        lat,
        lon,
        env.PRIMARY_GSA_ENDPOINT
      );

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};
