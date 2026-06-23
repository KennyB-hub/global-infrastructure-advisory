// 2050 V12 Alpha — AI Output Sanitizer

export function sanitizeAIOutput(text) {
  // Basic trimming + whitespace normalization
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}
