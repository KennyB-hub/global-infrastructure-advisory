// worker.js (simplified core)
import { KeyEngine } from "./key-engine.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/admin/login" && request.method === "POST") {
      const form = await request.formData();
      const email = form.get("email");
      const password = form.get("password");
      const otp = form.get("otp");

      const keyEngine = new KeyEngine(env);

      const otpValid = await keyEngine.validateKey(otp, email);
      if (!otpValid) {
        return new Response("Invalid or expired key", { status: 403 });
      }

      if (password !== env.ADMIN_PASSWORD) {
        return new Response("Invalid credentials", { status: 403 });
      }

      return Response.redirect("/admin/dashboard", 302);
    }

    if (url.pathname === "/admin/generate-key" && request.method === "POST") {
      const form = await request.formData();
      const email = form.get("email");

      const keyEngine = new KeyEngine(env);
      const key = await keyEngine.generateKey(email);

      return new Response(key, {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};
