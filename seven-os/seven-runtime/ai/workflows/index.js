// Seven‑OS Worker — Canonical Version
// Purpose: Governance, routing, sector registry, integrity hooks

import { loadRoutingMap } from "../core/routing.js";
import { loadSectors } from "../core/sectors.js";
import { verifyIntegrity } from "../audit/integrity.js";

export default {
  async fetch(request, env, ctx) {
    // 1. Run integrity check (OS-level only)
    const integrityStatus = await verifyIntegrity();
    if (!integrityStatus.ok) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Seven‑OS integrity failure",
          details: integrityStatus
        }),
        { status: 500 }
      );
    }

    // 2. Load routing map
    const routing = await loadRoutingMap();
    if (!routing) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Routing map missing or invalid"
        }),
        { status: 500 }
      );
    }

    // 3. Load sector registry
    const sectors = await loadSectors();
    if (!sectors) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Sector registry missing or invalid"
        }),
        { status: 500 }
      );
    }

    // 4. Determine route
    const url = new URL(request.url);
    const route = routing[url.pathname];

    if (!route) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Route not found in Seven‑OS",
          path: url.pathname
        }),
        { status: 404 }
      );
    }

    // 5. Validate route target
    const sectorHandler = sectors[route.sector];
    if (!sectorHandler) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Sector handler missing",
          sector: route.sector
        }),
        { status: 500 }
      );
    }

    // 6. Forward to sector logic (OS-level only)
    return sectorHandler(request, env, ctx);
  }
};
