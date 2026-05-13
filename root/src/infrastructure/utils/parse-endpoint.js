// src/backend/infrastructure/utils/parse-endpoint.js

import { normalizePath } from "./normalize-path.js";

export function parseEndpoint(urlString) {
  const url = new URL(urlString);
  return {
    path: normalizePath(url.pathname),
    method: "GET", // caller should override
    host: url.host,
    protocol: url.protocol.replace(":", ""),
    query: Object.fromEntries(url.searchParams.entries())
  };
}
