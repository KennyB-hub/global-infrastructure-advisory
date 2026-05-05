import { getRole } from "./role.js";

export async function api(path, options = {}) {
  const headers = options.headers || {};
  headers["X-Role"] = getRole();

  const res = await fetch(path, {
    ...options,
    headers
  });

  return res.json();
}
