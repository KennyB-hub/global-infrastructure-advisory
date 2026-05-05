import { routeEwo } from "../../system/routing/ewo-router.js";
import { requireRole } from "../../system/trust/api-trust.js";

export async function handleEwoDispatch(request) {
  const trust = requireRole("system", request);

  if (!trust.allowed) {
    return trust.response;
  }

  const body = await request.json();
  const route = routeEwo(body);

  return new Response(JSON.stringify(route), {
    status: route.routed ? 200 : 400,
    headers: { "Content-Type": "application/json" }
  });
}
