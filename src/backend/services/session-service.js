// /src/security/session-service.js
export class SessionService {
  constructor(env) {
    this.env = env;
  }

  async createSession(userId) {
    const sessionId = crypto.randomUUID();
    const expires = Date.now() + 1000 * 60 * 60; // 1 hour

    await this.env.SESSIONS.put(sessionId, JSON.stringify({ userId, expires }), {
      expirationTtl: 3600
    });

    return sessionId;
  }

  async validate(sessionId) {
    const data = await this.env.SESSIONS.get(sessionId);
    if (!data) return null;

    const session = JSON.parse(data);
    if (session.expires < Date.now()) return null;

    return session;
  }

  async destroy(sessionId) {
    await this.env.SESSIONS.delete(sessionId);
  }
}
