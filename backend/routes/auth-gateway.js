// A "Gatekeeper" snippet for your auth-gateway.js
export default {
  async fetch(request) {
    const jwt = request.headers.get("Cf-Access-Jwt-Assertion");
    
    // 1. If trying to reach World B (NATO/DoD)
    if (request.url.includes("/edge-vault")) {
       const identity = await verifyIdentity(jwt);
       // Check if they used mTLS/Hardware Key
       if (identity.auth_type !== 'mtls') {
         return new Response("UNAUTHORIZED: High-Security Clearance Required", { status: 403 });
       }
    }
    
    return fetch(request); // Let them through to World A
  }
}

export async function gatekeeper(request) {
  const authType = request.headers.get("cf-access-auth-type"); // Key verification header
  const isNATOPath = request.url.includes("/api/executive");

  if (isNATOPath) {
    // Correct Logic: MUST be mTLS (Cert) or WebAuthn (YubiKey)
    if (authType !== 'mtls' && authType !== 'webauthn') {
      console.error("ALERT: NATO Access Attempt without Hardware Key");
      return new Response("FORBIDDEN: Level 5 Hardware Clearance Required", { status: 403 });
    }
  }
  return null; // Pass to the next logic
}

