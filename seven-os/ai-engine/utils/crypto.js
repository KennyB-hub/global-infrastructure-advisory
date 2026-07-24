// seven-os/ai/crypto.js
// GIA Sovereign Crypto Utilities – V13 (Vault-Backed Asymmetric Layer)

// Replace this with your dynamic environment configuration path
const VAULT_ADDR = process.env.VAULT_ADDR || "http://127.0.0.1:8200";
const VAULT_TOKEN = process.env.VAULT_TOKEN;
const KEY_NAME = "sevenos-contract-signer";

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
   * Request compliance-grade Asymmetric Digital Signature from Vault Transit
   * Replaces the vulnerable local HMAC method.
   */
  async requestVaultSignature(message) {
    if (!VAULT_TOKEN) {
      throw new Error("CRITICAL: VAULT_TOKEN environment variable is not configured.");
    }

    // 1. Vault Transit requires payloads to be Base64 encoded
    const base64Input = btoa(unescape(encodeURIComponent(message)));

    // 2. Transmit payload to Vault hardware-isolated signing path
    try {
      const response = await fetch(`${VAULT_ADDR}/v1/transit/sign/${KEY_NAME}`, {
        method: "POST",
        headers: {
          "X-Vault-Token": VAULT_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input: base64Input })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Vault API Rejected Request: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      return result.data.signature; // Returns compliant ed25519 cryptographic signature proof
    } catch (error) {
      console.error("Sovereign Identity Layer Failure:", error);
      throw error;
    }
  },

  /**
   * Request integrity token using secure Vault-backed signature
   */
  async integrityToken(payload) {
    const body = JSON.stringify(payload);
    // No longer passing a dangerous raw secret string over the network
    return await this.requestVaultSignature(body);
  },

  /**
   * Verify integrity token directly using Vault's verification endpoint
   */
  async verifyIntegrity(payload, token) {
    const body = JSON.stringify(payload);
    const base64Input = btoa(unescape(encodeURIComponent(body)));

    try {
      const response = await fetch(`${VAULT_ADDR}/v1/transit/verify/${KEY_NAME}`, {
        method: "POST",
        headers: {
          "X-Vault-Token": VAULT_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          input: base64Input,
          signature: token
        })
      });

      if (!response.ok) return false;
      const result = await response.json();
      return result.data.valid === true; // Returns cryptographically authenticated truth status
    } catch {
      return false;
    }
  }
};
