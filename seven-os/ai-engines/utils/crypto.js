// seven-os/ai/crypto.js
// GIA Sovereign Crypto Utilities – V12

export const CryptoV12 = {
  /**
   * SHA‑256 hashing (hex output)
   */
  async sha256(input) {
    const data = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(hash)]
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  },

  /**
   * HMAC signing (SHA‑256)
   */
  async hmac(secret, message) {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(message)
    );

    return [...new Uint8Array(signature)]
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  },

  /**
   * Secure random ID (32 bytes → hex)
   */
  randomId() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return [...bytes]
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  },

  /**
   * Request integrity token
   */
  async integrityToken(payload, secret) {
    const body = JSON.stringify(payload);
    return await this.hmac(secret, body);
  },

  /**
   * Verify integrity token
   */
  async verifyIntegrity(payload, secret, token) {
    const expected = await this.integrityToken(payload, secret);
    return expected === token;
  }
};
