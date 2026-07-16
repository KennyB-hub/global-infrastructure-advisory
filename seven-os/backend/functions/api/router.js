import { handleGlobalMap, handleSectorMap, handleLiveSectors, handleLiveRisk, handleLiveRoutes } from "./map.js";
import { handleSystemHealth, handleSystemUptime } from "./system.js";
import { handleAIMFarmer } from "../../functions/api/aim/farmer/index.js";
import { handleAIMGov } from "../../functions/api/aim/gov/index.js";
import { handleAIMSystem } from "../../functions/api/aim/system/index.js";
import { processAIRequest } from "../../engines/ai-router.js";
import { handleGetLatestCollars } from "./collars.js";

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

  // AUTONOMOUS TASK MANAGEMENT ENDPOINTS (Seven-of-Nine)
  if (path === "/api/autonomous/task/enqueue") {
    const req = { ...request, url: request.url };
    const inputBody = await request.json();
    const response = await processAIRequest({ ...req, json: async () => ({ ...inputBody, workflow: "task-enqueue", taskType: inputBody.taskType, payload: inputBody.payload }) }, {});
    return response;
  }

  if (path === "/api/autonomous/task/status") {
    const inputBody = await request.json();
    const response = await processAIRequest(request, { ...inputBody, workflow: "task-status", taskId: inputBody.taskId });
    return response;
  }

  if (path === "/api/autonomous/task/process") {
    const response = await processAIRequest(request, { workflow: "task-process" });
    return response;
  }

  if (path === "/api/autonomous/task/list") {
    const inputBody = await request.json().catch(() => ({}));
    const response = await processAIRequest(request, { workflow: "task-list", status: inputBody.status });
    return response;
  }

  // AI ENGINE ENDPOINTS (AI Router)
  if (path === "/api/ai/process") {
    return processAIRequest(request, {});
  }

  if (path === "/api/autonomous/collars/latest") {
    // Returns latest collar states from Redis
    const response = await handleGetLatestCollars(request, {});
    return response;
  }

  return new Response(JSON.stringify({ error: "Unknown endpoint" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
