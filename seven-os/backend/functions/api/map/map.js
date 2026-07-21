// seven-os/backend/functions/api/map.js
import { getEnabledSectors, getSectorById } from "../../../system/sector-loader.js";
import { requireRole } from "../../../trust/engine.js";
import { handleSystemHealth, handleSystemUptime } from "../system.js";
// Live Data Handlers (V12 Alpha)
import { handleLiveSectors, handleLiveRisk, handleLiveRoutes } from "../../../../map/map-live.js";

export async function handleGlobalMap(request) {
  const trust = requireRole("public", request);
  if (!trust.allowed) return trust.response;

  const sectors = getEnabledSectors().map(s => s.id);

  return new Response(JSON.stringify({
    type: "global_map",
    sectors,
    timestamp: Date.now()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export async function handleSectorMap(request) {
  const trust = requireRole("contractor", request);
  if (!trust.allowed) return trust.response;

  const url = new URL(request.url);
  const sectorId = url.pathname.split("/")[4]; // /api/map/sector/{id}

  const sector = getSectorById(sectorId);
  if (!sector) {
    return new Response(JSON.stringify({ error: "Unknown sector" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (path === "/api/system/health") {
  return handleSystemHealth(request);
}

if (path === "/api/system/uptime") {
  return handleSystemUptime(request);
}

  // TODO: load real map data for sector
  return new Response(JSON.stringify({
    type: "sector_map",
    sector: sectorId,
    features: [],
    timestamp: Date.now()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
