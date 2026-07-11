import { gatekeeper } from './auth-gateway.js';
import { handlePublicRequest } from './public-routes.js';
import { handleExecutiveRequest } from './executive-routes.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. RUN THE GATEKEEPER FIRST
    // This stops anyone without a valid ID before they even see the data
    const authError = await gatekeeper(request);
    if (authError) return authError;

    // 2. ROUTE TO WORLD A (Public / Farmer views)
    // If the URL contains "/public", send them to the public-route handler
    if (url.pathname.startsWith("/api/public") || url.pathname.startsWith("/public")) {
      return await handlePublicRequest(request);
    }

    // 3. ROUTE TO WORLD B (NATO / Executive)
    // If the URL contains "/executive", send them to the Command Center logic
    if (url.pathname.startsWith("/api/executive")) {
      return await handleExecutiveRequest(request);
    }

    // Default response if they hit a random URL
    return new Response("GIA Intelligence System: Path Not Found", { status: 404 });
  }
};
