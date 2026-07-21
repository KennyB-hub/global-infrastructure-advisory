import { storageInspector } from "./storage-inspector.js";
import { makeOk, makeError } from "../utils/context.js";

export async function inspectStorage(env) {
  const cf = env?.cf;

  if (!cf) {
    return makeError("Cloudflare environment missing", env);
  }

  try {
    const report = await storageInspector(cf);
    return makeOk(report, env);
  } catch (err) {
    return makeError("Storage inspection failed", env, { message: err.message });
  }
}
