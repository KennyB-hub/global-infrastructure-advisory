export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. CATCH THE SATELLITE SWEEP (Deep Mind Endpoint)
    if (url.pathname === "/api/deep-mind" && request.method === "POST") {
      try {
        // Here is where your soil telemetry/GPS logic lives
        const data = {
          status: "success",
          telemetry: "integrated",
          timestamp: new Date().toISOString()
        };
        
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response("Internal Brain Error", { status: 500 });
      }
    }

    // 2. CATCH THE HEARTBEAT
    if (url.pathname === "/api/heartbeat") {
       return new Response("OK", { status: 200 });
    }

    // 3. SHOW THE PUBLIC SIDE (index.html)
    // This serves the file where your <script> lives
    return await env.ASSETS.fetch(request);
  }
};

curl --request POST 'https://api.cloudflare.com/client/v4/accounts/006eb7beeef45ea15cb6117216a39d6d/access/policies' \
  --header 'Authorization: Bearer $API_TOKEN' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "name": "global-infrastructure-advisory - Production",
  "decision": "allow",
  "include": [
    {
      "email": {
        "email": "kennybennett11477@gmail.com"
      }
    }
  ],
  "exclude": [],
  "require": []
}'
