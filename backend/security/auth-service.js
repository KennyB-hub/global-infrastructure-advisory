auth-service.js
// /backend/security/auth-service.js
// Core authentication service for Admin Mission Control
// Handles: password validation, OTP validation, session creation

import { KeyEngine } from "./key-engine.js";

export class AuthService {
  constructor(env) {
    this.env = env;
    this.keyEngine = new KeyEngine(env);
  }

  // Hash a password using subtle crypto (Worker-safe)
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // Validate password against stored hash
  async validatePassword(inputPassword, storedHash) {
    const inputHash = await this.hashPassword(inputPassword);
    return inputHash === storedHash;
  }

  // Validate OTP using KeyEngine
  async validateOTP(email, otp) {
    return await this.keyEngine.validateKey(otp, email);
  }

  // Create a session token (simple, Worker-safe)
  async createSession(email) {
    const raw = crypto.getRandomValues(new Uint8Array(32));
    const token = btoa(String.fromCharCode(...raw))
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 48);

    const session = {
      email,
      token,
      created: Date.now(),
      expires: Date.now() + 60 * 60 * 1000 // 1 hour
    };

    await this.env.SESSIONS.put(`session:${token}`, JSON.stringify(session), {
      expirationTtl: 3600
    });

    return token;
  }

  // Validate session token
  async validateSession(token) {
    const data = await this.env.SESSIONS.get(`session:${token}`);
    if (!data) return false;

    const session = JSON.parse(data);
    if (Date.now() > session.expires) return false;

    return session;
  }

  // Full login flow
  async login(email, password, otp) {
    // 1. Validate OTP
    const otpValid = await this.validateOTP(email, otp);
    if (!otpValid) {
      return { success: false, error: "Invalid or expired one-time key" };
    }

    // 2. Validate password
    const storedHash = await this.env.ADMIN_PASSWORD_HASH;
    const passwordValid = await this.validatePassword(password, storedHash);

    if (!passwordValid) {
      return { success: false, error: "Invalid password" };
    }

    // 3. Create session
    const token = await this.createSession(email);

    return {
      success: true,
      token,
      redirect: "/admin/dashboard"
    };
  }
}
