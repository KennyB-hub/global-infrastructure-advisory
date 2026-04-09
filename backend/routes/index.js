// Import the files we just made in the routes folder
import { gatekeeper } from './routes/auth-gateway.js';
import { handleFarmerRequest } from './routes/farmer-routes.js';
import { handleExecutiveRequest } from './routes/executive-routes.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. RUN THE GATEKEEPER FIRST
    // This stops anyone without a valid ID before they even see the data
    const authError = await gatekeeper(request);
    if (authError) return authError;

    // 2. ROUTE TO WORLD A (Farmers)
    // If the URL contains "/farmer", send them to the Farmer Hub logic
    if (url.pathname.startsWith("/api/farmer")) {
      return await handleFarmerRequest(request);
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
