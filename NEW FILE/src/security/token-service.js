// /src/security/token-service.js
import { SignJWT, jwtVerify } from "jose";

export class TokenService {
  constructor(env) {
    this.secret = new TextEncoder().encode(env.JWT_SECRET);
  }

  async issue(payload) {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(this.secret);
  }

  async verify(token) {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return payload;
    } catch {
      return null;
    }
  }
}
