// backend/system/identity/did-vc-verifier.js

import { resolveDID } from "../../workers/expansion/did.ts";
import { verifyVC } from "../../workers/expansion/vc.ts";

/**
 * DID / VC Identity Verifier (V12 Alpha)
 * Uses real DID + VC logic from TypeScript identity layer.
 */
export async function verifyDidVcIdentity(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return {
      valid: false,
      reason: "missing_token",
      trustZone: "public",
      subject: null,
      claims: {}
    };
  }

  // 1. Resolve DID
  const did = await resolveDID(token);
  if (!did.valid) {
    return {
      valid: false,
      reason: did.reason || "did_resolution_failed",
      trustZone: "public",
      subject: null,
      claims: {}
    };
  }

  // 2. Verify VC
  const vc = await verifyVC(did);
  if (!vc.valid) {
    return {
      valid: false,
      reason: vc.reason || "vc_verification_failed",
      trustZone: "public",
      subject: did.subject,
      claims: {}
    };
  }

  // 3. Extract claims
  const claims = vc.claims || {};
  const subject = did.subject;

  // 4. Map trust zone
  let trustZone = "public";
  if (claims.trustZone) trustZone = claims.trustZone;
  else if (claims.role === "deepgov" || claims.clearance === "TS") trustZone = "deepgov";
  else if (claims.role === "gov") trustZone = "gov";

  return {
    valid: true,
    reason: "ok",
    trustZone,
    subject,
    claims
  };
}
