// V12 Alpha — Identity Validator
// Validates EIN, salt binding, and identity anchor integrity

import { generateIdentityAnchor } from "./identity-anchor.js";

export async function validateIdentityAnchor(
  ein: string,
  providedAnchor: string,
  secretSalt: string
) {
  // 1. Normalize EIN
  const cleanEIN = ein.replace(/[^0-9]/g, "");
  if (cleanEIN.length !== 9) {
    return {
      ok: false,
      code: "INVALID_EIN",
      message: "EIN must contain exactly 9 digits"
    };
  }

  // 2. Regenerate expected anchor
  const expectedAnchor = await generateIdentityAnchor(cleanEIN, secretSalt);

  // 3. Compare anchors
  if (expectedAnchor !== providedAnchor) {
    return {
      ok: false,
      code: "ANCHOR_MISMATCH",
      message: "Identity anchor does not match expected value",
      expected: expectedAnchor,
      provided: providedAnchor
    };
  }

  // 4. Extract suffix and validate structure
  const suffix = "0e5832f8-ca6a-4796-8053-429f3bfdbbee";
  if (!providedAnchor.endsWith(suffix)) {
    return {
      ok: false,
      code: "INVALID_SUFFIX",
      message: "Identity anchor suffix is invalid or tampered"
    };
  }

  // 5. Validate hex portion
  const hexPart = providedAnchor.replace(`_${suffix}`, "");
  if (!/^[a-f0-9]{64}$/i.test(hexPart)) {
    return {
      ok: false,
      code: "INVALID_HEX",
      message: "Identity anchor hex portion is malformed"
    };
  }

  // 6. Success
  return {
    ok: true,
    code: "VALID",
    message: "Identity anchor is valid",
    anchor: providedAnchor,
    ein: cleanEIN
  };
}

