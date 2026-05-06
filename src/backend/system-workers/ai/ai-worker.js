// /workers/ai/ai-worker.js
// GIA Sovereign AI Worker – V12 Alpha

import { AI } from "../../backend/ai/engine.js";
import { 
  validatePayload, 
  validateTrustZone, 
  validateEndpoint 
} from "../../backend/utils/validator.js";

import { makeOk, makeError } from "../../backend/utils/context.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // GET → debug metadata
    if (request.method !== "POST") {
      return new Response(JSON.stringify({
        system: "ai-worker",
        status: "online",
        instructions: "POST JSON to run AI with V12 Alpha validation"
      }, null, 2), { headers: { "Content-Type": "application/json" } });
    }

    // Parse JSON
    let payload;
    try {
      payload = await request.json();
    } catch (err) {
      return makeError("Invalid JSON body", env, { message: err.message });
    }

    //
    // 1. Validate trust zone
    //
    const trustCheck = await validateTrustZone(env, payload.trustZone || "public", 1);
    if (!trustCheck.ok) return new Response(JSON.stringify(trustCheck, null, 2));

    //
    // 2. Validate endpoint
    //
    const endpointCheck = await validateEndpoint(env, {
      path: url.pathname,
      method: request.method
    });
    if (!endpointCheck.ok) return new Response(JSON.stringify(endpointCheck, null, 2));

    //
    // 3. Validate payload schema
    //
    const schemaCheck = await validatePayload(env, payload, {
      input: { required: true, type: "object" },
      trustZone: { required: true, type: "string" },
      workflow: { required: false, type: "string" }
    });
    if (!schemaCheck.ok) return new Response(JSON.stringify(schemaCheck, null, 2));

    //
    // 4. Run AI engine
    //
    let result;
    try {
      result = await AI.run(payload, env);
    } catch (err) {
      return makeError("AI engine threw an exception", env, { message: err.message });
    }

    //
    // 5. Validate AI output
    //
    const outputCheck = await validatePayload(env, result, {
      type: { required: true, type: "string" },
      content: { required: true, type: "string" }
    });
    if (!outputCheck.ok) return new Response(JSON.stringify(outputCheck, null, 2));

    //
    // 6. Return sovereign‑grade response
    //
    const final = await makeOk({ payload, result }, env);
    return new Response(JSON.stringify(final, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
