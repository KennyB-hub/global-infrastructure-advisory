import { KeyEngine } from "../../../system/security/key-engine.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/admin/login" && request.method === "POST") {
      const { email, password, otp } = await request.json();

      const keyEngine = new KeyEngine(env);

      // Validate OTP
      const valid = await keyEngine.validateKey(otp, email);
      if (!valid) {
        return new Response("Invalid or expired key", { status: 403 });
      }

      // Validate password (your logic)
      if (password !== env.ADMIN_PASSWORD) {
        return new Response("Invalid credentials", { status: 403 });
      }

      // Success
      return Response.redirect("/admin/dashboard", 302);
    }

    return new Response("Not Found", { status: 404 });
  }
};
