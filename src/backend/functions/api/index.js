import { handleEwoDispatch } from "./ewo.js";
import { handleSectorStatus } from "./sector-status.js";
import { handleGlobalMap, handleSectorMap } from "./map.js";
import { handleAuthLogin } from "./auth-login.js";
import { handleAuthCallback } from "./auth-callback.js";

export async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
   
  if (path === "/api/map/global") {
  return handleGlobalMap(request);
}
  if (path === "/api/auth/login") {
  return handleAuthLogin(request);
}

  // EWO Dispatch
  if (path === "/api/ewo/dispatch" && request.method === "POST") {
    return handleEwoDispatch(request);
}

 // Sector Status
  if (path.startsWith("/api/sector/") && path.endsWith("/status")) {
    return handleSectorStatus(request);
}

  if (path === "/api/auth/callback") {
  return handleAuthCallback(request);
}

  if (path.startsWith("/api/map/sector/")) {
  return handleSectorMap(request);
}

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
