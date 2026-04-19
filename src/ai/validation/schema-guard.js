/**
 * Schema Guard v3.0
 * ------------------
 * Validates AI output before it is allowed to run, store, or be used.
 * Prevents unsafe code, disallowed modules, invalid structures,
 * and enforces trust boundaries.
 */

export function validateAIOutput(output) {
  const errors = [];

  // --- 1. Ensure output exists ---
  if (!output) {
    errors.push("Output is empty or undefined.");
    return { valid: false, errors };
  }

  // --- 2. Enforce object structure ---
  if (typeof output !== "object") {
    errors.push("AI output must be an object.");
    return { valid: false, errors };
  }

  // --- 3. Require a 'type' field (minimal guard) ---
  if (!output.type) {
    errors.push("Missing 'type' field on AI output.");
  }

  // --- 4. Prevent dangerous code patterns ---
  const forbiddenPatterns = [
    "require(",
    "import(",
    "child_process",
    "fs.writeFile",
    "fs.unlink",
    "process.env",
    "while(true)",
    "eval(",
    "Function(",
    "fetch(" // optional: block network calls
  ];

  const outputString = JSON.stringify(output);

  forbiddenPatterns.forEach(pattern => {
    if (outputString.includes(pattern)) {
      errors.push(`Forbidden pattern detected: ${pattern}`);
    }
  });

  // --- 5. Enforce trust boundaries ---
  const trustZones = ["public", "internal", "secure"];

  if (output.trustZone && !trustZones.includes(output.trustZone)) {
    errors.push(`Invalid trust zone: ${output.trustZone}`);
  }

  // --- 6. Validate code blocks (if present) ---
  if (output.code) {
    if (typeof output.code !== "string") {
      errors.push("Code block must be a string.");
    }

    if (output.code.includes("fs.")) {
      errors.push("File system access is not allowed in AI-generated code.");
    }

    if (output.code.includes("process.")) {
      errors.push("Process access is not allowed in AI-generated code.");
    }
  }

  // --- 7. Validate actions (if present) ---
  if (output.action) {
    const allowedActions = ["analyze", "summarize", "simulate", "generate"];

    if (!allowedActions.includes(output.action)) {
      errors.push(`Action '${output.action}' is not permitted.`);
    }
  }

  // --- 8. Validate metadata ---
  if (output.metadata && typeof output.metadata !== "object") {
    errors.push("Metadata must be an object.");
  }

  // --- 9. Final result ---
  return {
    valid: errors.length === 0,
    errors
  };
}
