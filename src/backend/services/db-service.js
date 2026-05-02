// /backend/services/db-service.js
export class DBService {
  constructor(env) {
    this.env = env;
    this.db = env.DB; // D1 Database binding
  }

  async query(sql, params = []) {
    try {
      const result = await this.db.prepare(sql).bind(...params).all();
      return result;
    } catch (err) {
      return { error: true, message: err.message };
    }
  }

  async getKV(key) {
    return await this.env.KV.get(key);
  }

  async putKV(key, value, ttl = null) {
    return await this.env.KV.put(key, value, ttl ? { expirationTtl: ttl } : {});
  }
}
