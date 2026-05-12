// 2050 V12 Alpha — AI Input Filter

const BLOCKED_PATTERNS = [
  /password/i,
  /social security/i,
  /credit card/i
];

export function filterAIInput(text) {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        allowed: false,
        reason: "SENSITIVE_CONTENT"
      };
    }
  }

  return { allowed: true };
}
