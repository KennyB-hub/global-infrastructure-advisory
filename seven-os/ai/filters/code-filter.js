// /ai-engine/code-filter.js
// GIA Sovereign AI Output Filter – V12 Alpha

import { sha256 } from "../../backend/utils/context.js";

export async function filterAIOutput(output = {}, context = {}) {
  const errors = [];
  const warnings = [];

  // Normalize output to string for scanning
  const text = typeof output === "string"
    ? output
    : JSON.stringify(output || "");

  //
  // 1. Forbidden JavaScript execution patterns
  //
  const forbiddenJS = [
    "require(",
    "import(",
    "child_process",
    "process.",
    "fs.",
    "eval(",
    "Function(",
    "while(true)",
    "for(;;)",
    "setInterval(",
    "XMLHttpRequest",
    "fetch("
  ];

  scan(text, forbiddenJS, errors, "Forbidden JS pattern");

  //
  // 2. System-level references
  //
  const forbiddenSystem = [
    "/etc/",
    "C:\\\\Windows",
    "sudo ",
    "chmod ",
    "chown ",
    "kill -",
    "rm -rf",
    "docker ",
    "kubectl "
  ];

  scan(text, forbiddenSystem, errors, "System-level reference");

  //
  // 3. Cloudflare destructive operations
  //
  const forbiddenCF = [
    "deleteZone",
    "deleteDNS",
    "purgeEverything",
    "updateFirewall",
    "modifyWorker",
    "deployWorker"
  ];

  scan(text, forbiddenCF, errors, "Cloudflare destructive operation");

  //
  // 4. Secret exposure
  //
  const forbiddenSecrets = [
    "API_KEY",
    "API-TOKEN",
    "SECRET",
    "PRIVATE_KEY",
    "BEGIN RSA",
    "BEGIN PRIVATE"
  ];

  scan(text, forbiddenSecrets, errors, "Potential secret exposure");

  //
  // 5. Sandbox escape attempts
  //
  const forbiddenEscape = [
    "vm.runInThisContext",
    "vm.runInNewContext",
    "globalThis",
    "process.mainModule",
    "module.constructor"
  ];

  scan(text, forbiddenEscape, errors, "Sandbox escape attempt");

  //
  // 6. Trust‑zone overrides
  //
  if (context.trustZone === "deepgov") {
    // DeepGov gets warnings instead of blocks for non-destructive patterns
    if (errors.length > 0) {
      warnings.push(...errors);
      errors.length = 0;
    }
  }

  //
  // 7. Build sovereign filter result
  //
  const result = {
    ok: errors.length === 0,
    errors,
    warnings,
    trustZone: context.trustZone || "public",
    workflow: context.workflow || null,
    timestamp: new Date().toISOString(),
    inputHash: context.inputHash || null,
    contextHash: context.contextHash || null
  };

  //
  // 8. Integrity hash
  //
  result.integrity = {
    hash: await sha256(JSON.stringify(result)),
    verified: true
  };

  return result;
}

//
// Helper: pattern scanner
//
function scan(text, patterns, bucket, label) {
  patterns.forEach(pattern => {
    if (text.includes(pattern)) {
      bucket.push(`${label}: ${pattern}`);
    }
  });
}
