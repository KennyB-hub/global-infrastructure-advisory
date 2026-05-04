key-engine.js
// key-engine.js
export class KeyEngine {
  constructor(env) {
    this.env = env;
  }

  async generateKey(email) {
    const raw = crypto.getRandomValues(new Uint8Array(32));
    const key = btoa(String.fromCharCode(...raw))
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 32);

    const expires = Date.now() + 5 * 60 * 1000;

    const record = { email, key, expires, used: false };

    await this.env.KEYS.put(`otp:${key}`, JSON.stringify(record), {
      expirationTtl: 300
    });

    return key;
  }

  async validateKey(key, email) {
    const data = await this.env.KEYS.get(`otp:${key}`);
    if (!data) return false;

    const record = JSON.parse(data);

    if (record.used) return false;
    if (record.email !== email) return false;
    if (Date.now() > record.expires) return false;

    record.used = true;
    await this.env.KEYS.put(`otp:${key}`, JSON.stringify(record), {
      expirationTtl: 30
    });

    return true;
  }
}
