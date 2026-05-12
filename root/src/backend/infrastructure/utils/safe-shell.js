// src/backend/infrastructure/utils/safe-shell.js

import { makeOk, makeError } from "src/backend/utils/context.js";

export async function safeShell(env, command, options = {}) {
  if (!command || typeof command !== "string") {
    return makeError("Invalid command", env, { command });
  }

  // In Workers you’d proxy to a backend or simulate; placeholder:
  try {
    const result = { stdout: "", stderr: "", code: 0, simulated: true, command, options };
    return makeOk(result, env);
  } catch (err) {
    return makeError("Shell execution failed", env, { message: err.message });
  }
}
