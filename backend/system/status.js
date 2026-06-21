// Inside your Worker fetch() handler
if (url.pathname === "/system/status" && request.method === "GET") {
  const timestamp = Date.now();

  const status = {
    system: "GIA Sovereign System Status – V12 Alpha",
    name: "GIA Deep Mind 2100",
    status: "online",

    engine: manifest.engine,
    version: manifest.version,
    environment: manifest.environment,
    features: manifest.features,

    //
    // V12 Alpha sovereign metadata
    //
    platform: {
      id: manifest.platform_id,
      version: manifest.version,
      failsafe: manifest.failsafe_level,
      active_sectors: manifest.active_sectors,
      endpoints: manifest.endpoints
    },

    nodes: manifest.nodes || [],
    clusters: manifest.clusters || [],

    ai: {
      decisionEngine: "/api/decision",
      cortex: "/api/cortex",
      deepMind: "/api/deep-mind",
      engineAvailable: typeof env?.AI?.run === "function",
      status: typeof env?.AI?.run === "function" ? "ready" : "offline"
    },

    trustZones: {
      public: { level: 1 },
      contractor: { level: 2 },
      farmer: { level: 2 },
      employee: { level: 3 },
      admin: { level: 4 },
      gov: { level: 5 },
      deepgov: { level: 6 },
      system: { level: 7 }
    },

    timestamp,
    iso: new Date(timestamp).toISOString()
  };

  //
  // Integrity hash
  //
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(status));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = [...new Uint8Array(hashBuffer)];
  const integrityHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  status.integrity = {
    hash: integrityHash,
    verified: true
  };

  return new Response(JSON.stringify(status, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "GIA-Platform-ID": manifest.platform_id,
      "GIA-Version": manifest.version
    }
  });
}

