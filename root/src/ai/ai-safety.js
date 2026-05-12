export function sanitizeAIInput(payload) {
  const q = (payload.query || "").toLowerCase();

  if (
    q.includes("bypass") ||
    q.includes("exploit") ||
    q.includes("ddos") ||
    q.includes("scan network")
  ) {
    return { blocked: true, reason: "malicious_intent" };
  }

  return { blocked: false, payload };
}

export function sanitizeAIOutput(output) {
  if (!output) return { error: "Empty output" };
  delete output.internalDebug;
  delete output.stack;
  return output;
}
