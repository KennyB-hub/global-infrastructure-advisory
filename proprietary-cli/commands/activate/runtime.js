function activateRuntime(manifest) {
  return {
    status: "online",
    trustZones: manifest.backend.config?.["govervance"]?.["trust-zone-definitions"],
    autonomy: manifest.engines["ai.autonomy"],
    policy: manifest.engines["policy-object"]
  };
}

const runtime = activateRuntime(manifest);
console.log("Runtime:", runtime.status);
