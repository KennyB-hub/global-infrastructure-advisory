// /src/security/middleware.js
import { validateToken } from "./validate-token.js";
import { requireAdmin } from "./require-admin.js";

export function secure(handler, options = {}) {
  return async (request, env, ctx) => {
    const tokenCheck = await validateToken(request);
    if (!tokenCheck.valid) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (options.adminOnly) {
      const adminCheck = requireAdmin(tokenCheck.payload);
      if (!adminCheck) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    return handler(request, env, ctx, tokenCheck.payload);
  };
}
