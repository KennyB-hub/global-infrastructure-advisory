// /workers/protected-routes.js
// GIA Protected API Layer – V12 Alpha

import systemManifest from "../../../config/system-manifest.json" assert { type: "json" };

// Unified JSON responder
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "GIA-Platform-ID": systemManifest.platform_id,
      "GIA-Version": systemManifest.version,
      ...extraHeaders
    }
  });
}

export async function protectedRoutes(request, env, ctx, user) {
  const url = new URL(request.url);

  // ---------------------------------------------------------
  // /api/profile  → return authenticated user profile
  // ---------------------------------------------------------
  if (url.pathname === "/api/profile") {
    return json({
      ok: true,
      zone: "PROTECTED",
      user
    });
  }

  // ---------------------------------------------------------
  // /api/dispatch  → dispatch event / job / workflow
  // ---------------------------------------------------------
  if (url.pathname === "/api/dispatch") {
    return json({
      ok: true,
      zone: "PROTECTED",
      status: "Dispatch received",
      timestamp: Date.now()
    });
  }

  // ---------------------------------------------------------
  // Unknown protected route
  // ---------------------------------------------------------
  return json(
    {
      ok: false,
      error: "Protected route not found",
      path: url.pathname
    },
    404
  );
}

