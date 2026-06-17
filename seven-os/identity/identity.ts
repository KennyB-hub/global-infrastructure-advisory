// V12 Alpha — Identity Anchor Generator
// Produces a stable, deterministic, cryptographically valid anchor

export async function generateIdentityAnchor(
  ein: string,
  secretSalt: string
): Promise<string> {

  // 1. Normalize EIN (remove dashes, spaces)
  const cleanEIN = ein.replace(/[^0-9]/g, "");

  // 2. Blend EIN + Salt
  const encoder = new TextEncoder();
  const data = encoder.encode(`${cleanEIN}:${secretSalt}`);

  // 3. SHA‑256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // 4. Convert to hex
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  // 5. Append stable sovereign anchor suffix
  const anchorSuffix = "0e5832f8-ca6a-4796-8053-429f3bfdbbee";

  return `${hex}_${anchorSuffix}`;
}
