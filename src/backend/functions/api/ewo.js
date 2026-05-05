import { routeEwo } from "../../system/routing/ewo-router.js";

export async function handleEwoDispatch(request) {
  const body = await request.json();
  const route = routeEwo(body);

  return new Response(JSON.stringify(route), {
    status: route.routed ? 200 : 400,
    headers: { "Content-Type": "application/json" }
  });
}
