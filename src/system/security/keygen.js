// 2050 V12 Alpha — Sovereign One-Time Session Key Engine
// Zone-bound, DB-bound, IP-bound, UA-bound, workflow-bound

export class KeyEngine {
  constructor(env) {
    this.env = env;
  }

  // ---------------------------------------------------------
  // Generate a one-time session key
  // ---------------------------------------------------------
  async generateKey({ userId, email, zone, db, workflow, request }) {
    const now = Date.now();

    // Device fingerprint
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ua = request.headers.get("User-Agent") || "unknown";

    // Random key + nonce
    const key = crypto.randomUUID();
    const nonce = crypto.randomUUID();

    const expires = now + 5 * 60 * 1000; // 5 minutes

    const record = {
      key,
      userId,
      email,
      zone,          // public | apps | farmer | contractor | admin | gov | system
      db,            // DB_PUBLIC | DB_APPS | DB_GOV | DB_ADMIN | DB_SYSTEM
      workflow,      // e.g., zoning-check, blueprint-generate
      ip,
      ua,
      nonce,
      created: now,
      expires,
      used: false
    };

    await this.env.KEYS.put(`session:${key}`, JSON.stringify(record), {
      expirationTtl: 300
    });

    return {
      key,
      zone,
      db,
      workflow,
      expires,
      nonce
    };
  }

  // ---------------------------------------------------------
  // Validate a one-time session key
  // ---------------------------------------------------------
  async validateKey({ key, requiredZone, requiredDB, requiredWorkflow, request }) {
    const data = await this.env.KEYS.get(`session:${key}`);
    if (!data) return { valid: false, reason: "NOT_FOUND" };

    const record = JSON.parse(data);

    // 1. Already used?
    if (record.used) return { valid: false, reason: "USED" };

    // 2. Zone mismatch?
    if (record.zone !== requiredZone) {
      return { valid: false, reason: "ZONE_MISMATCH" };
    }

    // 3. DB mismatch?
    if (record.db !== requiredDB) {
      return { valid: false, reason: "DB_MISMATCH" };
    }

    // 4. Workflow mismatch?
    if (requiredWorkflow && record.workflow !== requiredWorkflow) {
      return { valid: false, reason: "WORKFLOW_MISMATCH" };
    }

    // 5. Expired?
    if (Date.now() > record.expires) {
      return { valid: false, reason: "EXPIRED" };
    }

    // 6. IP mismatch?
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (record.ip !== ip) {
      return { valid: false, reason: "IP_MISMATCH" };
    }

    // 7. User-Agent mismatch?
    const ua = request.headers.get("User-Agent") || "unknown";
    if (record.ua !== ua) {
      return { valid: false, reason: "UA_MISMATCH" };
    }

    // 8. Mark as used (one-time)
    record.used = true;
    await this.env.KEYS.put(`session:${key}`, JSON.stringify(record), {
      expirationTtl: 30
    });

    return {
      valid: true,
      userId: record.userId,
      email: record.email,
      zone: record.zone,
      db: record.db,
      workflow: record.workflow,
      nonce: record.nonce
    };
  }
}

