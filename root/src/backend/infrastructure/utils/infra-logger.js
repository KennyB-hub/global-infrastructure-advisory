// src/backend/infrastructure/utils/infra-logger.js

import { getPlatformContext, getNodeContext, getClusterContext } from "src/backend/utils/context.js";

export function infraLog(env, level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta,
    platform: getPlatformContext(),
    nodes: getNodeContext(),
    clusters: getClusterContext()
  };

  // eslint-disable-next-line no-console
  console.log("[INFRA]", JSON.stringify(entry));
  return entry;
}
