// backend/routes/farmer-routes.js

export async function handleFarmerRequest(request) {
  // 🛡️ LOCK 1: Identity Pinning
  // We extract the email from the Cloudflare header. 
  // If the Gatekeeper failed, this header will be empty, and we STOP.
  const userEmail = request.headers.get("Cf-Access-Authenticated-User-Email");
  
  if (!userEmail) {
    return new Response("SECURITY ALERT: Identity Missing", { status: 403 });
  }

  // 🛡️ LOCK 2: Path Restriction
  // Even inside this file, we ensure the user is NOT trying to jump to the executive-vault
  const url = new URL(request.url);
  if (url.pathname.includes("executive") || url.pathname.includes("vault")) {
     // Log this as a "Back Door Attempt"
     console.error(`Backdoor attempt blocked from: ${userEmail}`);
     return new Response("UNAUTHORIZED: Path Restricted", { status: 401 });
  }

  // 🛡️ LOCK 3: Sandboxed Response
  // We only return data that is safe for World A.
  return new Response(JSON.stringify({ 
    hub: "Farmer-GIA",
    status: "Active",
    sessionUser: userEmail, // Confirms to the user who they are
    data: "GPS coordinates received and scrubbed" 
  }), { headers: { 'Content-Type': 'application/json' } });
}
