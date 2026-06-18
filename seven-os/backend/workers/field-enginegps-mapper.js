// TOP SECURITY: Azure Function endpoint and API Key stored in Cloudflare Secrets
// Use 'wrangler secret put AZURE_GPS_LOG_URL' to set these securely.
interface Env {
  AZURE_GPS_LOG_URL: string;
  AZURE_FUNCTION_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 1. Only allow POST requests for job site data
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      // 2. Extract Field Data (GPS Coordinates + Contractor ID)
      const siteData = await request.json();
      const { contractorId, latitude, longitude, sitePhotoId } = siteData;

      // 3. Validation: Ensure we have the minimum intelligence to map the site
      if (!latitude || !longitude || !contractorId) {
        return new Response("Missing critical GPS or ID data", { status: 400 });
      }

      // 4. Secure Hand-off to Azure Backend
      // We use a Fetch request to our secure Azure Function
      const azureResponse = await fetch(env.AZURE_GPS_LOG_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-functions-key": env.AZURE_FUNCTION_KEY, // Secret Key
          "X-GIA-Worker-Pulse": "Active" // Heartbeat signal
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          contractorId,
          coords: { lat: latitude, lon: longitude },
          sitePhotoId,
          edgeLocation: request.cf?.colo // Logs which Cloudflare data center processed this
        }),
      });

      if (!azureResponse.ok) {
        throw new Error("Azure Log Sync Failed");
      }

      // 5. Success: Trigger UI to show "Blueprint Generator Ready"
      return new Response(JSON.stringify({ 
        status: "Mapped", 
        message: "Job site coordinates locked in Azure." 
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      // TOP SECURITY: Log the error internally but don't leak details to the browser
      console.error("GPS Mapping Error:", err);
      return new Response("Secure Log Sync Error", { status: 500 });
    }
  },
};
