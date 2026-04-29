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

// backend/routes/air-gap-sync.js

export async function syncToExecutiveVault(farmerData) {
  console.log("🛡️ Initializing NATO Intelligence Scrub...");

  // 1. DATA STRIPPING (Identity Guard)
  // We keep the GPS and Story, but remove the Farmer's Name, Email, and IP.
  const scrubbedData = {
    timestamp: new Date().toISOString(),
    region: farmerData.region,
    coordinates: generalizeCoordinates(farmerData.lat, farmerData.lon),
    narrative: sanitizeText(farmerData.story),
    assetType: "PILOT_FARMER_FEED"
  };

  // 2. VAULT PUSH
  // This sends the clean data to your 📂 edge-vault/
  const success = await pushToEdgeVault(scrubbedData);
  
  if (success) {
    console.log("✅ NATO Feed Updated: Data is now available in the Command Center.");
  }
}

// Logic to round GPS coordinates to avoid pinpointing a specific house
function generalizeCoordinates(lat, lon) {
  return `${parseFloat(lat).toFixed(2)}, ${parseFloat(lon).toFixed(2)}`;
}

// Logic to strip metadata and sensitive keywords
function sanitizeText(text) {
  // Removes common PII patterns and metadata
  return text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g, "[REDACTED_EMAIL]");
}
