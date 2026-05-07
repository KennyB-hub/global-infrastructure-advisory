// 2050 V12 Alpha — Sovereign DB Service
// Zone-bound, partition-aware, integrity-safe

import { ZONE_DB_MAP } from "./db-map.js";

export class DBService {
  constructor(env) {
    this.env = env;
  }

  // ---------------------------------------------------------
  // Resolve DB partition by zone
  // ---------------------------------------------------------
  getDB(zone) {
    const dbName = ZONE_DB_MAP[zone];
    if (!dbName) throw new Error(`INVALID_DB_ZONE: ${zone}`);

    const db = this.env[dbName];
    if (!db) throw new Error(`DB_NOT_BOUND: ${dbName}`);

    return db;
  }

  // ---------------------------------------------------------
  // Execute SQL safely
  // ---------------------------------------------------------
  async query(zone, sql, params = []) {
    try {
      const db = this.getDB(zone);
      const result = await db.prepare(sql).bind(...params).all();
      return { ok: true, rows: result.results || result };
    } catch (err) {
      return {
        ok: false,
        error: err.message,
        sql,
        params
      };
    }
  }

  // ---------------------------------------------------------
  // KV Get (namespaced)
  // ---------------------------------------------------------
  async getKV(namespace, key) {
    const fullKey = `${namespace}:${key}`;
    return await this.env.KV.get(fullKey);
  }

  // ---------------------------------------------------------
  // KV Put (namespaced + TTL)
  // ---------------------------------------------------------
  async putKV(namespace, key, value, ttl = null) {
    const fullKey = `${namespace}:${key}`;
    const opts = ttl ? { expirationTtl: ttl } : {};
    return await this.env.KV.put(fullKey, value, opts);
  }

  // ---------------------------------------------------------
  // KV Delete
  // ---------------------------------------------------------
  async deleteKV(namespace, key) {
    const fullKey = `${namespace}:${key}`;
    return await this.env.KV.delete(fullKey);
  }
}
