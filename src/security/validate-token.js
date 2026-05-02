// /backend/security/validate-token.js
import { TokenService } from "./token-service.js";

export async function validateToken(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, reason: "Missing token" };
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const tokenService = new TokenService();

  const payload = await tokenService.verify(token);
  if (!payload) {
    return { valid: false, reason: "Invalid or expired token" };
  }

  return { valid: true, payload };
}
