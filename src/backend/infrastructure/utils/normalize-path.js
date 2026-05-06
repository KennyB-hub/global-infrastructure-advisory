// src/backend/infrastructure/utils/normalize-path.js

export function normalizePath(path) {
  if (!path) return "/";
  return (
    "/" +
    path
      .trim()
      .replace(/^\/+/, "")
      .replace(/\/+/g, "/")
  );
}
