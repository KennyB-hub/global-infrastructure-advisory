import { handleGlobalMap, handleSectorMap, handleLiveSectors, handleLiveRisk, handleLiveRoutes } from "./map.js";
import { handleSystemHealth, handleSystemUptime } from "./system.js";
import { handleAIMFarmer } from "../../functions/api/aim/farmer/index.js";
import { handleAIMGov } from "../../functions/api/aim/gov/index.js";
import { handleAIMSystem } from "../../functions/api/aim/system/index.js";

export async function router(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // MAP ENDPOINTS
  if (path === "/api/map/global") return handleGlobalMap(request);
  if (path.startsWith("/api/map/sector/")) return handleSectorMap(request);
  if (path === "/api/map/sectors") return handleLiveSectors(request);
  if (path === "/api/map/risk") return handleLiveRisk(request);
  if (path === "/api/map/routes") return handleLiveRoutes(request);

  // SYSTEM ENDPOINTS
  if (path === "/api/system/health") return handleSystemHealth(request);
  if (path === "/api/system/uptime") return handleSystemUptime(request);

  // AIM ENDPOINTS
  if (path.startsWith("/api/aim/farmer")) return handleAIMFarmer(request);
  if (path.startsWith("/api/aim/gov")) return handleAIMGov(request);
  if (path.startsWith("/api/aim/system")) return handleAIMSystem(request);

  return new Response(JSON.stringify({ error: "Unknown endpoint" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
