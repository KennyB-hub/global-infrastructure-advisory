import { DBService } from "../db/db-service.js";

export class KeyEngine {
  constructor(env) {
    this.env = env;
    this.db = new DBService(env);
  }

  async getKey(id) {
    const res = await this.db.query(
      "system",
      `SELECT * FROM keys WHERE id = ? LIMIT 1`,
      [id]
    );
    return (res.rows || [])[0] || null;
  }

  async validateKey({ keyId, requiredTrustZone, requiredScope }) {
    const key = await this.getKey(keyId);
    if (!key) return { ok: false, reason: "KEY_NOT_FOUND" };

    if (key.status !== "active") {
      return { ok: false, reason: "KEY_NOT_ACTIVE" };
    }

    const now = Date.now();
    if (key.expires_ts && key.expires_ts < now) {
      return { ok: false, reason: "KEY_EXPIRED" };
    }

    if (requiredTrustZone && key.trust_zone !== requiredTrustZone) {
      return { ok: false, reason: "KEY_TRUST_ZONE_MISMATCH" };
    }

    if (requiredScope) {
      let scopes = [];
      try { scopes = JSON.parse(key.scopes || "[]"); } catch { scopes = []; }
      if (!scopes.includes(requiredScope)) {
        return { ok: false, reason: "KEY_SCOPE_DENIED" };
      }
    }

    await this.db.query(
      "system",
      `UPDATE keys SET last_used_ts = ? WHERE id = ?`,
      [now, key.id]
    );

    return { ok: true, key };
  }
}
