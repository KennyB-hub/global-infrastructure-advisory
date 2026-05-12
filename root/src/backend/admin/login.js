login.js
import { KeyEngine } from "./key-engine.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/admin/login" && request.method === "POST") {
      const form = await request.formData();
      const email = form.get("email");
      const password = form.get("password");
      const otp = form.get("otp");

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
