// GIA API Root
// Thin HTTP surface that delegates to internal handlers

import { handleEwoDispatch } from "./ewo.js";
import { handleSectorStatus } from "./sector-status.js";

export async function handleApiRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/ewo/dispatch" && request.method === "POST") {
    return handleEwoDispatch(request);
  }

  if (path.startsWith("/api/sector/") && path.endsWith("/status")) {
    return handleSectorStatus(request);
  }

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
