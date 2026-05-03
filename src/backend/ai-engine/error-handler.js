// backend/ai-engine/error-handler.js

export function handleError(err) {
  return {
    status: "error",
    message: err.message || "Unknown backend AI error"
  }
}
