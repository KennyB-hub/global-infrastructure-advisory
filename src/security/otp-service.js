// /backend/security/otp-service.js
export class OTPService {
  constructor(env) {
    this.env = env;
  }

  async generate(userId) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.env.OTP.put(userId, code, { expirationTtl: 300 });
    return code;
  }

  async validate(userId, code) {
    const stored = await this.env.OTP.get(userId);
    if (!stored) return false;
    return stored === code;
  }
}
