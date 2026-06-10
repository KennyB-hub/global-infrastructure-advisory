// 2050 V12 Alpha — AI Safety Guard

const DISALLOWED_OUTPUT = [
  /violence/i,
  /self-harm/i,
  /hate/i
];

export function checkAISafety(text) {
  for (const pattern of DISALLOWED_OUTPUT) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: "SAFETY_VIOLATION"
      };
    }
  }

  return { safe: true };
}
