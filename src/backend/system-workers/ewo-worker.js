// workers/ewo-worker.js
import { handleEWORequest } from "../backend/system/ewo/ewo-router.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/ewo/dispatch" && request.method === "POST") {
      return await handleEWORequest(request, env, ctx);
    }

    return new Response("Not Found", { status: 404 });
  }
};
