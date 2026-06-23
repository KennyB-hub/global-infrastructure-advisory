// src/backend/infrastructure/tools/r2-uploader.js

import { makeOk, makeError } from "src/backend/utils/context.js";

export async function r2Upload(env, bucketName, key, body, options = {}) {
  const bucket = env[bucketName];
  if (!bucket) {
    return makeError("R2 bucket not bound", env, { bucketName });
  }

  try {
    await bucket.put(key, body, options);
    return makeOk({ bucket: bucketName, key, size: body?.length ?? null }, env);
  } catch (err) {
    return makeError("R2 upload failed", env, { bucketName, key, message: err.message });
  }
}
