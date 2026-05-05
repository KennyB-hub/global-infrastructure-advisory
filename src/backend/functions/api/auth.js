// src/backend/functions/api/auth.js
export async function handleAuthWhoAmI(request) {
  const role = request.headers.get("X-Role") || "public";

  return new Response(JSON.stringify({
    role,
    timestamp: Date.now()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export async function handleAuthRoles(request) {
  const role = request.headers.get("X-Role") || "public";

  // TODO: map role to capabilities
  return new Response(JSON.stringify({
    role,
    capabilities: [],
    timestamp: Date.now()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
